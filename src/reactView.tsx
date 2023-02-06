import { ItemView, MarkdownView, WorkspaceLeaf } from "obsidian";
import * as fs from "fs";
import ReferenceMap from "./main";
import { t } from "./lang/helpers";
import { ViewManager } from "./viewManager";
import React from "react";
import { Root, createRoot } from "react-dom/client";
import * as BibTeXParser from '@retorquere/bibtex-parser';
import { ReferenceMapList } from "./components/ReferenceMapList";
import { extractKeywords, resolvePath } from "./utils";
import { EXCLUDE_FILE_NAMES } from "./constants";
import { citeKeyLibrary } from "./types";
export const REFERENCE_MAP_VIEW_TYPE = "reference-map-view";

export class ReferenceMapView extends ItemView {
	plugin: ReferenceMap;
	viewManager: ViewManager;
	activeMarkdownLeaf: MarkdownView;
	rootEl: Root;

	constructor(leaf: WorkspaceLeaf, plugin: ReferenceMap) {
		super(leaf);
		this.plugin = plugin;
		this.viewManager = new ViewManager(plugin);
		this.rootEl = createRoot(this.containerEl.children[1]);
		this.plugin.library = { active: false, adapter: '', libraryData: null };

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
		if (this.plugin.settings.searchCiteKey) {
			if (this.plugin.settings.debugMode) console.log("ORM: Loading library file")
			let rawData;
			try {
				const libraryPath = resolvePath(
					this.plugin.settings.searchCiteKeyPath
				);
				if (!fs.existsSync(libraryPath)) {
					if (this.plugin.settings.debugMode) {
						console.log(
							"ORM: No library file found at " + libraryPath
						);
					}
				}
				rawData = fs.readFileSync(libraryPath).toString();
			} catch (e) {
				if (this.plugin.settings.debugMode) {
					console.warn("ORM: Non-fatal error loading library file.")
				}
				return null
			}
			if (this.plugin.settings.searchCiteKeyPath.endsWith(".json")) {
				try {
					const libraryData = JSON.parse(rawData);
					this.plugin.library = { active: true, adapter: 'csl-json', libraryData: libraryData }
					return libraryData
				} catch (e) {
					if (this.plugin.settings.debugMode) {
						console.warn("ORM: Non-fatal error loading library file.")
					}
				}
			}
			if (this.plugin.settings.searchCiteKeyPath.endsWith(".bib")) {
				const options: BibTeXParser.ParserOptions = {
					errorHandler: (err) => {
						if (this.plugin.settings.debugMode) {
							console.warn(
								'ORM: Non-fatal error loading BibTeX entry:',
								// err,
							);
						}
					},
				};
				try {
					const parsed = BibTeXParser.parse(rawData, options) as BibTeXParser.Bibliography;
					this.plugin.library = { active: true, adapter: 'bibtex', libraryData: parsed.entries }
					return parsed.entries
				} catch (e) {
					if (this.plugin.settings.debugMode) {
						console.warn("ORM: Non-fatal error loading library file.")
					}
				}
			}
		}
		return null
	}


	processReferences = async () => {
		const activeView = app.workspace.getActiveViewOfType(MarkdownView);
		let frontMatterString = "";
		let fileNameString = "";
		// Loading library every time is not ideal, but it's the only way to get the latest data
		const citeKeyData: citeKeyLibrary[] | null = this.plugin.library.libraryData
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
				citeKeyData={citeKeyData}
				adapter={this.plugin.library.adapter}
			/>
		);
	};
}
