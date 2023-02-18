import { ItemView, MarkdownView, WorkspaceLeaf, debounce } from "obsidian";
import ReferenceMap from "./main";
import { t } from "./lang/helpers";
import { ViewManager } from "./viewManager";
import React from "react";
import { Root, createRoot } from "react-dom/client";
import { ReferenceMapList } from "./components/ReferenceMapList";
import { extractKeywords, getCiteKeyIds, getCiteKeys, getPaperIds, setCiteKeyId } from "./utils";
import { DEFAULT_LIBRARY, EXCLUDE_FILE_NAMES } from "./constants";
import * as fs from "fs";
import * as BibTeXParser from '@retorquere/bibtex-parser';
import { resolvePath } from './utils';
import { CiteKey, IndexPaper, Library } from "./types";

export const REFERENCE_MAP_VIEW_TYPE = "reference-map-view";

export class ReferenceMapView extends ItemView {
	plugin: ReferenceMap;
	viewManager: ViewManager;
	activeMarkdownLeaf: MarkdownView;
	rootEl: Root;
	library: Library;

	constructor(leaf: WorkspaceLeaf, plugin: ReferenceMap) {
		super(leaf);
		this.plugin = plugin;
		this.viewManager = new ViewManager(plugin);
		this.rootEl = createRoot(this.containerEl.children[1]);
		this.library = DEFAULT_LIBRARY

		this.registerEvent(
			app.metadataCache.on("changed", (file) => {
				const activeView =
					app.workspace.getActiveViewOfType(MarkdownView);
				if (activeView && file === activeView.file) {
					this.processReferences();
				}
			})
		);

		this.registerEvent(
			app.workspace.on("active-leaf-change", (leaf) => {
				if (leaf) {
					app.workspace.iterateRootLeaves((rootLeaf) => {
						if (rootLeaf === leaf) {
							this.processReferences();
						}
					});
				}
			})
		);

		this.registerDomEvent(document, "pointerup", (evt) => {
			this.idSelectionHandle();
		});

		this.registerDomEvent(document, "keyup", (evt) => {
			this.idSelectionHandle();
		});

		this.processReferences();
	}

	getViewType() {
		return REFERENCE_MAP_VIEW_TYPE;
	}

	getDisplayText() {
		return t("REFERENCE_MAP");
	}

	getIcon() {
		return "ReferenceMapIconScroll";
	}

	async onOpen() {
		await this.loadLibrary();
		this.processReferences();
	}

	async onClose() {
		this.rootEl.unmount();
		this.viewManager.clearCache();
		return super.onClose();
	}

	async reload(reloadType: "hard" | "soft" | "view") {
		if (reloadType === "hard") {
			this.viewManager.clearCache()
			this.library.mtime = 0
			await this.loadLibrary()
			this.processReferences()
		} else if (reloadType === "soft") {
			await this.loadLibrary()
			this.processReferences()
		} else if (reloadType === "view") {
			this.processReferences()
		}
	}

	idSelectionHandle = debounce(() => {
		const activeView = app.workspace.getActiveViewOfType(MarkdownView);
		let selection = ''
		if (activeView && activeView.file) {
			const editor = activeView.editor;
			if (activeView.getMode() === 'source') {
				selection = editor.getSelection().trim();
			} else {
				const textSelection = window.getSelection()?.toString()
				if (textSelection !== undefined && textSelection !== null && textSelection !== '')
					selection = textSelection.trim()
			}
			if (selection)
				this.processReferences(selection)
		}
	}, 300, true);

	loadLibrary = async () => {
		if (this.plugin.settings.searchCiteKey && this.plugin.settings.searchCiteKeyPath) {
			const libraryPath = resolvePath(this.plugin.settings.searchCiteKeyPath);
			let rawData;
			let mtime = 0;
			try {
				const stats = fs.statSync(libraryPath)
				mtime = stats.mtimeMs
			} catch (e) {
				if (this.plugin.settings.debugMode) {
					console.warn("ORM: Something went wrong when checking the library stats.")
				}
				return null
			}
			if (mtime !== this.library.mtime) {
				if (this.plugin.settings.debugMode) console.log(`ORM: Loading library from '${this.plugin.settings.searchCiteKeyPath}'`)
				try {
					if (!fs.existsSync(libraryPath)) {
						if (this.plugin.settings.debugMode) {
							console.log(`ORM: No library file found at ${libraryPath}`);
						}
					}
					rawData = fs.readFileSync(libraryPath).toString();
				} catch (e) {
					if (this.plugin.settings.debugMode) {
						console.warn("ORM: Warnings associated with loading the library file.")
					}
					return null
				}
				if (this.plugin.settings.searchCiteKeyPath.endsWith(".json")) {
					try {
						const libraryData = JSON.parse(rawData);
						this.library = { active: true, adapter: 'csl-json', libraryData: libraryData, mtime: mtime }
						return libraryData
					} catch (e) {
						if (this.plugin.settings.debugMode) {
							console.warn("ORM: Warnings associated with loading the library file.")
						}
					}
				}
				if (this.plugin.settings.searchCiteKeyPath.endsWith(".bib")) {
					const options: BibTeXParser.ParserOptions = {
						errorHandler: () => {
							if (this.plugin.settings.debugMode) {
								console.warn('ORM: Warnings associated with loading the BibTeX entry.')
							}
						},
					};
					try {
						const parsed = BibTeXParser.parse(rawData, options) as BibTeXParser.Bibliography;
						this.library = { active: true, adapter: 'bibtex', libraryData: parsed.entries, mtime: mtime }
						return parsed.entries
					} catch (e) {
						if (this.plugin.settings.debugMode) {
							console.warn("ORM: Warnings associated with loading the library file.")
						}
					}
				}
			}
		}
		return null
	}

	prepareIDs = async () => {
		const isLibrary = this.plugin.settings.searchCiteKey && this.library.libraryData !== null
		const activeView = app.workspace.getActiveViewOfType(MarkdownView);
		let basename = "";
		let fileNameString = "";
		let frontMatterString = "";
		let paperIDs: Set<string> = new Set();
		let citeKeyMap: CiteKey[] = [];
		if (activeView) {
			if (isLibrary) this.loadLibrary();
			basename = activeView.file.basename;
			const fileContent = await app.vault.cachedRead(activeView.file);
			paperIDs = getPaperIds(fileContent);

			if (isLibrary) {
				const citeKeys = getCiteKeys(fileContent, this.plugin.settings.findCiteKeyFromLinksWithoutPrefix);
				citeKeyMap = getCiteKeyIds(citeKeys, this.library);
			}

			if (this.plugin.settings.searchFrontMatter) {
				const fileCache = app.metadataCache.getFileCache(activeView.file);
				if (fileCache?.frontmatter) {
					const keywords = fileCache?.frontmatter?.[this.plugin.settings.searchFrontMatterKey];
					if (keywords)
						frontMatterString = extractKeywords(keywords).unique().join("+");
				}
			}
			if (
				this.plugin.settings.searchTitle &&
				!EXCLUDE_FILE_NAMES.some((name) => basename.toLowerCase() === name.toLowerCase()
				)
			) {
				fileNameString = extractKeywords(basename).unique().join("+");
			}
		}
		return {
			basename: basename,
			paperIDs: paperIDs,
			citeKeyMap: citeKeyMap,
			frontMatterString: frontMatterString,
			fileNameString: fileNameString,
			isLibrary: isLibrary
		}

	}

	getReferences = async () => {
		const paperIDs = await this.prepareIDs()
		const indexCards: IndexPaper[] = [];
		const basename = paperIDs.basename
		if (paperIDs.paperIDs.size > 0) {
			const paperIDPromises = [...paperIDs.paperIDs].map(async (paperId) => {
				const paper = await this.viewManager.getIndexPaper(paperId);
				let paperCiteId = paperId
				if (paperIDs.isLibrary && this.plugin.settings.findZoteroCiteKeyFromID)
					paperCiteId = setCiteKeyId(paperId, this.library);
				if (paper !== null && typeof paper !== "number")
					return Promise.resolve(indexCards.push({ id: paperCiteId, paper: paper }))

			});
			await Promise.allSettled(paperIDPromises);
		}

		if (paperIDs.citeKeyMap.length > 0) {
			const citeKeyPromises = paperIDs.citeKeyMap.map(async (item) => {
				const paper = await this.viewManager.getIndexPaper(item.paperId);
				if (paper !== null && typeof paper !== "number")
					return Promise.resolve(indexCards.push({ id: item.citeKey, paper: paper }))
			});
			await Promise.allSettled(citeKeyPromises);
		}

		if (this.plugin.settings.searchTitle && paperIDs.fileNameString) {
			const titleSearchPapers = await this.viewManager.searchIndexPapers(
				paperIDs.fileNameString, this.plugin.settings.searchLimit
			);
			titleSearchPapers.forEach((paper) => {
				indexCards.push({ id: paper.paperId, paper: paper });
			});
		}

		if (this.plugin.settings.searchFrontMatter && paperIDs.frontMatterString) {
			const frontMatterPapers = await this.viewManager.searchIndexPapers(
				paperIDs.frontMatterString, this.plugin.settings.searchFrontMatterLimit
			);
			frontMatterPapers.forEach((paper) => {
				indexCards.push({ id: paper.paperId, paper: paper });
			});
		}
		return { basename, indexCards }
	}

	processReferences = async (selection = '') => {
		const { basename, indexCards } = await this.getReferences()
		this.rootEl.render(
			<ReferenceMapList
				settings={this.plugin.settings}
				viewManager={this.viewManager}
				library={this.library}
				indexCards={indexCards}
				basename={basename}
				selection={selection}
			/>
		);
	};
}
