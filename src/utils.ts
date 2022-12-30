import { FileSystemAdapter } from "obsidian";
import path from "path";
import doiRegex from "doi-regex";

export const fragWithHTML = (html: string) =>
    createFragment((frag) => (frag.createDiv().innerHTML = html));

export const errorlog = (data: Record<string, unknown>) => {
    console.error({ plugin: "Zotero Annotations", ...data });
};

// Get normalized path
export const resolvePath = function (rawPath: string): string {
    const vaultRoot = this.app.vault.adapter instanceof FileSystemAdapter
        ? this.app.vault.adapter.getBasePath() : '/';
    return path.normalize(path.resolve(vaultRoot, rawPath))
}

// Given a markdown file contents regex match the DOI's from the file 
export const getPaperIds = (content: string): string[] => {
    const doi_matches = content.match(doiRegex());
    if (doi_matches) {
        return doi_matches.unique();
    }
    return [];
}

export function copyElToClipboard(el: string) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('electron').clipboard.writeText(el);
}