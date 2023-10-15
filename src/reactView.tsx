import { ItemView, MarkdownView, WorkspaceLeaf, debounce } from 'obsidian'
import ReferenceMap from './main'
import { t } from './lang/helpers'
import React from 'react'
import { Root, createRoot } from 'react-dom/client'
import { ReferenceMapList } from './components/ReferenceMapList'
import { extractKeywords, getCiteKeyIds, getCiteKeys, getPaperIds, } from './utils'
import { EXCLUDE_FILE_NAMES } from './constants'
import { CiteKey, RELOAD, Reload } from './types'
import _ from 'lodash'
import { ReferenceMapData } from './referenceData'

export const REFERENCE_MAP_VIEW_TYPE = 'reference-map-view'

export class ReferenceMapView extends ItemView {
	plugin: ReferenceMap
	activeMarkdownLeaf: MarkdownView
	referenceMapData: ReferenceMapData
	rootEl: Root
	paperIDs: Set<string>
	citeKeyMap: CiteKey[]
	frontMatterString: string
	fileNameString: string
	basename: string

	constructor(leaf: WorkspaceLeaf, plugin: ReferenceMap) {
		super(leaf)
		this.plugin = plugin
		this.referenceMapData = new ReferenceMapData(plugin)
		this.rootEl = createRoot(this.containerEl.children[1])
		this.paperIDs = new Set()
		this.citeKeyMap = []
		this.frontMatterString = ''
		this.fileNameString = ''
		this.basename = ''

		this.registerEvent(
			this.app.metadataCache.on('changed', (file) => {
				const activeView =
					this.app.workspace.getActiveViewOfType(MarkdownView)
				if (activeView && file === activeView.file) {
					this.prepareIDs().then((isUpdated) => {
						if (isUpdated) {
							this.processReferences()
						}
					})
				}
			})
		)

		this.registerEvent(
			this.app.workspace.on('active-leaf-change', (leaf) => {
				if (leaf) {
					this.app.workspace.iterateRootLeaves((rootLeaf) => {
						if (rootLeaf === leaf) {
							this.prepareIDs().then(() =>
								this.processReferences()
							)
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

		this.prepareIDs().then(() => this.processReferences())
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
		await this.referenceMapData.loadLibrary()
		this.prepareIDs().then(() => this.processReferences())
	}

	async onClose() {
		this.rootEl.unmount()
		this.referenceMapData.viewManager.clearCache()
		return super.onClose()
	}

	async reload(reloadType: Reload) {
		if (reloadType === RELOAD.HARD) {
			this.referenceMapData.viewManager.clearCache()
			this.referenceMapData.resetLibraryTime()
			await this.referenceMapData.loadLibrary()
			this.prepareIDs().then(() => this.processReferences())
		} else if (reloadType === RELOAD.SOFT) {
			await this.referenceMapData.loadLibrary()
			this.prepareIDs().then(() => this.processReferences())
		} else if (reloadType === RELOAD.VIEW) {
			this.prepareIDs().then(() => this.processReferences())
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

		const isInIDs = Array.from(this.paperIDs).map((id: string) => {
			id = id.replace('https://doi.org/', '');
			return selection?.includes(id)
		})
		let isInCiteKeys = false
		for (const key in this.citeKeyMap) {
			const value = String(this.citeKeyMap[key])
			if (selection?.includes(key) || selection?.includes(value)) {
				isInCiteKeys = true
				break
			}
		}
		if (isInIDs || isInCiteKeys) {
			this.prepareIDs().then(() => this.processReferences(selection ?? ''))
		}
	}, 300, true)

	prepareIDs = async () => {
		const isLibrary =
			this.plugin.settings.searchCiteKey &&
			this.referenceMapData.library.libraryData !== null
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView)
		let fileNameString = ''
		let frontMatterString = ''
		let paperIDs: Set<string> = new Set()
		let citeKeyMap: CiteKey[] = []
		let isUpdated = false
		this.basename = ''
		if (activeView) {
			if (isLibrary) this.referenceMapData.loadLibrary()
			this.basename = activeView.file?.basename ?? ''
			const fileContent = activeView.file ? await this.app.vault.cachedRead(activeView.file) : ''
			paperIDs = getPaperIds(fileContent)

			if (isLibrary && activeView.file) {
				const citeKeys = getCiteKeys(
					fileContent,
					this.plugin.settings.findCiteKeyFromLinksWithoutPrefix,
					this.plugin.settings.citeKeyFilter
				)
				citeKeyMap = getCiteKeyIds(citeKeys, this.referenceMapData.library)
			}

			if (this.plugin.settings.searchFrontMatter) {
				if (activeView.file) {
					const fileCache = this.app.metadataCache.getFileCache(activeView.file);
					if (fileCache?.frontmatter) {
						const keywords =
							fileCache?.frontmatter?.[
							this.plugin.settings.searchFrontMatterKey
							];
						if (keywords)
							frontMatterString = extractKeywords(keywords)
								.unique()
								.join("+");
					}
				}
			}
			if (
				this.plugin.settings.searchTitle &&
				!EXCLUDE_FILE_NAMES.some(
					(name) => this.basename.toLowerCase() === name.toLowerCase()
				)
			) {
				fileNameString = extractKeywords(this.basename)
					.unique()
					.join('+')
			}
			const isPaperIDsUpdated = _.isEqual(paperIDs, this.paperIDs)
			const isCiteKeyMapUpdated = _.isEqual(citeKeyMap, this.citeKeyMap)
			const isFrontMatterUpdated =
				frontMatterString === this.frontMatterString
			const isFileNameUpdated = fileNameString === this.fileNameString

			isUpdated =
				!isPaperIDsUpdated ||
				!isCiteKeyMapUpdated ||
				!isFrontMatterUpdated ||
				!isFileNameUpdated

			// If there are updated changes then update the class variables
			if (isUpdated) {
				this.paperIDs = paperIDs
				this.citeKeyMap = citeKeyMap
				this.frontMatterString = frontMatterString
				this.fileNameString = fileNameString
			}
		}
		return isUpdated
	}

	processReferences = async (selection = '') => {
		const indexCards = await this.referenceMapData.getIndexCards(
			this.paperIDs,
			this.citeKeyMap,
			this.fileNameString,
			this.frontMatterString,
			this.basename,
			true
		)
		this.rootEl.render(
			<ReferenceMapList
				settings={this.plugin.settings}
				viewManager={this.referenceMapData.viewManager}
				library={this.referenceMapData.library}
				basename={this.basename}
				paperIDs={this.paperIDs}
				citeKeyMap={this.citeKeyMap}
				indexCards={indexCards}
				selection={selection}
			/>
		)
	}
}
