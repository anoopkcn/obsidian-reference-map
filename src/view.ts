import { ItemView, MarkdownView, WorkspaceLeaf, setIcon } from "obsidian";
import ReferenceMap from "./main";
import { t } from "./lang/helpers";
import { getPaperMetadata } from './referencemap';
import { copyElToClipboard, getPaperIds } from './utils';

export const REFERENCE_MAP_VIEW_TYPE = "reference-map-view";

export class ReferenceMapView extends ItemView {
    plugin: ReferenceMap;
    constructor(leaf: WorkspaceLeaf, plugin: ReferenceMap) {
        super(leaf);

        this.plugin = plugin;
        // this.viewManager = new ViewManager(plugin);

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
                const fileContent = await app.vault.cachedRead(activeView.file);
                const paperIds = getPaperIds(fileContent)
                // console.log(paperIds)

                if (paperIds.length !== 0) {
                    const paper = await getPaperMetadata(paperIds[0]);
                    const rootPaper = paper[0];
                    console.log(rootPaper)
                    const bib = rootPaper.citationStyles.bibtex;
                    const paperEl = this.containerEl.createEl("div", { cls: "orm-paper" });
                    paperEl.createDiv(
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
                    paperEl.createEl("div", { text: rootPaper.title, cls: "orm-paper-title" });
                    // paperEl.createEl("div", { text: `<a href="https://www.semanticscholar.org/author/${rootPaper.authors[0].authorId}">${rootPaper.authors[0].name}</a>`, cls: "orm-paper-authors" });
                    this.setViewContent(paperEl);
                } else {
                    this.setNoContentMessage();
                }

            } catch (e) {
                console.error('Error in Reference Map View: processReferences', e);
            }
        } else {
            this.setNoContentMessage();
        }
    };

    setViewContent(bib: HTMLElement) {
        if (bib && this.contentEl.firstChild !== bib) {
            this.contentEl.empty();
            this.contentEl.createDiv(
                {
                    cls: 'orm-view-title',
                },
                (div) => {
                    div.createDiv({ text: this.getDisplayText() });
                }
            );
            this.contentEl.append(bib);
        } else if (!bib) {
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
        return 'ReferenceMapIcon';
    }

    // async onOpen() {
    //     const container = this.containerEl.children[1];
    //     container.empty();
    //     container.createEl("span", { text: "Reference map" });
    // }
    setNoContentMessage() {
        this.setMessage(t('NO_REFERENCES_IN_FILE'));
    }
    setMessage(message: string) {
        this.contentEl.empty();
        this.contentEl.createDiv({
            cls: 'orm-no-content',
            text: message,
        });
    }

    async onClose() {
        // Nothing to clean up.
    }
}