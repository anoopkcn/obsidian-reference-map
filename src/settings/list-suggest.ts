// Credits go to Liam's Periodic Notes Plugin: https://github.com/liamcain/obsidian-periodic-notes

import { TAbstractFile, TFile, TFolder } from "obsidian";

import { TextInputSuggest } from "./suggest";
import { cslListRaw } from "src/utils/cslList";
import { langListRaw } from "src/utils/cslLangList";

export class FileSuggest extends TextInputSuggest<TFile> {
    getSuggestions(inputStr: string): TFile[] {
        const abstractFiles = this.app.vault.getAllLoadedFiles();
        const files: TFile[] = [];
        const lowerCaseInputStr = inputStr.toLowerCase();

        abstractFiles.forEach((file: TAbstractFile) => {
            if (
                file instanceof TFile &&
                file.extension === "md" &&
                file.path.toLowerCase().contains(lowerCaseInputStr)
            ) {
                files.push(file);
            }
        });

        return files;
    }

    renderSuggestion(file: TFile, el: HTMLElement): void {
        el.setText(file.path);
    }

    selectSuggestion(file: TFile): void {
        this.inputEl.value = file.path;
        this.inputEl.trigger("input");
        this.close();
    }
}

export class FolderSuggest extends TextInputSuggest<TFolder> {
    getSuggestions(inputStr: string): TFolder[] {
        const abstractFiles = this.app.vault.getAllLoadedFiles();
        const folders: TFolder[] = [];
        const lowerCaseInputStr = inputStr.toLowerCase();

        abstractFiles.forEach((folder: TAbstractFile) => {
            if (
                folder instanceof TFolder &&
                folder.path.toLowerCase().contains(lowerCaseInputStr)
            ) {
                folders.push(folder);
            }
        });

        return folders;
    }

    renderSuggestion(file: TFolder, el: HTMLElement): void {
        el.setText(file.path);
    }

    selectSuggestion(file: TFolder): void {
        this.inputEl.value = file.path;
        this.inputEl.trigger("input");
        this.close();
    }
}


export class CSLListSuggest extends TextInputSuggest<string> {
    getSuggestions(inputStr: string): string[] {
        const lowerCaseInputStr = inputStr.toLowerCase();
        const listItem = cslListRaw.filter(item => item.label.toLowerCase().contains(lowerCaseInputStr))
        return listItem.map(item => item.label);
    }

    renderSuggestion(item: string, el: HTMLElement): void {
        el.setText(item);
    }

    selectSuggestion(item: string): void {
        //using item get value from cslListRaw
        this.inputEl.value = item;
        this.inputEl.trigger("input");
        this.close();
    }
}

export class CSLLocaleSuggest extends TextInputSuggest<string> {
    getSuggestions(inputStr: string): string[] {
        const lowerCaseInputStr = inputStr.toLowerCase();
        const listItem = langListRaw.filter(item => item.label.toLowerCase().contains(lowerCaseInputStr))
        return listItem.map(item => item.label);
    }

    renderSuggestion(item: string, el: HTMLElement): void {
        el.setText(item);
    }

    selectSuggestion(item: string): void {
        //using item get value from cslListRaw
        this.inputEl.value = item;
        this.inputEl.trigger("input");
        this.close();
    }
}