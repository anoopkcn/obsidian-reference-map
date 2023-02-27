import {
  ButtonComponent,
  Modal,
  Setting,
  TextComponent,
  Notice,
  SuggestModal,
  App
} from 'obsidian';
import ReferenceMap from './main';
import { ViewManager } from './viewManager';
import { MetaData, Reference } from './types';
import { makeMetaData } from './utils';

export class ReferenceSearchModal extends Modal {
  plugin: ReferenceMap
  viewManager: ViewManager
  private isBusy = false;
  private okBtnRef?: ButtonComponent;

  constructor(
    plugin: ReferenceMap,
    private query: string,
    private mode: string,
    private callback: (error: Error | null, result?: Reference[]) => void,
  ) {
    super(plugin.app);
    this.plugin = plugin
    this.viewManager = new ViewManager(plugin)
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
        const searchResults = await this.viewManager.searchIndexPapers(this.query, this.plugin.settings.modalSearchLimit, false)
        this.setBusy(false);

        if (!searchResults?.length) {
          new Notice(`No results found for "${this.query}"`);
          return;
        }
        this.callback(null, searchResults);
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

    // contentEl.createEl('h2', { text: 'Search References' });
    const search_heading = contentEl.createDiv({ cls: 'orm-search-modal-input-heading', text: 'Search References' });
    search_heading.createDiv({ cls: 'orm-search-modal-input-heading-mode', text: `${this.mode}` });  

    contentEl.createDiv({ cls: 'orm-search-modal-input' }, settingItem => {
      new TextComponent(settingItem)
        .setValue(this.query)
        .setPlaceholder('Search by keyword, title, authors, journal, abstract, etc.')
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

export class ReferenceSuggestModal extends SuggestModal<Reference> {
  constructor(
    app: App,
    private readonly suggestion: Reference[],
    private onChoose: (error: Error | null, result?: MetaData) => void,
  ) {
    super(app);
  }

  // Returns all available suggestions.
  getSuggestions(query: string): Reference[] {
    return this.suggestion.filter(reference => {
      const searchQuery = query?.toLowerCase();
      return (
        reference.title?.toLowerCase().includes(searchQuery)
      );
    });
  }

  // Renders each suggestion item.
  renderSuggestion(reference: Reference, el: HTMLElement) {
    const data = makeMetaData(reference)
    el.createEl('div', { cls: 'orm-modal-paper-title', text: data.title });
    el.createEl('div', { cls: 'orm-modal-paper-authors', text: data.authors });
    el.createEl('div', { cls: 'orm-modal-paper-year', text: `${data.year}, ${data.journal}, ${data.volume}, ${data.pages}` });
  }

  // Perform action on the selected suggestion.
  onChooseSuggestion(reference: Reference) {
    this.onChoose(null, makeMetaData(reference));
  }
}