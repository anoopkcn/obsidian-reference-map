import { App, Modal } from "obsidian";

export class SampleModal extends Modal {
    constructor(app: App) {
        super(app);
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.setText('Hello World!');
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}


