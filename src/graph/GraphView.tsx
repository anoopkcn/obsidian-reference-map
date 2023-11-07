import { ItemView, MarkdownView, WorkspaceLeaf } from "obsidian";
import React from "react";
import { Root, createRoot } from "react-dom/client";
import { ReferenceMapGraph } from "./ReferenceMapGraph";
import ReferenceMap from "src/main";
import { AppContext } from "src/context";
import { ReferenceMapData } from "src/referenceData";

export const REFERENCE_MAP_GRAPH_VIEW_TYPE = 'reference-map-graph-view'


export class GraphView extends ItemView {
    plugin: ReferenceMap
    referenceMapData: ReferenceMapData
    rootEl: Root | null
    viewContent: HTMLElement;

    constructor(leaf: WorkspaceLeaf, plugin: ReferenceMap) {
        super(leaf);
        this.plugin = plugin;
        this.referenceMapData = this.plugin.referenceMapData
        this.viewContent = this.containerEl.querySelector(
            ".view-content"
        ) as HTMLElement;
        if (this.viewContent) {
            this.rootEl = createRoot(this.viewContent)
        } else {
            console.error("Could not find view content");
            return;
        }

        this.registerEvent(
            this.app.metadataCache.on('changed', async (file) => {
                const activeView = this.app.workspace.getActiveViewOfType(MarkdownView)
                if (activeView && file === activeView.file) {
                    this.openGraph()
                }
            })
        )

        this.registerEvent(
            this.app.workspace.on('active-leaf-change', (leaf) => {
                if (leaf) this.openGraph()
            })
        )

        this.openGraph()
    }

    getViewType(): string {
        return REFERENCE_MAP_GRAPH_VIEW_TYPE
    }

    getDisplayText(): string {
        return "Reference Map Graph";
    }
    getIcon() {
        return 'ReferenceMapGraphIcon'
    }

    onResize() {
        super.onResize();
    }

    async onOpen() {
        this.openGraph()
    }

    async onClose() {
        this.rootEl?.unmount()
        return super.onClose()
    }

    openGraph = async () => {
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView)
        this.rootEl?.render(
            <AppContext.Provider value={this.app}>
                <ReferenceMapGraph
                    width={this.viewContent.innerWidth}
                    height={this.viewContent.innerHeight}
                    settings={this.plugin.settings}
                    referenceMapData={this.referenceMapData}
                    activeView={activeView}
                    basename={activeView?.file?.basename}
                />
            </AppContext.Provider>
        )
    }

}