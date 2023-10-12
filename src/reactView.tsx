import { ItemView, MarkdownView, WorkspaceLeaf, debounce } from 'obsidian'
import ReferenceMap from './main'
import { t } from './lang/helpers'
import { ViewManager } from './viewManager'
import React from 'react'
import { Root, createRoot } from 'react-dom/client'
import { ReferenceMapList } from './components/ReferenceMapList'
import {
	extractKeywords,
	getCiteKeyIds,
	getCiteKeys,
	getPaperIds,
	iSort,
	removeNullReferences,
	setCiteKeyId,
} from './utils'
import { DEFAULT_LIBRARY, EXCLUDE_FILE_NAMES } from './constants'
import * as fs from 'fs'
import * as BibTeXParser from '@retorquere/bibtex-parser'
import { resolvePath } from './utils'
import { CiteKey, IndexPaper, Library, RELOAD, Reload } from './types'
import _ from 'lodash'

export const REFERENCE_MAP_VIEW_TYPE = 'reference-map-view'

export class ReferenceMapView extends ItemView {
	plugin: ReferenceMap
	viewManager: ViewManager
	activeMarkdownLeaf: MarkdownView
	rootEl: Root
	library: Library
	paperIDs: Set<string>
	citeKeyMap: CiteKey[]
	frontMatterString: string
	fileNameString: string
	basename: string

	constructor(leaf: WorkspaceLeaf, plugin: ReferenceMap) {
		super(leaf)
		this.plugin = plugin
		this.viewManager = new ViewManager(plugin)
		this.rootEl = createRoot(this.containerEl.children[1])
		this.library = DEFAULT_LIBRARY
		this.paperIDs = new Set()
		this.citeKeyMap = []
		this.frontMatterString = ''
		this.fileNameString = ''
		this.basename = ''

		this.registerEvent(
			app.metadataCache.on('changed', (file) => {
				const activeView =
					app.workspace.getActiveViewOfType(MarkdownView)
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
			app.workspace.on('active-leaf-change', (leaf) => {
				if (leaf) {
					app.workspace.iterateRootLeaves((rootLeaf) => {
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
		await this.loadLibrary()
		this.prepareIDs().then(() => this.processReferences())
	}

	async onClose() {
		this.rootEl.unmount()
		this.viewManager.clearCache()
		return super.onClose()
	}

	async reload(reloadType: Reload) {
		if (reloadType === RELOAD.HARD) {
			this.viewManager.clearCache()
			this.library.mtime = 0
			await this.loadLibrary()
			this.prepareIDs().then(() => this.processReferences())
		} else if (reloadType === RELOAD.SOFT) {
			await this.loadLibrary()
			this.prepareIDs().then(() => this.processReferences())
		} else if (reloadType === RELOAD.VIEW) {
			this.prepareIDs().then(() => this.processReferences())
		}
	}

	idSelectionHandle = debounce(() => {
		const activeView = app.workspace.getActiveViewOfType(MarkdownView)
		if (!activeView || !activeView.file) return

		const editor = activeView.editor
		const selection =
			activeView.getMode() === 'source'
				? editor.getSelection().trim()
				: window.getSelection()?.toString().trim()

		const isInIDs = this.paperIDs.has(selection ?? '') || this.paperIDs.has(`https://doi.org/${selection}`)
		const isInCiteKeys = _.map(this.citeKeyMap, 'citeKey').includes(selection ?? '') || _.map(this.citeKeyMap, 'citeKey').includes(`@${selection}`)
		if (isInIDs || isInCiteKeys) {
			this.prepareIDs().then(() => this.processReferences(selection ?? ''))
		}
	}, 300, true)


	loadLibrary = async () => {
		const { searchCiteKey, searchCiteKeyPath, debugMode } = this.plugin.settings;
		if (!searchCiteKey || !searchCiteKeyPath) return null;

		const libraryPath = resolvePath(searchCiteKeyPath);
		const stats = fs.statSync(libraryPath);
		const mtime = stats.mtimeMs;
		if (mtime === this.library.mtime) return null;

		if (debugMode) console.log(`ORM: Loading library from '${searchCiteKeyPath}'`);
		let rawData;
		try {
			rawData = fs.readFileSync(libraryPath).toString();
		} catch (e) {
			if (debugMode) console.warn('ORM: Warnings associated with loading the library file.');
			return null;
		}

		const isJson = searchCiteKeyPath.endsWith('.json');
		const isBib = searchCiteKeyPath.endsWith('.bib');
		if (!isJson && !isBib) return null;

		let libraryData;
		try {
			libraryData = isJson ? JSON.parse(rawData) : BibTeXParser.parse(rawData, { errorHandler: () => { } }).entries;
		} catch (e) {
			if (debugMode) console.warn('ORM: Warnings associated with loading the library file.');
			return null;
		}

		this.library = {
			active: true,
			adapter: isJson ? 'csl-json' : 'bibtex',
			libraryData,
			mtime,
		};
		return libraryData;
	};


	prepareIDs = async () => {
		const isLibrary =
			this.plugin.settings.searchCiteKey &&
			this.library.libraryData !== null
		const activeView = app.workspace.getActiveViewOfType(MarkdownView)
		let fileNameString = ''
		let frontMatterString = ''
		let paperIDs: Set<string> = new Set()
		let citeKeyMap: CiteKey[] = []
		let isUpdated = false
		this.basename = ''
		if (activeView) {
			if (isLibrary) this.loadLibrary()
			this.basename = activeView.file?.basename ?? ''
			const fileContent = activeView.file ? await app.vault.cachedRead(activeView.file) : ''
			paperIDs = getPaperIds(fileContent)

			if (isLibrary && activeView.file) {
				const citeKeys = getCiteKeys(
					fileContent,
					this.plugin.settings.findCiteKeyFromLinksWithoutPrefix,
					this.plugin.settings.citeKeyFilter
				)
				citeKeyMap = getCiteKeyIds(citeKeys, this.library)
			}

			if (this.plugin.settings.searchFrontMatter) {
				if (activeView.file) {
					const fileCache = app.metadataCache.getFileCache(activeView.file);
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


	getIndexCards = async () => {
		const indexCards: IndexPaper[] = [];

		// Get references using the paper IDs
		if (this.paperIDs.size > 0) {
			await Promise.allSettled(
				[...this.paperIDs].map(async (paperId) => {
					const paper = await this.viewManager.getIndexPaper(paperId);
					if (paper !== null && typeof paper !== "number") {
						const paperCiteId =
							this.plugin.settings.searchCiteKey &&
								this.library.libraryData !== null &&
								this.plugin.settings.findZoteroCiteKeyFromID
								? setCiteKeyId(paperId, this.library)
								: paperId;
						indexCards.push({ id: paperCiteId, paper });
					}
				})
			);
		}

		// Get references using the cite keys
		if (this.citeKeyMap.length > 0) {
			await Promise.allSettled(
				this.citeKeyMap.map(async (item) => {
					const paper = await this.viewManager.getIndexPaper(item.paperId);
					if (paper !== null && typeof paper !== "number") {
						indexCards.push({ id: item.citeKey, paper });
					}
				})
			);
		}

		// Get references using the file name
		if (
			this.plugin.settings.searchTitle &&
			this.fileNameString &&
			!EXCLUDE_FILE_NAMES.some(
				(name) => this.basename.toLowerCase() === name.toLowerCase()
			)
		) {
			const titleSearchPapers = await this.viewManager.searchIndexPapers(
				this.fileNameString,
				this.plugin.settings.searchLimit
			);
			titleSearchPapers.forEach((paper) => {
				indexCards.push({ id: paper.paperId, paper });
			});
		}

		// Get references using the front matter
		if (this.plugin.settings.searchFrontMatter && this.frontMatterString) {
			const frontMatterPapers = await this.viewManager.searchIndexPapers(
				this.frontMatterString,
				this.plugin.settings.searchFrontMatterLimit
			);
			frontMatterPapers.forEach((paper) => {
				indexCards.push({ id: paper.paperId, paper });
			});
		}

		return indexCards;
	};

	preProcessReferences = (indexCards: IndexPaper[]) => {
		if (!this.plugin.settings.enableIndexSorting) {
			return removeNullReferences(indexCards)
		}
		return iSort(
			removeNullReferences(indexCards),
			this.plugin.settings.sortByIndex,
			this.plugin.settings.sortOrderIndex
		)
	}

	processReferences = async (selection = '') => {
		const indexCards = await this.getIndexCards()
		this.rootEl.render(
			<ReferenceMapList
				settings={this.plugin.settings}
				viewManager={this.viewManager}
				library={this.library}
				basename={this.basename}
				paperIDs={this.paperIDs}
				citeKeyMap={this.citeKeyMap}
				indexCards={this.preProcessReferences(indexCards)}
				selection={selection}
			/>
		)
	}
}
