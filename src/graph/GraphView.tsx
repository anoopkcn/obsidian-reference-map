import React from "react";
import { Root, createRoot } from "react-dom/client";
import { ItemView, MarkdownView, WorkspaceLeaf, debounce } from "obsidian";
import { AppContext } from "src/context";
import EventBus, { EVENTS } from "src/events";
import { ReferenceMapData } from "src/data/data";
import { UpdateChecker } from "src/data/updateChecker";
import ReferenceMap from "src/main";
import { ReferenceMapGraph } from "./ReferenceMapGraph";

export const REFERENCE_MAP_GRAPH_VIEW_TYPE = 'reference-map-graph-view'

export class GraphView extends ItemView {
    plugin: ReferenceMap
    referenceMapData: ReferenceMapData
    rootEl: Root | null
    viewContent: HTMLElement;
    updateChecker: UpdateChecker;

    constructor(leaf: WorkspaceLeaf, plugin: ReferenceMap) {
        super(leaf);
        this.plugin = plugin;
        this.referenceMapData = this.plugin.referenceMapData
        this.updateChecker = this.plugin.updateChecker
        this.viewContent = this.containerEl.querySelector(".view-content") as HTMLElement;
        this.rootEl = null;
        if (this.viewContent) {
            this.rootEl = createRoot(this.viewContent)
        } else {
            console.error("Could not find view content");
            return;
        }
        this.registerEvent(
            this.app.metadataCache.on(
                'changed',
                debounce(async (file) => {
                    const activeFile = this.app.workspace.getActiveFile()
                    if (activeFile && file === activeFile) {
                        const updated = await this.referenceMapData.prepare(activeFile, this.app.vault, this.app.metadataCache)
                        if (updated) {
                            EventBus.trigger(EVENTS.UPDATE);
                        }
                    }
                }, 100, true)
            )
        )

        this.registerEvent(
            this.app.workspace.on(
                'active-leaf-change',
                (leaf) => {
                    if (leaf) {
                        this.app.workspace.iterateRootLeaves((rootLeaf) => {
                            if (rootLeaf === leaf) {
                                if (
                                    leaf.view.getViewType() === 'markdown' ||
                                    leaf.view.getViewType() === 'empty'
                                ) {
                                    this.openGraph()
                                }
                            }
                        })
                    }
                }
            )
        )
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
        this.openGraph() //trigger a re-render
    }

    async onOpen() {
        this.openGraph()
    }

    onUnload = () => {
        EventBus.off(EVENTS.UPDATE, () => this.openGraph());
    }

    async onClose() {
        this.rootEl?.unmount()
        return super.onClose()
    }

    openGraph = async () => {
        const activeFile = this.app.workspace.getActiveViewOfType(MarkdownView)?.file
        await this.referenceMapData.prepare(activeFile, this.app.vault, this.app.metadataCache)

        this.rootEl?.render(
            <AppContext.Provider value={this.app}>
                <ReferenceMapGraph
                    width={this.viewContent.innerWidth}
                    height={this.viewContent.innerHeight}
                    settings={this.plugin.settings}
                    referenceMapData={this.referenceMapData}
                    updateChecker={this.updateChecker}
                />
            </AppContext.Provider>
        )
    }

}