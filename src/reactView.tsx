import { ItemView, MarkdownView, WorkspaceLeaf } from "obsidian";
import ReferenceMap from "./main";
import { t } from "./lang/helpers";
import { ViewManager } from "./viewManager";
import React from "react";
import { Root, createRoot } from "react-dom/client";
import { SemanticPaper } from "./types";
import { ReferenceMapList } from "./components/ReferenceMapList";
import { removeNullReferences } from "./utils";
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
		let reference: SemanticPaper[] = [];
		let references: SemanticPaper[][] = [];
		let citaion: SemanticPaper[] = [];
		let citations: SemanticPaper[][] = [];
		const isActiveView = activeView && activeView.file;
		if (isActiveView) {
			try {
				rootPapers = await this.viewManager.getRootPapers(
					activeView.file
				);
				rootPapers = removeNullReferences(rootPapers);
			} catch (error) {
				console.error(
					"Error in Reference Map View: processReferences",
					error
				);
			}
		}
		if (rootPapers.length > 0) {
			try {
				// for each paper in rootPapers, get the references and push them to references
				references = await Promise.all(
					rootPapers.map(async (paper) => {
						reference = await this.viewManager.getReferences(
							paper.paperId
						);
						return reference;
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
						citaion = await this.viewManager.getCitations(
							paper.paperId
						);
						return citaion;
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
