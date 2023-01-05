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

export function camelToNormalCase(str: string) {
    return (
        str.replace(/([A-Z])/g, " $1").replace(/^./, function (str) {
            return str.toUpperCase();
        })
    );
}

// Get normalized path
export const resolvePath = function (rawPath: string): string {
    const vaultRoot = this.app.vault.adapter instanceof FileSystemAdapter
        ? this.app.vault.adapter.getBasePath() : '/';
    return path.normalize(path.resolve(vaultRoot, rawPath))
}

// Given a markdown file contents regex match the DOI's from the file 
export const getPaperIds = (content: string): Set<string> => {
    const modContent = content.replace("](", " ")
    const output = new Set<string>();
    const arxivRegex = /arXiv.\s?(\d{4}\.\d{4,5})/i
    const arXivMatches = modContent.match(arxivRegex)
    const corpusRegex = /CorpusId.\s?(\d{4,})/i
    const corpusMatches = modContent.match(corpusRegex)
    const magRegex = /MAG.\s?(\d{4,})/i
    const magMatches = modContent.match(magRegex)
    const pmidRegex = /PMID.\s?(\d{4,})/i
    const pmidMatches = modContent.match(pmidRegex)
    const pmcidRegex = /PMCID.\s?(\d{4,})/i
    const pmcidMatches = modContent.match(pmcidRegex)
    const urlRegex = /URL.\s?(https:.[^\s]+)/i
    const urlMatches = modContent.match(urlRegex)
    const doi_matches = modContent.match(doiRegex());

    if (arXivMatches) {
        arXivMatches.slice(1).forEach(match => {
            output.add(`arXiv:${match}`)
        })
    }
    if (corpusMatches) {
        corpusMatches.slice(1).forEach(match => {
            output.add(`CorpusId:${match}`)
        })
    }
    if (magMatches) {
        magMatches.slice(1).forEach(match => {
            output.add(`MAG:${match}`)
        })
    }
    if (pmidMatches) {
        pmidMatches.slice(1).forEach(match => {
            output.add(`PMID:${match}`)
        })
    }
    if (pmcidMatches) {
        pmcidMatches.slice(1).forEach(match => {
            output.add(`PMCID:${match}`)
        })
    }
    if (urlMatches) {
        urlMatches.slice(1).forEach(match => {
            output.add(`URL:${match}`)
        })
    }
    if (doi_matches) {
        for (const match of doi_matches) {
            if (!output.has(match)) {
                output.add(match.replace(/\)+$|\]+$|\*+$|_+$|`+$/, ''));
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