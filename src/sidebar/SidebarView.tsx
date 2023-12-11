import React from 'react'
import { Root, createRoot } from 'react-dom/client'
import { ItemView, MarkdownView, WorkspaceLeaf, debounce } from 'obsidian'
import ReferenceMap from 'src/main'
import { t } from 'src/lang/helpers'
import { AppContext } from 'src/context'
import EventBus, { EVENTS } from 'src/events'
import { UpdateChecker } from 'src/data/updateChecker'
import { ReferenceMapData } from 'src/data/data'
import { ReferenceMapList } from './ReferenceMapList'

export const REFERENCE_MAP_VIEW_TYPE = 'reference-map-view'

export class SidebarView extends ItemView {
	plugin: ReferenceMap
	referenceMapData: ReferenceMapData
	rootEl: Root | null
	updateChecker: UpdateChecker;

	constructor(leaf: WorkspaceLeaf, plugin: ReferenceMap) {
		super(leaf)
		this.plugin = plugin
		this.referenceMapData = this.plugin.referenceMapData
		this.updateChecker = this.plugin.updateChecker
		this.rootEl = createRoot(this.containerEl.children[1])

		this.registerEvent(
			this.app.metadataCache.on(
				'changed',
				debounce(async (file) => {
					const activeFile = this.app.workspace.getActiveFile()
					if (activeFile && file === activeFile) {
						const updated = await this.referenceMapData.prepare(activeFile, this.app.vault, this.app.metadataCache)
						if (updated) {
							EventBus.trigger(EVENTS.UPDATE);
						}
					}
				}, 100, true)
			)
		);

		this.registerEvent(
			this.app.workspace.on(
				'active-leaf-change',
				(leaf) => {
					if (leaf) {
						this.app.workspace.iterateRootLeaves((rootLeaf) => {
							const viewType = leaf.view.getViewType()
							if (rootLeaf === leaf) {
								if (
									viewType === 'markdown' ||
									viewType === 'empty'
								) {
									this.processReferences()
								}
							}
						})
					}
				}
			)
		);

		this.registerDomEvent(document, 'pointerup', (evt) => {
			const selection = window.getSelection()?.toString().trim()
			EventBus.trigger(EVENTS.SELECTION, selection)
		});

		this.registerDomEvent(document, 'keyup', (evt) => {
			const selection = window.getSelection()?.toString().trim()
			EventBus.trigger(EVENTS.SELECTION, selection)
		});
	}

	getViewType() {
		return REFERENCE_MAP_VIEW_TYPE
	}

	getDisplayText() {
		return t('REFERENCE_MAP')
	}

	getIcon() {
		return 'ReferenceMapIconScroll'
	}

	async onOpen() {
		this.processReferences()
	}

	async onClose() {
		this.rootEl?.unmount()
		this.referenceMapData.viewManager.clearCache()
		return super.onClose()
	}
	onunload() {
		EventBus.off(EVENTS.SELECTION, () => { })
		EventBus.off(EVENTS.UPDATE, () => { });
	}

	processReferences = async () => {
		const activeFile = this.app.workspace.getActiveViewOfType(MarkdownView)?.file
		const localCards = await this.referenceMapData.getLocalReferences(this.updateChecker.citeKeyMap)
		await this.referenceMapData.prepare(activeFile, this.app.vault, this.app.metadataCache)

		this.rootEl?.render(
			<AppContext.Provider value={this.app}>
				<ReferenceMapList
					plugin={this.plugin}
					referenceMapData={this.referenceMapData}
					updateChecker={this.updateChecker}
					localCards={localCards}
				/>
			</AppContext.Provider>
		)
	}
}
