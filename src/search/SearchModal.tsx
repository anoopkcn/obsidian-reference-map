import { ButtonComponent, Modal, Setting, TextComponent, Notice } from 'obsidian';
import { ViewManager } from 'src/data/viewManager';
import { getPaperIds } from 'src/utils/parser';
import ReferenceMap from 'src/main';
import { Reference } from 'src/apis/s2agTypes';

export class ReferenceSearchModal extends Modal {
    private isBusy = false;
    private okBtnRef?: ButtonComponent;

    constructor(
        private plugin: ReferenceMap,
        private query: string,
        private mode: string,
        private callback: (error: Error | null, results?: Reference[]) => void,
    ) {
        super(plugin.app);
    }

    setBusy(busy: boolean) {
        this.isBusy = busy;
        this.okBtnRef?.setDisabled(busy);
        this.okBtnRef?.setButtonText(busy ? 'Requesting...' : 'Search');
    }

    async searchReference() {
        if (!this.query) {
            throw new Error('ORM: No query entered.');
        }

        if (!this.isBusy) {
            try {
                this.setBusy(true);
                // If query contains a DOI or other ID, extract it and get index paper directly using that ID as paperId
                // else search for papers using the query string
                const paperIds = getPaperIds(this.query);
                if (paperIds.size > 0) {
                    const paperPromises = Array.from(paperIds).map((paperId) => new ViewManager(this.plugin).getIndexPaper(paperId));
                    const papers = await Promise.all(paperPromises);
                    const validPapers = papers.filter((paper) => paper !== null) as Reference[];
                    if (validPapers.length > 0) {
                        this.callback(null, validPapers);
                        this.close();
                        return;
                    }
                } else {
                    const searchResults = await new ViewManager(this.plugin).searchIndexPapers(this.query, this.plugin.settings.modalSearchLimit, false)
                    this.setBusy(false);

                    if (!searchResults?.length) {
                        new Notice(`No results found for "${this.query}"`);
                        return;
                    }
                    this.callback(null, searchResults);
                }
            } catch (err) {
                this.callback(err as Error);
            }
            this.close();
        }
    }

    submitEnterCallback(event: KeyboardEvent) {
        if (event.key === 'Enter' && !event.isComposing) {
            this.searchReference();
        }
    }

    onOpen() {
        const { contentEl } = this;

        const search_heading = contentEl.createDiv({ cls: 'orm-search-modal-input-heading', text: 'Search References' });
        search_heading.createDiv({ cls: 'orm-search-modal-input-heading-mode', text: `${this.mode}` });

        contentEl.createDiv({ cls: 'orm-search-modal-input' }, settingItem => {
            new TextComponent(settingItem)
                .setValue(this.query)
                .setPlaceholder('Search by keyword, title, authors, journal, abstract, ID, DOI, etc.')
                .onChange(value => (this.query = value))
                .inputEl.addEventListener('keydown', this.submitEnterCallback.bind(this));
        });

        new Setting(contentEl)
            .setClass('orm-search-modal-input-button')
            .addButton(btn => {
                return (this.okBtnRef = btn
                    .setButtonText('Search')
                    .setCta()
                    .onClick(() => {
                        this.searchReference();
                    }));
            });
    }

    onClose() {
        this.contentEl.empty();
    }
}