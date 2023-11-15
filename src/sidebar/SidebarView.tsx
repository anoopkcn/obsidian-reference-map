import React from 'react'
import { Root, createRoot } from 'react-dom/client'
import { ItemView, WorkspaceLeaf } from 'obsidian'
import ReferenceMap from 'src/main'
import { t } from 'src/lang/helpers'
import { AppContext } from 'src/context'
import EventBus, { EVENTS } from 'src/events'
import { UpdateChecker } from 'src/data/updateChecker'
import { ReferenceMapData } from 'src/data/data'
import { ReferenceMapList } from './ReferenceMapList'
import { getLinkedFiles } from 'src/utils/functions'

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
				const activeFile = this.app.workspace.getActiveFile()
				if (activeFile && file === activeFile) {
					this.processReferences()
				}
			})
		);

		this.registerEvent(
			this.app.workspace.on('active-leaf-change', (leaf) => {
				if (leaf) {
					this.app.workspace.iterateRootLeaves((rootLeaf) => {
						if (rootLeaf === leaf) {
							this.processReferences()
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
		const activeFile = this.app.workspace.getActiveFile();
		const settings = this.plugin.settings
		if (activeFile) {
			let fileCache = await this.app.vault.cachedRead(activeFile)
			if (settings.lookupLinkedFiles) {
				const linkedFiles = getLinkedFiles(activeFile)
				for (const file of linkedFiles) {
					if (file) {
						const cache = await this.app.vault.cachedRead(file)
						fileCache += cache
					}
				}
			}
			this.updateChecker.basename = activeFile.basename
			const fileMetadataCache = this.app.metadataCache.getFileCache(activeFile);
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
