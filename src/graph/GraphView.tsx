import { ItemView, WorkspaceLeaf } from "obsidian";
import React from "react";
import { Root, createRoot } from "react-dom/client";
import { ReferenceMapGraph } from "./ReferenceMapGraph";
import ReferenceMap from "src/main";

export const REFERENCE_MAP_GRAPH_VIEW_TYPE = 'reference-map-graph-view'


export class GraphView extends ItemView {
    plugin: ReferenceMap
    rootEl: Root
    viewContent: HTMLElement;

    constructor(leaf: WorkspaceLeaf, plugin: ReferenceMap) {
        super(leaf);
        this.plugin = plugin;
        this.navigation = false
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
        const data = {
            "nodes": [
                {
                    "id": "id1",
                    "name": "citedPaper",
                    "val": 5,
                    "color": "#7ABA57"
                },
                {
                    "id": "id2",
                    "name": "indexPaper",
                    "val": 10,
                    "color": "#61C1E8"
                },
                {
                    "id": "id3",
                    "name": "citingPaper",
                    "val": 2,
                    "color": "#A15399"
                },
            ],
            "links": [
                {
                    "source": "id1",
                    "target": "id2"
                },
                {
                    "source": "id2",
                    "target": "id3"
                }
            ]
        }
        this.rootEl.render(
            <ReferenceMapGraph
                data={data}
                width={this.viewContent.innerWidth}
                height={this.viewContent.innerHeight}
            />
        )
    }

}