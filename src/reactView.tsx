import { ItemView, MarkdownView, WorkspaceLeaf } from "obsidian";
import ReferenceMap from "./main";
import { t } from "./lang/helpers";
import { ViewManager } from "./viewManager";
import React from "react";
import { Root, createRoot } from "react-dom/client";
import { SemanticPaper } from "./types";

export const REFERENCE_MAP_VIEW_TYPE = "reference-map-view";

export const ReferenceViewRoot = (props: Record<string, SemanticPaper[]>) => {
	const rootPapers: SemanticPaper[] = props.papers;
	// console.log(rootPapers);
	if (!rootPapers) {
		return <div>No papers found</div>;
	}
	return <div>{rootPapers[0].title}</div>;
};

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
							if (leaf.view instanceof MarkdownView) {
								this.processReferences(rootEl);
							} else {
								this.setNoContentMessage();
							}
						}
					});
				}
			})
		);

		this.processReferences(rootEl);
	}

	processReferences = async (rootEl: Root) => {
		const activeView = app.workspace.getActiveViewOfType(MarkdownView);

		if (activeView) {
			try {
				const rootPapers = await this.viewManager.getRootPapers(
					activeView.file
				);
				rootEl.render(
					<React.StrictMode>
						<ReferenceViewRoot papers={rootPapers} />
					</React.StrictMode>
				);
			} catch (error) {
				console.error(
					"Error in Reference Map View: processReferences",
					error
				);
			}
		} else {
			this.setNoContentMessage();
		}
	};

	setViewContent(referenceEls: HTMLElement[]) {
		if (referenceEls) {
			this.contentEl.empty();
			this.contentEl.createDiv(
				{
					cls: "orm-view-title",
				},
				(div) => {
					div.createDiv({ text: this.getDisplayText() });
				}
			);
			referenceEls.forEach((referenceEl) => {
				this.contentEl.append(referenceEl);
			});
		} else if (!referenceEls) {
			this.setNoContentMessage();
		}
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

	setNoContentMessage(message = "") {
		let showMessage = `No reference ID's are found in the active document`;
		if (message) {
			showMessage = message;
		}
		this.setMessage(showMessage);
	}

	setMessage(message: string) {
		this.contentEl.empty();
		this.contentEl.createDiv({
			cls: "orm-no-content",
			text: message,
		});
	}

	async onClose() {
		this.viewManager.cache.clear();
		return super.onClose();
	}
}
