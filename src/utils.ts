import { FileSystemAdapter, Notice } from "obsidian";
import path from "path";
import doiRegex from "doi-regex";
import { CiteKey, CslJson, IndexPaper, MetaData, SemanticPaper } from "./types";
import { BIBTEX_STANDARD_TYPES, COMMONWORDS, NUMBERS, PUNCTUATION } from "./constants";

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
    const citekeyRegex = /@([^\s]+)/gi;
    // explain the regex 
    const matches = content.matchAll(citekeyRegex);
    if (matches) {
        for (const match of matches) {
            output.add(match[1].replace(/\)+$|\]+$|\*+$|`+$/, ''));
        }
    }
    return output;
}

export function copyElToClipboard(el: string) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('electron').clipboard.writeText(el);
    new Notice('Copied to clipboard');
}

export function removeNullReferences(references: IndexPaper[]) {
    const result = references.filter((element) => {
        if (element.paper.paperId !== null) {
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

export const makeMetaData = (paper: SemanticPaper): MetaData => {
    const paperTitle = paper.title ? paper.title : "Unknown Title";
    let authors = "Unknown Authors";
    let author = "Unknown Author";
    if (paper.authors?.length > 0)
        author = paper.authors[0].name
            ? paper.authors[0].name
            : "Unknown Author";
    authors = paper.authors?.map((author) => author.name).join(", ");
    const year = paper.year ? paper.year.toString() : "Unknown Year";
    const journal = paper.journal ? `${paper.journal.name}, ${paper.journal.pages}, ${paper.journal.volume}` : "Unknown Journal";
    const abstract = paper.abstract ? paper.abstract : "No abstract available";
    const bibTex = paper.citationStyles?.bibtex
        ? paper.citationStyles.bibtex
        : "No BibTex available";
    const referenceCount = paper.referenceCount
        ? paper.referenceCount.toString()
        : "0";
    const citationCount = paper.citationCount
        ? paper.citationCount.toString()
        : "0";
    const influentialCount = paper.influentialCitationCount
        ? paper.influentialCitationCount.toString()
        : "0";
    let openAccessPdfUrl = "";
    if (paper.isOpenAccess) {
        openAccessPdfUrl = paper.openAccessPdf?.url
            ? paper.openAccessPdf.url
            : "";
    }
    const paperURL = paper.url ? paper.url : "Unknown URL";
    const doi = paper.externalIds?.DOI ? paper.externalIds.DOI : "Unknown DOI";
    return {
        bibtex: bibTex,
        title: paperTitle,
        author: author,
        authors: authors,
        year: year,
        journal: journal,
        abstract: abstract,
        url: paperURL,
        pdfurl: openAccessPdfUrl,
        doi: doi,
        referenceCount: referenceCount,
        citationCount: citationCount,
        influentialCount: influentialCount
    };
}

export const templateReplace = (template: string, data: MetaData, id = '') => {
    return template
        .replaceAll("{{id}}", id)
        .replaceAll("{{bibtex}}", data.bibtex)
        .replaceAll("{{title}}", data.title.replace(/[:\\\\/]/g, ''))
        .replaceAll("{{author}}", data.author.replace(/[:\\\\/]/g, ''))
        .replaceAll("{{authors}}", data.authors.replace(/[:\\\\/]/g, ''))
        .replaceAll("{{year}}", data.year.replace(/[:\\\\/]/g, ''))
        .replaceAll("{{journal}}", data.journal.replace(/[:\\\\/]/g, ''))
        .replaceAll("{{abstract}}", data.abstract)
        .replaceAll("{{url}}", data.url)
        .replaceAll("{{pdfurl}}", data.pdfurl)
        .replaceAll("{{doi}}", data.doi);
}

export const getCiteKeyIds = (citeKeys: Set<string>, citeKeyData: CslJson[]) => {
    const citeKeysMap: CiteKey[] = [];
    if (citeKeys.size > 0) {
        // get DOI form CiteKeyData corresponding to each item in citeKeys
        for (const citeKey of citeKeys) {
            const doi = citeKeyData.find(
                (item) => item.id === citeKey
            )?.DOI;
            if (doi) citeKeysMap.push({ citeKey: '@' + citeKey, paperId: doi.replace(/\s+/g, '') });
        }
    }
    return citeKeysMap
}

export const standardizeBibtex = (bibtex: string) => {
    const bibRegex = /(^@\[.*\]|@None)/gm
    //get words from group one
    const matches = bibtex.matchAll(bibRegex);
    if (matches) {
        for (const match of matches) {
            const possibleTypes = match[1].replace(/[@\\[\]'\s+]/g, '').split(',')
            //check if any of the possible types are in the BIBTEX_STANDARD_TYPES
            // if so return one type else type is 'misc'
            let type = possibleTypes.find((item) => BIBTEX_STANDARD_TYPES.includes(item.toLowerCase())) || 'misc'
            if (type === 'JournalArticle') type = 'article'
            return bibtex.replace(match[1], `@${type.toLowerCase()}`)
        }
    }
    return ''

}