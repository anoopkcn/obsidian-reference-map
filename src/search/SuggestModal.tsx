import { SuggestModal, App } from "obsidian";
import { Reference } from "src/apis/s2agTypes";
import { MetaData } from "src/types";
import { makeMetaData } from "src/utils/postprocess";

export class ReferenceSuggestModal extends SuggestModal<Reference> {
    constructor(
        app: App,
        private readonly suggestion: Reference[],
        private onChoose: (error: Error | null, results?: MetaData) => void
    ) {
        super(app);
    }

    // Returns all available suggestions.
    getSuggestions(query: string): Reference[] {
        return this.suggestion.filter(reference => reference.title?.toLowerCase().includes(query?.toLowerCase()));
    }

    // Renders each suggestion item.
    renderSuggestion(reference: Reference, el: HTMLElement) {
        const data = makeMetaData({ id: reference.paperId, location: null, paper: reference });
        el.createEl('div', { cls: 'orm-modal-paper-title', text: data.title });
        el.createEl('div', { cls: 'orm-modal-paper-authors', text: data.authors });
        el.createEl('div', { cls: 'orm-modal-paper-year', text: `${data.year}, ${data.journal}, ${data.volume}, ${data.pages}` });
    }

    // Perform action on the selected suggestion.
    onChooseSuggestion(reference: Reference) {
        this.onChoose(null, makeMetaData({ id: reference.paperId, location: null, paper: reference }));
    }
}
