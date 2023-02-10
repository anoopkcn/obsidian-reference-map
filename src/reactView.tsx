import { ItemView, MarkdownView, WorkspaceLeaf } from "obsidian";
import ReferenceMap from "./main";
import { t } from "./lang/helpers";
import { ViewManager } from "./viewManager";
import React from "react";
import { Root, createRoot } from "react-dom/client";
import { ReferenceMapList } from "./components/ReferenceMapList";
import { extractKeywords } from "./utils";
import { DEFAULT_LIBRARY, EXCLUDE_FILE_NAMES } from "./constants";
import * as fs from "fs";
import * as BibTeXParser from '@retorquere/bibtex-parser';
import { resolvePath } from './utils';
import { Library } from "./types";

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

	processReferences = async () => {
		if (this.plugin.settings.searchCiteKey && this.plugin.settings.searchCiteKeyPath) this.loadLibrary();
		const activeView = app.workspace.getActiveViewOfType(MarkdownView);
		let frontMatterString = "";
		let fileNameString = "";
		if (activeView) {
			if (this.plugin.settings.searchFrontMatter) {
				const fileCache = app.metadataCache.getFileCache(
					activeView.file
				);
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
			if (
				this.plugin.settings.searchTitle &&
				!EXCLUDE_FILE_NAMES.some(
					(name) =>
						activeView.file.basename.toString().toLowerCase() ===
						name.toLowerCase()
				)
			) {
				fileNameString = extractKeywords(activeView.file.basename)
					.unique()
					.join("+");
			}
		}
		this.rootEl.render(
			<ReferenceMapList
				settings={this.plugin.settings}
				view={activeView}
				viewManager={this.viewManager}
				frontMatterString={frontMatterString}
				fileNameString={fileNameString}
				library={this.library}
			/>
		);
	};
}
