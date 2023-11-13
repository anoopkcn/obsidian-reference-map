import React from 'react'
import { Root, createRoot } from 'react-dom/client'
import { ItemView, MarkdownView, WorkspaceLeaf } from 'obsidian'
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
			this.app.metadataCache.on('changed', (file) => {
				const activeView = this.app.workspace.getActiveViewOfType(MarkdownView)
				if (activeView && file === activeView.file) {
					this.processReferences()
				}
			})
		);

		this.registerEvent(
			this.app.workspace.on('active-leaf-change', (leaf) => {
				if (leaf) {
					this.app.workspace.iterateRootLeaves((rootLeaf) => {
						if (rootLeaf === leaf) {
							const viewType = rootLeaf.view.getViewType()
							if (viewType === 'empty' || viewType === 'markdown') this.processReferences()
						}
					})
				}
			})
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
	}

	processReferences = async () => {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView)
		const settings = this.plugin.settings
		if (activeView?.file) {
			this.updateChecker.basename = activeView.file.basename
			const fileCache = activeView.file ? await this.app.vault.cachedRead(activeView.file) : ''
			const fileMetadataCache = this.app.metadataCache.getFileCache(activeView.file);
			const isLibrary = settings.searchCiteKey && this.referenceMapData.library.libraryData !== null
			if (isLibrary && settings.autoUpdateCitekeyFile) this.referenceMapData.loadLibrary(false)
			this.updateChecker.setCache(fileCache, fileMetadataCache)
			const prefix = settings.findCiteKeyFromLinksWithoutPrefix ? '' : '@';
			this.updateChecker.checkIndexIdsUpdate()
			if (settings.searchCiteKey) this.updateChecker.checkCiteKeysUpdate(prefix, true)
			if (settings.searchFrontMatter) this.updateChecker.checkFrontmatterUpdate(settings.searchFrontMatterKey)
			if (settings.searchTitle) this.updateChecker.checkFileNameUpdate()
		} else {
			this.updateChecker.resetCache()
		}
		this.rootEl?.render(
			<AppContext.Provider value={this.app}>
				<ReferenceMapList
					plugin={this.plugin}
					referenceMapData={this.referenceMapData}
					updateChecker={this.updateChecker}
				/>
			</AppContext.Provider>
		)
	}
}
