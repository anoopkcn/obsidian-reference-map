import { FileSystemAdapter } from "obsidian";
import path from "path";
import doiRegex from "doi-regex";
import { MetaData, SemanticPaper } from "./types";
import { COMMONWORDS, NUMBERS, PUNCTUATION } from "./constants";

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

    const arxivRegex = /arXiv.\s*(\d{4}\.\d{4,5})/ig
    const arXivMatches = modContent.matchAll(arxivRegex)
    const corpusRegex = /CorpusId.\s*(\d{4,})/ig
    const corpusMatches = modContent.matchAll(corpusRegex)
    const magRegex = /MAG.\s*(\d{4,})/ig
    const magMatches = modContent.matchAll(magRegex)
    const pmidRegex = /PMID.\s*(\d{4,})/ig
    const pmidMatches = modContent.matchAll(pmidRegex)
    const pmcidRegex = /PMCID.\s*(\d{4,})/ig
    const pmcidMatches = modContent.matchAll(pmcidRegex)
    const urlRegex = /URL.\s*(https:.[^\s]+)/ig
    const urlMatches = modContent.matchAll(urlRegex)
    const doi_matches = modContent.match(doiRegex());


    if (arXivMatches) {
        for (const match of arXivMatches) {
            output.add(`arXiv:${match[1]}`)
        }
    }
    if (corpusMatches) {
        for (const match of corpusMatches) {
            output.add(`CorpusId:${match[1]}`)
        }
    }
    if (magMatches) {
        for (const match of magMatches) {
            output.add(`MAG:${match[1]}`)
        }
    }
    if (pmidMatches) {
        for (const match of pmidMatches) {
            output.add(`PMID:${match[1]}`)
        }
    }

    if (pmcidMatches) {
        for (const match of pmcidMatches) {
            output.add(`PMCID:${match[1]}`)
        }
    }
    if (urlMatches) {
        for (const match of urlMatches) {
            output.add(`URL:${match[1]}`)
        }
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

export const getCiteKeys = (content: string): Set<string> => {
    const output = new Set<string>();
    // const citekeyRegex = /@[^{]+{([^,]+),/g;
    const citekeyRegex = /@(\w+)/gi;
    // explain the regex 
    const matches = content.matchAll(citekeyRegex);
    if (matches) {
        for (const match of matches) {
            output.add(match[1]);
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

// given a string of text, extract keywords from it excluding common words, punctuation, and numbers
export function extractKeywords(text: string) {
    const regex = new RegExp(`[${PUNCTUATION.join('')}]`, "gmi")
    const keywords = text.replace(regex, " ").replace(/\s\s+/g, ' ').split(" ");
    const result = keywords.filter((element) => {
        if (!COMMONWORDS.includes(element) && !PUNCTUATION.includes(element) && !NUMBERS.includes(element)) {
            return true;
        }
        return false;
    }
    );
    return result;
}

export const templateReplace = (template: string, data: MetaData) => {
    return template
        .replaceAll("{{bibtex}}", data.bibtex)
        .replaceAll("{{title}}", data.title)
        .replaceAll("{{author}}", data.author)
        .replaceAll("{{authors}}", data.authors)
        .replaceAll("{{year}}", data.year)
        .replaceAll("{{abstract}}", data.abstract)
        .replaceAll("{{url}}", data.url)
        .replaceAll("{{pdfurl}}", data.pdfurl)
        .replaceAll("{{doi}}", data.doi);
}
