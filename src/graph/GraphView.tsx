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
    rootEl: Root
    viewContent: HTMLElement;

    constructor(leaf: WorkspaceLeaf, plugin: ReferenceMap) {
        super(leaf);
        this.plugin = plugin;
        this.navigation = false
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

        // this.registerEvent(
        //     this.app.metadataCache.on('changed', (file) => {
        //         const activeView =
        //             this.app.workspace.getActiveViewOfType(MarkdownView)
        //         if (activeView && file === activeView.file) {
        //             this.openGraph();
        //         }
        //     })
        // )

        // this.registerEvent(
        //     this.app.workspace.on('active-leaf-change', (leaf) => {
        //         if (leaf) {
        //             this.app.workspace.iterateRootLeaves((rootLeaf) => {
        //                 if (rootLeaf === leaf) {
        //                     this.openGraph();
        //                 }
        //             })
        //         }
        //     })
        // )
        this.openGraph();
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
        if (activeView?.file) {
            const fileMetadataCache = activeView.file ? await this.app.vault.cachedRead(activeView.file) : ''
            const fileCache = this.app.metadataCache.getFileCache(activeView.file);
            this.referenceMapData.updatePaperIDs(activeView, fileMetadataCache, fileCache)
        } else {
            // This is needed to trigger rendering if active view is not a markdown file
            // the prop name basename will re render the view
            this.referenceMapData.basename = ''
        }
        // if (!this.isUpdated) return
        const indexCards = await this.referenceMapData.getIndexCards(
            this.referenceMapData.paperIDs,
            this.referenceMapData.citeKeyMap,
            this.referenceMapData.fileNameString,
            this.referenceMapData.frontMatterString,
            this.referenceMapData.basename,
            true
        )
        this.rootEl?.render(
            <AppContext.Provider value={this.app}>
                <ReferenceMapGraph
                    settings={this.plugin.settings}
                    viewManager={this.referenceMapData.viewManager}
                    indexCards={indexCards}
                    width={this.viewContent.innerWidth}
                    height={this.viewContent.innerHeight}
                />
            </AppContext.Provider>
        )
    }

}