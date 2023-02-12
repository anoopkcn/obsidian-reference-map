import { FileSystemAdapter, Notice } from "obsidian";
import path from "path";
import doiRegex from "doi-regex";
import { CiteKey, citeKeyLibrary, IndexPaper, MetaData, SemanticPaper } from "./types";
import { BIBTEX_STANDARD_TYPES, COMMON_WORDS, NUMBERS, PUNCTUATION, SEARCH_PARAMETERS, VALID_S2AG_API_URLS } from "./constants";

export const fragWithHTML = (html: string) =>
    createFragment((frag) => (frag.createDiv().innerHTML = html));

export const errorlog = (data: Record<string, unknown>) => {
    console.error({ plugin: "Zotero Annotations", ...data });
};

export const isEmpty = (obj: SemanticPaper): boolean => {
    return Object.keys(obj).length === 0
}

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
    const modContent = content.replaceAll("](", " ")
    const output: string[] = []

    const arxivRegex = /arXiv.\s*(\d{4}\.\d{4,5})/ig
    const arXivMatches = modContent.matchAll(arxivRegex)
    const corpusRegex = /CorpusId.\s*(\d{4,})/ig
    const corpusMatches = modContent.matchAll(corpusRegex)
    const magRegex = /MAG.\s*(\d{4,})/ig
    const magMatches = modContent.matchAll(magRegex)
    const pmidRegex = /PMID.\s*(\d{4,})/ig
    const pmidMatches = modContent.matchAll(pmidRegex)
    const pmcidRegex = /PMCID.\s*([a-zA-Z]*\d{4,})/ig
    const pmcidMatches = modContent.matchAll(pmcidRegex)
    const urlRegex = /URL.\s*(http[s]?:.[^\s]+)/ig
    const urlMatches = modContent.matchAll(urlRegex)
    const doi_matches = modContent.match(doiRegex());

    if (arXivMatches) {
        for (const match of arXivMatches) {
            output.push(`arXiv:${match[1]}`)
        }
    }
    if (corpusMatches) {
        for (const match of corpusMatches) {
            output.push(`CorpusId:${match[1]}`)
        }
    }
    if (magMatches) {
        for (const match of magMatches) {
            output.push(`MAG:${match[1]}`)
        }
    }
    if (pmidMatches) {
        for (const match of pmidMatches) {
            output.push(`PMID:${match[1]}`)
        }
    }

    if (pmcidMatches) {
        for (const match of pmcidMatches) {
            output.push(`PMCID:${match[1]}`)
            console.log(match[1])
        }
    }
    if (urlMatches) {
        for (const match of urlMatches) {
            if (VALID_S2AG_API_URLS.some(item => match[1].includes(item))) {
                output.push(`URL:${match[1]}`)
            }
        }
    }
    if (doi_matches) {
        for (const match of doi_matches) {
            output.push(match.replace(/\)+$|\]+$|\*+$|_+$|`+$/, ''));
        }
    }
    return new Set(output.sort());
}

export const sanitizeDOI = (dirtyDOI: string) => {
    const doi_matches = dirtyDOI.match(doiRegex());
    if (doi_matches) {
        for (const match of doi_matches) {
            return match.replace(/\)+$|\]+$|\*+$|_+$|`+$/, '').replace(/\s+/g, '');
        }
    }
    return dirtyDOI.replace(/\s+/g, '')
}

export const getCiteKeys = (content: string): Set<string> => {
    const output: string[] = [];
    // const citekeyRegex = /@[^{]+{([^,]+),/g;
    const citekeyRegex = /@([^\s]+)/gi;
    const citekeyRegex2 = /\[+([^\s].*)\]+/ig
    const matches = content.replaceAll(/[\])*`]+/gi, ' ').matchAll(citekeyRegex);
    const matches2 = content.matchAll(citekeyRegex2);
    if (matches) {
        for (const match of matches) {
            output.push(match[1].replace(/\)+$|\]+$|\*+$|`+$/, ''));
        }
    }
    if (matches2) {
        for (const match of matches2) {
            const trial = match[1].split(' ')
            trial.forEach(item => {
                output.push(item.replace(/^@+|\)+$|\]+$|\*+$|`+$/gmi, ''));
            })
        }
    }

    return new Set(output.sort());
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
        if (!COMMON_WORDS.includes(element) && !PUNCTUATION.includes(element) && !NUMBERS.includes(element)) {
            return true;
        }
        return false;
    }
    );
    return result;
}

export const makeMetaData = (paper: SemanticPaper): MetaData => {
    const paperTitle = paper.title ? paper.title.trim() : "Unknown Title";
    let authors = "Unknown Authors";
    let author = "Unknown Author";
    if (paper.authors?.length > 0)
        author = paper.authors[0].name
            ? paper.authors[0].name.trim()
            : "Unknown Author";
    authors = paper.authors?.map((author) => author.name).join(", ");
    const year = paper.year ? paper.year.toString().trim() : "Unknown Year";
    const journal = paper.journal ? `${paper.journal.name}`.trim() : "Unknown Journal";
    const volume = paper.journal?.volume ? paper.journal?.volume.trim() : "Unknown Volume";
    const pages = paper.journal?.pages ? paper.journal?.pages.trim() : "Unknown Pages";
    const abstract = paper.abstract ? paper.abstract.trim() : "No abstract available";
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
        volume: volume,
        pages: pages,
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
        .replaceAll("{{volume}}", data.volume.replace(/[:\\\\/]/g, ''))
        .replaceAll("{{pages}}", data.pages.replace(/[:\\\\/]/g, ''))
        .replaceAll("{{abstract}}", data.abstract)
        .replaceAll("{{url}}", data.url)
        .replaceAll("{{pdfurl}}", data.pdfurl)
        .replaceAll("{{doi}}", data.doi);
}

export const setCiteKeyId = (paperId: string, citeKeyData: citeKeyLibrary[], adapter = ''): string => {
    if (adapter === 'csl-json') {
        const citeKey = citeKeyData.find((item) =>
            item?.DOI?.toLowerCase() === paperId.toLowerCase() ||
            item?.DOI?.toLowerCase() === `https://doi.org/${paperId.toLowerCase()}` ||
            item?.URL?.toLowerCase() === paperId.replace('URL:', '').toLowerCase()
        )?.id;
        return citeKey ? '@' + citeKey : paperId;
    } else if (adapter === 'bibtex') {
        const citeKey = citeKeyData.find((item) =>
            item.fields?.doi?.[0]?.toLowerCase() === paperId.toLowerCase() ||
            item.fields?.doi?.[0]?.toLowerCase() === `https://doi.org/${paperId.toLowerCase()}` ||
            item.fields?.url?.[0]?.toLowerCase() === paperId.replace('URL:', '').toLowerCase()
        )?.key;
        return citeKey ? '@' + citeKey : paperId;
    } else {
        return paperId
    }
}

export const getCiteKeyIds = (citeKeys: Set<string>, citeKeyData: citeKeyLibrary[], adapter = '') => {
    const citeKeysMap: CiteKey[] = [];
    if (citeKeys.size > 0) {
        // get DOI form CiteKeyData corresponding to each item in citeKeys
        for (const citeKey of citeKeys) {
            if (adapter === 'csl-json') {
                const entry = citeKeyData.find((item) => item.id === citeKey)
                if (entry?.DOI) {
                    citeKeysMap.push({ citeKey: '@' + citeKey, paperId: sanitizeDOI(entry?.DOI) })
                } else if (VALID_S2AG_API_URLS.some(item => entry?.URL?.includes(item))) {
                    citeKeysMap.push({ citeKey: '@' + citeKey, paperId: `URL:${entry?.URL}` })
                }
            } else if (adapter === 'bibtex') {
                const entry = citeKeyData.find((item) => item.key === citeKey)
                if (entry?.fields?.doi?.[0]) {
                    citeKeysMap.push({ citeKey: '@' + citeKey, paperId: sanitizeDOI(entry?.fields?.doi?.[0]) })
                } else if (VALID_S2AG_API_URLS.some(item => entry?.fields?.url?.[0]?.includes(item))) {
                    citeKeysMap.push({ citeKey: '@' + citeKey, paperId: `URL:${entry?.fields?.url?.[0]}` })
                }
            }
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

export const search = (data: SemanticPaper[], query: string) => {
    return data.filter((item: SemanticPaper) =>
        SEARCH_PARAMETERS.some((parameter) => {
            if (parameter === "authors") {
                return item.authors.some((author) =>
                    author.name?.toLowerCase().includes(query.toLowerCase())
                );
            } else {
                return item[parameter as keyof typeof item]
                    ?.toString()
                    .toLowerCase()
                    .includes(query.toLowerCase());
            }
        })
    );
};

export const sort = (
    data: SemanticPaper[],
    sortProperty: string,
    sortOrder: string
) => {
    return data.sort((a, b) => {
        if (sortOrder === "asc") {
            return a[sortProperty as keyof typeof a] >
                b[sortProperty as keyof typeof b]
                ? 1
                : -1;
        } else {
            return a[sortProperty as keyof typeof a] <
                b[sortProperty as keyof typeof b]
                ? 1
                : -1;
        }
    });
};

export const iSort = (
    data: IndexPaper[],
    sortProperty: string,
    sortOrder: string
) => {
    return data.sort((a, b) => {
        if (sortOrder === "asc") {
            return a.paper[sortProperty as keyof typeof a.paper] >
                b.paper[sortProperty as keyof typeof b.paper]
                ? 1
                : -1;
        } else {
            return a.paper[sortProperty as keyof typeof a.paper] <
                b.paper[sortProperty as keyof typeof b.paper]
                ? 1
                : -1;
        }
    });
};