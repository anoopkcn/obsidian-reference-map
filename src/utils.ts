import { FileSystemAdapter } from "obsidian";
import path from "path";
import doiRegex from "doi-regex";
import { SemanticPaper } from "./types";

export const fragWithHTML = (html: string) =>
    createFragment((frag) => (frag.createDiv().innerHTML = html));

export const errorlog = (data: Record<string, unknown>) => {
    console.error({ plugin: "Zotero Annotations", ...data });
};

export function areSetsEqual<T>(as: Set<T>, bs: Set<T>) {
    if (as.size !== bs.size) return false;
    return Array.from(as).every(element => {
        return bs.has(element);
    });
}

// Get normalized path
export const resolvePath = function (rawPath: string): string {
    const vaultRoot = this.app.vault.adapter instanceof FileSystemAdapter
        ? this.app.vault.adapter.getBasePath() : '/';
    return path.normalize(path.resolve(vaultRoot, rawPath))
}

// Given a markdown file contents regex match the DOI's from the file 
export const getPaperIds = (content: string): Set<string> => {
    const output = new Set<string>();
    const doi_matches = content.match(doiRegex());
    if (doi_matches) {
        for (const match of doi_matches) {
            if (!output.has(match)) {
                output.add(match);
            }
        }
    }
    return output;
}

export function copyElToClipboard(el: string) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('electron').clipboard.writeText(el);
}

export function removeNullReferences(references: SemanticPaper[]) {
    const result = references.filter((element) => {
        if (element.paperId !== null) {
            return true;
        }
        return false;
    });
    return result;
}