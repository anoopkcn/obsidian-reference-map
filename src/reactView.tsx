import { ItemView, MarkdownView, WorkspaceLeaf, debounce } from 'obsidian'
import ReferenceMap from './main'
import { t } from './lang/helpers'
import React from 'react'
import { Root, createRoot } from 'react-dom/client'
import { ReferenceMapList } from './components/ReferenceMapList'
import { ReferenceMapData } from './referenceData'
import { AppContext } from './context'
import { UpdateChecker } from './utils'

export const REFERENCE_MAP_VIEW_TYPE = 'reference-map-view'

export class ReferenceMapView extends ItemView {
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
		)

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
		)

		this.registerDomEvent(document, 'pointerup', (evt) => {
			this.idSelectionHandle()
		})

		this.registerDomEvent(document, 'keyup', (evt) => {
			this.idSelectionHandle()
		})
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

	idSelectionHandle = debounce(() => {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView)
		if (!activeView || !activeView.file) return

		const editor = activeView.editor
		const selection =
			activeView.getMode() === 'source'
				? editor.getSelection().trim()
				: window.getSelection()?.toString().trim()

		const isInIDs = Array.from(this.updateChecker.indexIds).map((id: string) => {
			id = id.replace('https://doi.org/', '');
			return selection?.includes(id)
		})
		let isInCiteKeys = false
		for (const key in this.updateChecker.citeKeyMap) {
			const value = String(this.updateChecker.citeKeyMap[key])
			if (selection?.includes(key) || selection?.includes(value)) {
				isInCiteKeys = true
				break
			}
		}
		if (isInIDs || isInCiteKeys) {
			this.processReferences(selection ?? '')
		}
	}, 300, true)

	processReferences = async (selection = '') => {
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
		}
		this.rootEl?.render(
			<AppContext.Provider value={this.app}>
				<ReferenceMapList
					plugin={this.plugin}
					referenceMapData={this.referenceMapData}
					updateChecker={this.updateChecker}
					selection={selection}
				/>
			</AppContext.Provider>
		)
	}
}
