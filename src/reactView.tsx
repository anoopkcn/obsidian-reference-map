import { ItemView, MarkdownView, WorkspaceLeaf } from "obsidian";
import ReferenceMap from "./main";
import { t } from "./lang/helpers";
import { ViewManager } from "./viewManager";
import React from "react";
import { Root, createRoot } from "react-dom/client";
import { SemanticPaper } from "./types";
import { ReferenceMapList } from "./components/ReferenceMapList";

export const REFERENCE_MAP_VIEW_TYPE = "reference-map-view";

export class ReferenceMapView extends ItemView {
	plugin: ReferenceMap;
	viewManager: ViewManager;
	activeMarkdownLeaf: MarkdownView;

	constructor(leaf: WorkspaceLeaf, plugin: ReferenceMap) {
		super(leaf);
		this.plugin = plugin;
		this.viewManager = new ViewManager(plugin);
		const rootEl = createRoot(this.containerEl.children[1]);

		this.registerEvent(
			app.metadataCache.on("changed", (file) => {
				const activeView =
					app.workspace.getActiveViewOfType(MarkdownView);
				if (activeView && file === activeView.file) {
					this.processReferences(rootEl);
				}
			})
		);

		this.registerEvent(
			app.workspace.on("active-leaf-change", (leaf) => {
				if (leaf) {
					app.workspace.iterateRootLeaves((rootLeaf) => {
						if (rootLeaf === leaf) {
							this.processReferences(rootEl);
						}
					});
				}
			})
		);

		this.processReferences(rootEl);
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
		this.viewManager.cache.clear();
		return super.onClose();
	}

	processReferences = async (rootEl: Root) => {
		const activeView = app.workspace.getActiveViewOfType(MarkdownView);
		let rootPapers: SemanticPaper[] = [];
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
		}
		rootEl.render(
			<React.StrictMode>
				<ReferenceMapList papers={rootPapers} />
			</React.StrictMode>
		);
	};
}
