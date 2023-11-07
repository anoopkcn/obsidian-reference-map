import { ItemView, MarkdownView, WorkspaceLeaf } from "obsidian";
import React from "react";
import { Root, createRoot } from "react-dom/client";
import { ReferenceMapGraph } from "./ReferenceMapGraph";
import ReferenceMap from "src/main";
import { AppContext } from "src/context";
import { ReferenceMapData } from "src/referenceData";
import { IndexPaper } from "src/types";

export const REFERENCE_MAP_GRAPH_VIEW_TYPE = 'reference-map-graph-view'


export class GraphView extends ItemView {
    plugin: ReferenceMap
    referenceMapData: ReferenceMapData
    rootEl: Root
    viewContent: HTMLElement;
    indexCards: IndexPaper[]

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

        this.registerEvent(
            this.app.metadataCache.on('changed', async (file) => {
                const activeView =
                    this.app.workspace.getActiveViewOfType(MarkdownView)
                if (activeView && file === activeView.file) {
                    this.getIndexCards().then(() => {
                        this.openGraph()
                    })
                }
            })
        )

        this.registerEvent(
            this.app.workspace.on('active-leaf-change', (leaf) => {
                if (leaf) {
                    this.app.workspace.iterateRootLeaves(async (rootLeaf) => {
                        if (rootLeaf === leaf) {
                            this.getIndexCards().then(() => {
                                this.openGraph()
                            })
                        }
                    })
                }
            })
        )

        this.getIndexCards().then(() => {
            this.openGraph();
        })
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

    getIndexCards = async () => {
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView)
        if (activeView?.file) {
            const fileMetadataCache = activeView.file ? await this.app.vault.cachedRead(activeView.file) : ''
            const fileCache = this.app.metadataCache.getFileCache(activeView.file);
            const isUpdated = this.referenceMapData.updatePaperIDs(activeView, fileMetadataCache, fileCache)
            // if (!isUpdated) return isUpdated
            this.indexCards = await this.referenceMapData.getIndexCards(
            this.referenceMapData.paperIDs,
            this.referenceMapData.citeKeyMap,
            this.referenceMapData.fileNameString,
            this.referenceMapData.frontMatterString,
            this.referenceMapData.basename,
            true
        )
            console.log('ORM:', isUpdated ? 'Updated' : 'Not Updated')

            return isUpdated
        } else {
            // This is needed to trigger rendering if active view is not a markdown file
            // the prop name basename will re render the view
            this.referenceMapData.basename = ''
            return false
        }
    }

    openGraph = async () => {
        this.rootEl?.render(
            <AppContext.Provider value={this.app}>
                <ReferenceMapGraph
                    settings={this.plugin.settings}
                    referenceMapData={this.referenceMapData}
                    indexCards={this.indexCards}
                    width={this.viewContent.innerWidth}
                    height={this.viewContent.innerHeight}
                />
            </AppContext.Provider>
        )
    }

}