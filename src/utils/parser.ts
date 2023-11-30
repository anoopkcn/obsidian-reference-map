import doiRegex from "doi-regex";
import { COMMON_WORDS, NUMBERS, PUNCTUATION, VALID_S2AG_API_URLS } from "src/constants";
import { Library } from "src/types";
// Given a markdown file contents regex match the DOI's from the file

export const sanitizeDOI = (dirtyDOI: string) => {
    const doi_matches = dirtyDOI.match(doiRegex());
    if (doi_matches) {
        for (const match of doi_matches) {
            return match
                .replace(/\)+$|\]+$|\*+$|_+$|`+$/, '')
                .replace(/\s+/g, '');
        }
    }
    return dirtyDOI.replace(/\s+/g, '');
};


export const getPaperIds = (content: string): Set<string> => {
    const modContent = content.replaceAll('](', ' ');
    const output: string[] = [];

    const arxivRegex = /arXiv:\s*(\d{4}\.\d{4,5})/gi;
    const arXivMatches = modContent.matchAll(arxivRegex);
    const corpusRegex = /CorpusId:\s*(\d{4,})/gi;
    const corpusMatches = modContent.matchAll(corpusRegex);
    const magRegex = /MAG:\s*(\d{4,})/gi;
    const magMatches = modContent.matchAll(magRegex);
    const pmidRegex = /PMID:\s*(\d{4,})/gi;
    const pmidMatches = modContent.matchAll(pmidRegex);
    const pmcidRegex = /PMCID:\s*([a-zA-Z]*\d{4,})/gi;
    const pmcidMatches = modContent.matchAll(pmcidRegex);
    const urlRegex = /URL:\s*(http[s]?:.[^\s]+)/gi;
    const urlMatches = modContent.matchAll(urlRegex);
    const doi_matches = modContent.match(doiRegex());

    if (arXivMatches) {
        for (const match of arXivMatches) {
            output.push(`arXiv:${match[1]}`);
        }
    }
    if (corpusMatches) {
        for (const match of corpusMatches) {
            output.push(`CorpusId:${match[1]}`);
        }
    }
    if (magMatches) {
        for (const match of magMatches) {
            output.push(`MAG:${match[1]}`);
        }
    }
    if (pmidMatches) {
        for (const match of pmidMatches) {
            output.push(`PMID:${match[1]}`);
        }
    }

    if (pmcidMatches) {
        for (const match of pmcidMatches) {
            output.push(`PMCID:${match[1]}`);
        }
    }
    if (urlMatches) {
        for (const match of urlMatches) {
            if (VALID_S2AG_API_URLS.some((item) => match[1].includes(item))) {
                output.push(`URL:${match[1]}`);
            }
        }
    }
    if (doi_matches) {
        for (const match of doi_matches) {
            output.push(match.replace(/\)+$|\]+$|\*+$|_+$|`+$|\.+$|,+$/, ''));
        }
    }
    return new Set(output.sort());
};

export const getCiteKeys = (
    library: Library | null | undefined,
    content: string,
    prefix: string
): Set<string> => {
    if (!library) return new Set<string>();
    let keys: string[] = [];
    if (library.adapter === 'bibtex') {
        keys = library.libraryData?.map((item) => prefix + item.key) ?? [];
    } else {
        keys = library.libraryData?.map((item) => prefix + item.id) ?? [];
    }
    // Collect all citekes from the content
    const pattern = new RegExp(keys.join('|'), 'g');
    const matches = content.match(pattern);
    const output = matches?.map(match => match.startsWith('@') ? match.slice(1) : match);
    return new Set(output);
};

// given a string of text, extract keywords from it excluding common words, punctuation, and numbers
export function extractKeywords(text: string) {
    if (!text) return [];
    const regex = new RegExp(`[${PUNCTUATION.join('')}]`, 'gmi');
    const keywords = text.replace(regex, ' ').replace(/\s\s+/g, ' ').split(' ');
    const result = keywords.filter((element) => {
        if (!COMMON_WORDS.includes(element) &&
            !PUNCTUATION.includes(element) &&
            !NUMBERS.includes(element)) {
            return true;
        }
        return false;
    });
    return result;
}

