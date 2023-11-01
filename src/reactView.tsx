import { ItemView, MarkdownView, WorkspaceLeaf, debounce } from 'obsidian'
import ReferenceMap from './main'
import { t } from './lang/helpers'
import React from 'react'
import { Root, createRoot } from 'react-dom/client'
import { ReferenceMapList } from './components/ReferenceMapList'
import { RELOAD, Reload } from './types'
import { ReferenceMapData } from './referenceData'
import { AppContext } from './context'

export const REFERENCE_MAP_VIEW_TYPE = 'reference-map-view'

export class ReferenceMapView extends ItemView {
	plugin: ReferenceMap
	activeMarkdownLeaf: MarkdownView
	referenceMapData: ReferenceMapData
	rootEl: Root | null
	isUpdated: boolean

	constructor(leaf: WorkspaceLeaf, plugin: ReferenceMap) {
		super(leaf)
		this.plugin = plugin
		this.referenceMapData = this.plugin.referenceMapData
		this.rootEl = createRoot(this.containerEl.children[1])
		this.isUpdated = false

		this.registerEvent(
			this.app.metadataCache.on('changed', (file) => {
				const activeView =
					this.app.workspace.getActiveViewOfType(MarkdownView)
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

		this.processReferences()
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

	async reload(reloadType: Reload) {
		if (reloadType === RELOAD.HARD) {
			this.referenceMapData.viewManager.clearCache()
			this.referenceMapData.resetLibraryTime()
			await this.referenceMapData.loadLibrary(false)
			this.processReferences()
		} else if (reloadType === RELOAD.SOFT) {
			await this.referenceMapData.loadLibrary(false)
			this.processReferences()
		} else if (reloadType === RELOAD.VIEW) {
			this.processReferences()
		}
	}

	idSelectionHandle = debounce(() => {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView)
		if (!activeView || !activeView.file) return

		const editor = activeView.editor
		const selection =
			activeView.getMode() === 'source'
				? editor.getSelection().trim()
				: window.getSelection()?.toString().trim()

		const isInIDs = Array.from(this.referenceMapData.paperIDs).map((id: string) => {
			id = id.replace('https://doi.org/', '');
			return selection?.includes(id)
		})
		let isInCiteKeys = false
		for (const key in this.referenceMapData.citeKeyMap) {
			const value = String(this.referenceMapData.citeKeyMap[key])
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
		if (activeView?.file) {
			const fileMetadataCache = activeView.file ? await this.app.vault.cachedRead(activeView.file) : ''
			const fileCache = this.app.metadataCache.getFileCache(activeView.file);
			this.referenceMapData.updatePaperIDs(activeView, fileMetadataCache, fileCache)
		} else {
			// This is needed to trigger rendering if active view is not a markdown file
			// the prop name basename will re render the view
			this.referenceMapData.basename = ''
		}
		// if (!this.isUpdated) return
		const indexCards = await this.referenceMapData.getIndexCards(
			this.referenceMapData.paperIDs,
			this.referenceMapData.citeKeyMap,
			this.referenceMapData.fileNameString,
			this.referenceMapData.frontMatterString,
			this.referenceMapData.basename,
			true
		)
		this.rootEl?.render(
			<AppContext.Provider value={this.app}>
				<ReferenceMapList
					plugin={this.plugin}
					viewManager={this.referenceMapData.viewManager}
					library={this.referenceMapData.library}
					basename={this.referenceMapData.basename}
					paperIDs={this.referenceMapData.paperIDs}
					citeKeyMap={this.referenceMapData.citeKeyMap}
					indexCards={indexCards}
					selection={selection}
				/>
			</AppContext.Provider>
		)
	}
}
