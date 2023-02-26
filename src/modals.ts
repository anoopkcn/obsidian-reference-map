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
import { MetaData, SemanticPaper } from './types';
import { makeMetaData } from './utils';

export class ReferenceSearchModal extends Modal {
  plugin: ReferenceMap
  viewManager: ViewManager
  private isBusy = false;
  private okBtnRef?: ButtonComponent;

  constructor(
    plugin: ReferenceMap,
    private query: string,
    private callback: (error: Error | null, result?: SemanticPaper[]) => void,
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

    contentEl.createEl('h2', { text: 'Search References' });

    contentEl.createDiv({ cls: 'orm-search-modal-input' }, settingItem => {
      new TextComponent(settingItem)
        .setValue(this.query)
        .setPlaceholder('Search by keyword, title, authors, etc.')
        .onChange(value => (this.query = value))
        .inputEl.addEventListener('keydown', this.submitEnterCallback.bind(this));
    });

    new Setting(contentEl).addButton(btn => {
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

export class ReferenceSuggestModal extends SuggestModal<SemanticPaper> {
  constructor(
    app: App,
    private readonly suggestion: SemanticPaper[],
    private onChoose: (error: Error | null, result?: MetaData) => void,
  ) {
    super(app);
  }

  // Returns all available suggestions.
  getSuggestions(query: string): SemanticPaper[] {
    return this.suggestion.filter(reference => {
      const searchQuery = query?.toLowerCase();
      return (
        reference.title?.toLowerCase().includes(searchQuery)
      );
    });
  }

  // Renders each suggestion item.
  renderSuggestion(reference: SemanticPaper, el: HTMLElement) {
    const data = makeMetaData(reference)
    el.createEl('div', { cls: 'orm-modal-paper-title', text: data.title });
    el.createEl('div', { cls: 'orm-modal-paper-authors', text: data.authors });
    el.createEl('div', { cls: 'orm-modal-paper-year', text: `${data.year}, ${data.journal}, ${data.volume}, ${data.pages}` });
  }

  // Perform action on the selected suggestion.
  onChooseSuggestion(reference: SemanticPaper) {
    this.onChoose(null, makeMetaData(reference));
  }
}