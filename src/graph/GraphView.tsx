import { ItemView, MarkdownView, WorkspaceLeaf } from "obsidian";
import React from "react";
import { Root, createRoot } from "react-dom/client";
import { ReferenceMapGraph } from "./ReferenceMapGraph";
import ReferenceMap from "src/main";
import { AppContext } from "src/context";
import { ReferenceMapData } from "src/referenceData";
import EventBus from "src/EventBus";
import { UpdateChecker } from "src/utils";

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
        this.updateChecker = new UpdateChecker()
        this.updateChecker.library = this.referenceMapData.library
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
                    const fileCache = await this.app.vault.cachedRead(activeView.file)
                    this.updateChecker.basename = activeView?.file?.basename
                    if (fileCache) {
                        const updated = await this.prepare(activeView)
                        console.log('updated', updated)
                        if (updated) {
                            console.log('triggering keys-changed', this.updateChecker.citeKeys)
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
        EventBus.off('keys-changed', () => { });
    }

    async onClose() {
        this.rootEl?.unmount()
        return super.onClose()
    }

    prepare = async (activeView: MarkdownView | null) => {
        const settings = this.plugin.settings
        let isUpdate = false
        if (activeView?.file) {
            this.updateChecker.basename = activeView.file.basename
            const fileCache = activeView.file ? await this.app.vault.cachedRead(activeView.file) : ''
            const fileMetadataCache = this.app.metadataCache.getFileCache(activeView.file);
            const isLibrary = settings.searchCiteKey && this.referenceMapData.library.libraryData !== null
            if (isLibrary && settings.autoUpdateCitekeyFile) this.referenceMapData.loadLibrary(false)
            this.updateChecker.setCache(fileCache, fileMetadataCache)
            const prefix = settings.findCiteKeyFromLinksWithoutPrefix ? '' : '@';

            if (settings.searchFrontMatter) this.updateChecker.checkFrontmatterUpdate(settings.searchFrontMatterKey)
            if (settings.searchTitle) this.updateChecker.checkFileNameUpdate()
            this.updateChecker.checkIndexIdsUpdate()
            if (settings.searchCiteKey) isUpdate = this.updateChecker.checkCiteKeysUpdate(prefix)
        }
        return isUpdate
    }

    openGraph = async () => {
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView)
        await this.prepare(activeView)

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