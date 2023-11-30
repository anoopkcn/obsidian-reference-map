import React from "react";
import { Root, createRoot } from "react-dom/client";
import { ItemView, MarkdownView, TFile, WorkspaceLeaf } from "obsidian";
import { AppContext } from "src/context";
import EventBus, { EVENTS } from "src/events";
import { ReferenceMapData } from "src/data/data";
import { UpdateChecker } from "src/data/updateChecker";
import ReferenceMap from "src/main";
import { ReferenceMapGraph } from "./ReferenceMapGraph";
import { getCanvasContent, getLinkedFiles } from 'src/utils/functions'

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
                const activeFile = this.app.workspace.getActiveFile()
                if (activeFile && file === activeFile) {
                    const updated = await this.prepare(activeFile)
                    if (updated) {
                        EventBus.trigger(EVENTS.UPDATE);
                    }
                }
            })
        )

        this.registerEvent(
            this.app.workspace.on('active-leaf-change', (leaf) => {
                if (leaf) {
                    this.app.workspace.iterateRootLeaves((rootLeaf) => {
                        if (rootLeaf === leaf) {
                            if (
                                leaf.view.getViewType() === 'markdown' ||
                                leaf.view.getViewType() === 'canvas' ||
                                leaf.view.getViewType() === 'empty'
                            ) {
                                this.openGraph()
                            }
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
        EventBus.off(EVENTS.UPDATE, () => this.openGraph());
    }

    async onClose() {
        this.rootEl?.unmount()
        return super.onClose()
    }

    prepare = async (activeFile: TFile | null | undefined) => {
        if (activeFile === undefined) return false
        const settings = this.plugin.settings
        let isUpdate = false
        let fileCache = ''
        if (activeFile) {
            let isFm = false, isFn = false, isIdx = false, isCite = false;
            this.updateChecker.basename = activeFile.basename
            try {
                fileCache = await this.app.vault.read(activeFile);
            } catch (e) {
                fileCache = await this.app.vault.cachedRead(activeFile);
            }
            if (activeFile.extension === 'canvas') {
                fileCache += await getCanvasContent(fileCache)
            }
            if (settings.lookupLinkedFiles) {
                const linkedFiles = getLinkedFiles(activeFile)
                for (const file of linkedFiles) {
                    if (file) {
                        const cache = await this.app.vault.cachedRead(file)
                        fileCache += cache
                    }
                }
            }
            const fileMetadataCache = this.app.metadataCache.getFileCache(activeFile);
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
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        const activeFile = activeView?.file
        await this.prepare(activeFile)

        this.rootEl?.render(
            <AppContext.Provider value={this.app}>
                <ReferenceMapGraph
                    width={this.viewContent.innerWidth}
                    height={this.viewContent.innerHeight}
                    settings={this.plugin.settings}
                    cacheDir={this.plugin.cacheDir}
                    referenceMapData={this.referenceMapData}
                    updateChecker={this.updateChecker}
                />
            </AppContext.Provider>
        )
    }

}