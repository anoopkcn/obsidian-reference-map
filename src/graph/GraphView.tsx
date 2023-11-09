import { ItemView, MarkdownView, WorkspaceLeaf } from "obsidian";
import React from "react";
import { Root, createRoot } from "react-dom/client";
import { ReferenceMapGraph } from "./ReferenceMapGraph";
import ReferenceMap from "src/main";
import { AppContext } from "src/context";
import { ReferenceMapData } from "src/referenceData";
import { UpdateChecker } from "src/utils";
import EventBus from "src/EventBus";

export const REFERENCE_MAP_GRAPH_VIEW_TYPE = 'reference-map-graph-view'


export class GraphView extends ItemView {
    plugin: ReferenceMap
    referenceMapData: ReferenceMapData
    rootEl: Root | null
    viewContent: HTMLElement;
    updateChecker: UpdateChecker


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
        //initialize UpdateChecker 
        this.updateChecker = new UpdateChecker(
            new Set<string>(),
            this.plugin.settings,
            this.referenceMapData.library.libraryData
        )

        this.registerEvent(
            this.app.metadataCache.on('changed', async (file) => {
                const activeView = this.app.workspace.getActiveViewOfType(MarkdownView)
                if (activeView && file === activeView.file) {
                    const cache = await this.app.vault.cachedRead(activeView.file)
                    if (cache) {
                        this.updateChecker.updateCache(cache)
                        const updated = this.updateChecker.checkCiteKeysUpdate()
                        if (updated) {
                            EventBus.trigger('keys-changed');
                        }
                    }
                }
            })
        )

        this.registerEvent(
            this.app.workspace.on('active-leaf-change', (leaf) => {
                if (leaf) {
                    this.app.workspace.iterateRootLeaves((rootLeaf) => {
                        if (rootLeaf === leaf) {
                            this.openGraph()
                        }
                    })
                }
            })
        )

        // this.openGraph()
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

    onUnload = () => {
        EventBus.off('keys-changed', () => { });
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
                />
            </AppContext.Provider>
        )
    }

}