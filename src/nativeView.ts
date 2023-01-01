import { ItemView, MarkdownView, WorkspaceLeaf, setIcon } from "obsidian";
import ReferenceMap from "./main";
import { t } from "./lang/helpers";
import { copyElToClipboard } from './utils';
import { ViewManager } from "./viewManager";

export const REFERENCE_MAP_VIEW_TYPE = "reference-map-view";

export class ReferenceMapView extends ItemView {
    plugin: ReferenceMap;
    viewManager: ViewManager;
    activeMarkdownLeaf: MarkdownView;

    constructor(leaf: WorkspaceLeaf, plugin: ReferenceMap) {
        super(leaf);
        this.plugin = plugin;
        this.viewManager = new ViewManager(plugin);

        this.registerEvent(
            app.metadataCache.on('changed', (file) => {
                const activeView = app.workspace.getActiveViewOfType(MarkdownView);
                if (activeView && file === activeView.file) {
                    this.processReferences();
                }
            })
        );

        this.registerEvent(
            app.workspace.on('active-leaf-change', (leaf) => {
                if (leaf) {
                    app.workspace.iterateRootLeaves((rootLeaf) => {
                        if (rootLeaf === leaf) {
                            if (leaf.view instanceof MarkdownView) {
                                this.processReferences();
                            } else {
                                this.setNoContentMessage();
                            }
                        }
                    });
                }
            })
        );


        this.processReferences();
    }

    processReferences = async () => {
        const activeView = app.workspace.getActiveViewOfType(MarkdownView);
        if (activeView) {
            try {
                const rootPapers = await this.viewManager.getRootPapers(activeView.file);
                const paperEls: HTMLDivElement[] = []
                if (rootPapers) {
                rootPapers?.forEach((rootPaper) => {
                    if (rootPaper) {
                        const bib = rootPaper.citationStyles.bibtex;
                        const paperEl = this.containerEl.createEl("div", { cls: "orm-root-paper" });
                        paperEl.createEl("div", { text: rootPaper.title, cls: "orm-paper-title" });
                        paperEl.createEl("div", { text: rootPaper.authors[0].name + ", " + rootPaper.year, cls: "orm-paper-authors" });
                        paperEl.createEl("div", { cls: "orm-paper-buttons" },
                            (div) => {
                                div.createDiv(
                                    {
                                        cls: 'orm-copy-bibtex',
                                        attr: {
                                            'aria-label': 'Copy reference as bibtex',
                                        },
                                    },
                                    (btn) => {
                                        setIcon(btn, 'ReferenceMapCopyIcon');
                                        btn.onClickEvent(() => copyElToClipboard(bib));
                                    }
                                );
                                if (rootPaper.isOpenAccess) {
                                    div.createDiv(
                                        {
                                            cls: 'orm-openaccesson-bibtex',
                                            attr: {
                                                'aria-label': 'Open acess to reference',
                                            },
                                        },
                                        (btn) => {
                                            setIcon(btn, 'ReferenceMapOpenAccessActiveIcon');
                                            // btn.onClickEvent(() => copyElToClipboard(bib));
                                        }
                                    );
                                } else {
                                    div.createDiv(
                                        {
                                            cls: 'orm-openaccessoff-bibtex',
                                            attr: {
                                                'aria-label': 'Open acess to reference',
                                            },
                                        },
                                        (btn) => {
                                            setIcon(btn, 'ReferenceMapOpenAccessPassiveIcon');
                                            // btn.onClickEvent(() => copyElToClipboard(bib));
                                        }
                                    );
                                }
                                div.createDiv(
                                    {
                                        cls: 'orm-referenceCount',
                                        attr: {
                                            'aria-label': 'Show references',
                                        },
                                    },
                                    (btn) => {
                                        btn.textContent = rootPaper.referenceCount.toString();
                                        // btn.onClickEvent(() => copyElToClipboard(bib));
                                    }
                                );
                                div.createDiv(
                                    {
                                        cls: 'orm-citationCount',
                                        attr: {
                                            'aria-label': 'Show citations',
                                        },
                                    },
                                    (btn) => {
                                        btn.textContent = rootPaper.citationCount.toString();
                                        // btn.onClickEvent(() => copyElToClipboard(bib));
                                    }
                                );
                                div.createDiv(
                                    {
                                        cls: 'orm-influential-citationCount',
                                        attr: {
                                            'aria-label': 'Influential Citation Count',
                                        },
                                    },
                                    (btn) => {
                                        btn.textContent = rootPaper.influentialCitationCount.toString();
                                        // btn.onClickEvent(() => copyElToClipboard(bib));
                                    }
                                );

                            }
                        );
                        paperEls.push(paperEl)
                    }
                });
                this.setViewContent(paperEls);
                } else {
                    this.setNoContentMessage(`No VALID reference ID's are found in the active document`);
                }
            } catch (e) {
                console.error('Error in Reference Map View: processReferences', e);
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
                    cls: 'orm-view-title',
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
        return t("REFERENCE_MAP")
    }

    getIcon() {
        return 'ReferenceMapIconScroll';
    }

    // async onOpen() {
    //     const container = this.containerEl.children[1];
    //     container.empty();
    //     container.createEl("span", { text: "Reference map" });
    // }

    setNoContentMessage(message = '') {
        let showMessage = `No reference ID's are found in the active document`
        if (message) {
            showMessage = message;
        }
        this.setMessage(showMessage);
    }

    setMessage(message: string) {
        this.contentEl.empty();
        this.contentEl.createDiv({
            cls: 'orm-no-content',
            text: message,
        });
    }

    async onClose() {
        this.viewManager.cache.clear();
        return super.onClose();
    }
}