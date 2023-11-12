import { ItemView, MarkdownView, WorkspaceLeaf } from "obsidian";
import React from "react";
import { Root, createRoot } from "react-dom/client";
import { ReferenceMapGraph } from "./ReferenceMapGraph";
import ReferenceMap from "src/main";
import { AppContext } from "src/context";
import { ReferenceMapData } from "src/referenceData";
import EventBus, { EVENTS } from "src/EventBus";
import { UpdateChecker } from "src/utils";
import { REFERENCE_MAP_VIEW_TYPE } from "src/reactView";

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
        this.viewContent = this.containerEl.querySelector(".view-content") as HTMLElement;
        if (this.viewContent) {
            this.rootEl = createRoot(this.viewContent)
        } else {
            console.error("Could not find view content");
            return;
        }
        this.registerEvent(
            this.app.metadataCache.on('changed', async (file) => {
                const activeView = this.app.workspace.getActiveViewOfType(MarkdownView)
                if (activeView?.getViewType() === REFERENCE_MAP_VIEW_TYPE) return
                if (activeView && file === activeView.file) {
                    const fileCache = await this.app.vault.cachedRead(activeView.file)
                    this.updateChecker.basename = activeView?.file?.basename
                    if (fileCache) {
                        const updated = await this.prepare(activeView)
                        if (updated) {
                            EventBus.trigger(EVENTS.UPDATE);
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
                            if (rootLeaf.view.getViewType() !== REFERENCE_MAP_VIEW_TYPE) this.openGraph()
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
        EventBus.off(EVENTS.UPDATE, () => { });
    }

    async onClose() {
        this.rootEl?.unmount()
        return super.onClose()
    }

    prepare = async (activeView: MarkdownView | null) => {
        const settings = this.plugin.settings
        let isUpdate = false
        if (activeView?.file) {
            let isFm = false
            let isFn = false
            let isIdx = false
            let isCite = false
            this.updateChecker.basename = activeView.file.basename
            const fileCache = activeView.file ? await this.app.vault.cachedRead(activeView.file) : ''
            const fileMetadataCache = this.app.metadataCache.getFileCache(activeView.file);
            const isLibrary = settings.searchCiteKey && this.referenceMapData.library.libraryData !== null
            if (isLibrary && settings.autoUpdateCitekeyFile) this.referenceMapData.loadLibrary(false)
            this.updateChecker.setCache(fileCache, fileMetadataCache)
            const prefix = settings.findCiteKeyFromLinksWithoutPrefix ? '' : '@';

            if (settings.searchFrontMatter) isFm = this.updateChecker.checkFrontmatterUpdate(settings.searchFrontMatterKey)
            if (settings.searchTitle) isFn = this.updateChecker.checkFileNameUpdate()
            if (settings.searchCiteKey) isCite = this.updateChecker.checkCiteKeysUpdate(prefix)
            isIdx = this.updateChecker.checkIndexIdsUpdate()
            isUpdate = isFm || isFn || isIdx || isCite
        } 
        else {
            this.updateChecker.resetCache()
            isUpdate = true
        }
        return isUpdate
    }

    openGraph = async () => {
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView)
        if (activeView?.getViewType() === REFERENCE_MAP_VIEW_TYPE) return
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