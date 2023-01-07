import { ItemView, MarkdownView, WorkspaceLeaf } from "obsidian";
import ReferenceMap from "./main";
import { t } from "./lang/helpers";
import { ViewManager } from "./viewManager";
import React from "react";
import { Root, createRoot } from "react-dom/client";
import { SemanticPaper } from "./types";
import { ReferenceMapList } from "./components/ReferenceMapList";
import { extractKeywords, removeNullReferences } from "./utils";
import { EXCLUDE_FILE_NAMES } from "./constants";
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

	// async onOpen() {
	//     const container = this.containerEl.children[1];
	//     container.empty();
	//     container.createEl("span", { text: "Reference map" });
	// }

	async onClose() {
		this.rootEl.unmount();
		this.viewManager.cache.clear();
		return super.onClose();
	}

	processReferences = async () => {
		const activeView = app.workspace.getActiveViewOfType(MarkdownView);
		let rootPapers: SemanticPaper[] = [];
		let references: SemanticPaper[][] = [];
		let citations: SemanticPaper[][] = [];
		let query = "";
		let frontMatter: Record<string, string> = {};
		const isActiveView = activeView && activeView.file;
		if (isActiveView) {
			try {
				rootPapers = await this.viewManager.getRootPapers(
					activeView.file
				);
			} catch (error) {
				console.error(
					"Error in Reference Map View: processReferences",
					error
				);
			}
			if (
				this.plugin.settings.searchTitle &&
				!EXCLUDE_FILE_NAMES.some(
					(name) =>
						activeView.file?.basename.toString().toLowerCase() ===
						name.toLowerCase()
				)
			) {
				try {
					query = extractKeywords(activeView.file?.basename).join(
						"+"
					);
					if (query) {
						const titlePapers =
							await this.viewManager.searchRootPapers(query, [
								0,
								this.plugin.settings.searchLimit,
							]);
						rootPapers = rootPapers.concat(titlePapers);
					}
				} catch (error) {
					console.error(
						"Error in Reference Map View: processReferences",
						error
					);
				}
			}
			if (this.plugin.settings.searchFrontMatter) {
				try {
					await app.fileManager.processFrontMatter(
						activeView.file,
						(frontMatterObj) => {
							if (
								frontMatterObj &&
								Object.keys(frontMatterObj).length > 0
							) {
								frontMatter = frontMatterObj;
							}
						}
					);
					if (frontMatter) {
						const frontMatterString =
							frontMatter[
								this.plugin.settings
									.searchFrontMatterKey as keyof typeof frontMatter
							];
						if (frontMatterString) {
							query =
								extractKeywords(frontMatterString).join("+");
						}
						const frontMatterPapers =
							await this.viewManager.searchRootPapers(query, [
								0,
								this.plugin.settings.searchFrontMatterLimit,
							]);
						rootPapers = rootPapers.concat(frontMatterPapers);
					}
				} catch (error) {
					console.error(
						"Error in Reference Map View: processReferences",
						error
					);
				}
			}
		}
		if (rootPapers.length > 0) {
			rootPapers = removeNullReferences(rootPapers);
			try {
				// for each paper in rootPapers, get the references and push them to references
				references = await Promise.all(
					rootPapers.map(async (paper) => {
						return await this.viewManager.getReferences(
							paper.paperId
						);
					})
				);
				// console.log(references);
			} catch (error) {
				console.error(
					"Error in Reference Map View: processReferences",
					error
				);
			}
			try {
				citations = await Promise.all(
					rootPapers.map(async (paper) => {
						return await this.viewManager.getCitations(
							paper.paperId
						);
					})
				);
			} catch (error) {
				console.error(
					"Error in Reference Map View: processReferences",
					error
				);
			}
		}
		this.rootEl.render(
			<React.StrictMode>
				<ReferenceMapList
					settings={this.plugin.settings}
					papers={rootPapers}
					references={references}
					citations={citations}
					view={activeView}
				/>
			</React.StrictMode>
		);
	};
}
