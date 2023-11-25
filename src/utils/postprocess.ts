import doiRegex from "doi-regex";
import { CiteKeyEntry } from "src/apis/bibTypes";
import { VALID_S2AG_API_URLS, SEARCH_PARAMETERS } from "src/constants";
import { Reference, MetaData, Library, CiteKey, IndexPaper } from "src/types";


export const makeMetaData = (paper: Reference): MetaData => {
    const paperTitle = paper.title?.trim().replace(/[^\x20-\x7E]/g, '') || 'Could not recover Title';
    const author = paper.authors?.[0]?.name?.trim() || 'Could not recover Author';
    const authors = paper.authors?.map(author => author.name).join(', ') || 'Could not recover Authors';
    const year = paper.year?.toString().trim() || 'Could not recover Year';
    const journal = paper.journal?.name?.trim() || 'Could not recover Journal';
    const volume = paper.journal?.volume?.trim() || 'Could not recover Volume';
    const pages = paper.journal?.pages?.trim() || 'Could not recover Pages';
    const abstract = paper.abstract?.trim() || 'No abstract available';
    const bibTex = paper.citationStyles?.bibtex || 'No BibTex available';
    const referenceCount = paper.referenceCount || 0;
    const citationCount = paper.citationCount || 0;
    const influentialCount = paper.influentialCitationCount || 0;
    const openAccessPdfUrl = paper.isOpenAccess ? paper.openAccessPdf?.url || '' : '';
    const paperURL = paper.url || 'Could not recover URL';
    const doi = paper.externalIds?.DOI || 'Could not recover DOI';

    return {
        bibtex: bibTex,
        title: paperTitle,
        author,
        authors,
        year,
        journal,
        volume,
        pages,
        abstract,
        url: paperURL,
        pdfurl: openAccessPdfUrl,
        doi,
        referenceCount,
        citationCount,
        influentialCount,
    };
};

export const templateReplace = (template: string, data: MetaData, id = '') => {
    if (id === '') { id = data.doi ? data.doi : ''; }
    return template
        .replaceAll('{{id}}', id)
        .replaceAll('{{bibtex}}', data.bibtex)
        .replaceAll('{{title}}', data.title.replace(/[:\\\\/]/g, ''))
        .replaceAll('{{author}}', data.author.replace(/[:\\\\/]/g, ''))
        .replaceAll('{{authors}}', data.authors.replace(/[:\\\\/]/g, ''))
        .replaceAll('{{year}}', data.year.replace(/[:\\\\/]/g, ''))
        .replaceAll('{{journal}}', data.journal.replace(/[:\\\\/]/g, ''))
        .replaceAll('{{volume}}', data.volume.replace(/[:\\\\/]/g, ''))
        .replaceAll('{{pages}}', data.pages.replace(/[:\\\\/]/g, ''))
        .replaceAll('{{abstract}}', data.abstract)
        .replaceAll('{{url}}', data.url)
        .replaceAll('{{pdfurl}}', data.pdfurl)
        .replaceAll('{{doi}}', data.doi);
};

export const setCiteKeyId = (paperId: string, citeLibrary: Library): string => {
    if (citeLibrary.adapter === 'csl-json') {
        const citeKey = citeLibrary.libraryData?.find(
            (item) => item?.DOI?.toLowerCase() === paperId.toLowerCase() ||
                item?.DOI?.toLowerCase() ===
                `https://doi.org/${paperId.toLowerCase()}` ||
                item?.URL?.toLowerCase() ===
                paperId.replace('URL:', '').toLowerCase()
        )?.id;
        return citeKey ? '@' + citeKey : paperId;
    } else if (citeLibrary.adapter === 'bibtex') {
        const citeKey = citeLibrary.libraryData?.find(
            (item) => item.fields?.doi?.[0]?.toLowerCase() ===
                paperId.toLowerCase() ||
                item.fields?.doi?.[0]?.toLowerCase() ===
                `https://doi.org/${paperId.toLowerCase()}` ||
                item.fields?.url?.[0]?.toLowerCase() ===
                paperId.replace('URL:', '').toLowerCase()
        )?.key;
        return citeKey ? '@' + citeKey : paperId;
    } else {
        return paperId;
    }
};

export const getCiteKeyIds = (citeKeys: Set<string>, citeLibrary: Library | null | undefined) => {
    const citeKeysMap: CiteKey[] = [];
    let index = 1; // Initialize index variable outside the loop
    if (citeKeys.size > 0) {
        // Get DOI from CiteKeyData corresponding to each item in citeKeys
        for (const citeKey of citeKeys) {
            let entry: CiteKeyEntry | undefined;
            if (citeLibrary?.adapter === 'csl-json') {
                entry = citeLibrary.libraryData?.find((item) => item.id === citeKey);
            } else if (citeLibrary?.adapter === 'bibtex') {
                entry = citeLibrary.libraryData?.find((item) => item.key === citeKey);
            }

            let paperId = '@' + citeKey;
            if (entry?.DOI) {
                paperId = sanitizeDOI(entry?.DOI).toLowerCase();
            } else if (VALID_S2AG_API_URLS.some((item) => entry?.URL?.includes(item))) {
                paperId = `URL:${entry?.URL}`;
            } else if (entry?.fields?.doi?.[0]) {
                paperId = sanitizeDOI(entry?.fields?.doi?.[0]).toLowerCase();
            } else if (VALID_S2AG_API_URLS.some((item) => entry?.fields?.url?.[0]?.includes(item))) {
                paperId = `URL:${entry?.fields?.url?.[0]}`;
            }

            citeKeysMap.push({
                citeKey: '@' + citeKey,
                location: index,
                paperId: paperId,
            });

            index++;
        }
    }
    return citeKeysMap;
};

//convert citeKeyEntry to Reference
export function convertToReference(citeKeyEntry: CiteKeyEntry): Reference {
    const reference: Reference = {
        // map the properties of citeKeyEntry to the properties of Reference
        paperId: citeKeyEntry.id,
        externalIds: undefined,
        url: citeKeyEntry.URL,
        title: citeKeyEntry.title,
        abstract: citeKeyEntry.abstract,
        venue: undefined,
        year: citeKeyEntry.issued?.['date-parts']?.[0]?.[0],
        referenceCount: undefined,
        citationCount: undefined,
        influentialCitationCount: undefined,
        isOpenAccess: undefined,
        openAccessPdf: undefined,
        journal: {
            name: citeKeyEntry['container-title'],
            volume: citeKeyEntry.volume,
            pages: citeKeyEntry.page,
        },
        authors: citeKeyEntry.author?.map((author) => {
            return {
                name: author.literal,
            };
        }),
        citationStyles: {
            bibtex: citeKeyEntry.key,
        },
    };
    return reference;
}

export const dataSearch = (data: Reference[], query: string) => {
    return data.filter((item: Reference) => SEARCH_PARAMETERS.some((parameter) => {
        if (parameter === 'authors') {
            return item.authors?.some((author) => author.name?.toLowerCase().includes(query.toLowerCase())
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

export const dataSort = (
    data: Reference[],
    sortProperty: string,
    sortOrder: string
) => {
    return data.sort((a, b) => {
        const left = a[sortProperty as keyof typeof a];
        const right = b[sortProperty as keyof typeof b];
        if (sortOrder === 'asc') {
            if (left === undefined) return 1;
            if (right === undefined) return -1;
            return left > right ? 1 : -1;
        } else {
            if (left === undefined) return -1;
            if (right === undefined) return 1;
            return left < right ? 1 : -1;
        }
    });
};

export const indexSearch = (data: IndexPaper[], query: string) => {
    return data.filter((item: IndexPaper) => SEARCH_PARAMETERS.some((parameter) => {
        if (parameter === 'authors') {
            return item.paper?.authors?.some((author) => author.name?.toLowerCase().includes(query.toLowerCase())
            );
        } else {
            return item.paper[parameter as keyof typeof item.paper]
                ?.toString()
                .toLowerCase()
                .includes(query.toLowerCase());
        }
    })
    );
};

export const indexSort = (
    data: IndexPaper[],
    sortProperty: string,
    sortOrder: string
) => {
    return data.sort((a, b) => {
        const left = a.paper[sortProperty as keyof typeof a.paper];
        const right = b.paper[sortProperty as keyof typeof b.paper];
        if (sortOrder === 'asc') {
            if (left === undefined) return 1;
            if (right === undefined) return -1;
            return left > right ? 1 : -1;
        } else {
            if (left === undefined) return -1;
            if (right === undefined) return 1;
            return left < right ? 1 : -1;
        }
    });
}; export const sanitizeDOI = (dirtyDOI: string) => {
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

