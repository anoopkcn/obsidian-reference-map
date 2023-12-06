import { CiteKeyEntry, Issued } from "src/apis/bibTypes";
import { Reference } from "src/apis/s2agTypes";
import { VALID_S2AG_API_URLS, SEARCH_PARAMETERS } from "src/constants";
import { MetaData, Library, CiteKey, IndexPaper } from "src/types";
import { sanitizeDOI } from "./parser";

export const makeMetaData = (data: IndexPaper): MetaData => {
    const paper = data.paper;
    const paperTitle = paper.title?.trim().replace(/[^\x20-\x7E]/g, '') ?? 'Could not recover Title';
    const author = paper.authors?.[0]?.name?.trim() ?? 'Could not recover Author';
    const authors = paper.authors?.map(author => author.name).join(', ') ?? 'Could not recover Authors';
    const year = paper.year?.toString().trim() ?? 'Could not recover Year';
    const journal = paper.journal?.name?.trim() ?? 'Could not recover Journal';
    const volume = paper.journal?.volume?.trim() ?? 'Could not recover Volume';
    const pages = paper.journal?.pages?.trim() ?? 'Could not recover Pages';
    const abstract = paper.abstract?.trim() ?? 'No abstract available';
    const bibTex = paper.citationStyles?.bibtex ?? 'No BibTex available';
    const referenceCount = paper.referenceCount ?? 0;
    const citationCount = paper.citationCount ?? 0;
    const influentialCount = paper.influentialCitationCount ?? 0;
    const openAccessPdfUrl = paper.isOpenAccess ? paper.openAccessPdf?.url ?? '' : '';
    const paperURL = paper.url ?? 'Could not recover URL';
    const doi = paper.externalIds?.DOI ?? 'Could not recover DOI';
    const csl = paper.csl ?? 'Could not recover CSL';

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
        csl
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
        .replaceAll('{{doi}}', data.doi)
        .replaceAll('{{csl}}', data.csl?.toString() || 'Could not recover CSL');
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
export function fillMissingReference(citeKeyEntry: CiteKeyEntry | undefined, reference: Reference | null = null): Reference {
    // map the properties of citeKeyEntry to the properties of Reference
    //if reference is null, create a new reference
    let ref: Reference;
    if (reference) {
        ref = reference;
    } else {
        const paperId = citeKeyEntry?.id ?? '';
        ref = { paperId: paperId };
    }

    if (citeKeyEntry) {
        ref.paperId = ref.paperId ?? citeKeyEntry.id;
        ref.externalIds = ref.externalIds ?? { DOI: citeKeyEntry.DOI };
        ref.url = ref.url ?? citeKeyEntry.URL;
        ref.type = ref.type ?? citeKeyEntry.type;
        ref.title = ref.title ?? citeKeyEntry.title;
        ref.abstract = ref.abstract ?? citeKeyEntry.abstract;
        ref.year = ref.year ?? citeKeyEntry.issued?.['date-parts'].flat().join('-') //.toString();
        ref.journal = ref.journal ?? {
            name: citeKeyEntry['container-title'],
            volume: citeKeyEntry.volume,
            pages: citeKeyEntry.page,
        };
        ref.authors = ref.authors ?? citeKeyEntry.author?.map((author) => {
            if (author.literal) {
                return {
                    name: author.literal,
                };
            }
            return {
                name: author.given + ' ' + author.family,
            };
        });
        ref.directors = ref.directors ?? citeKeyEntry.director?.map((author) => {
            if (author.literal) {
                return {
                    name: author.literal,
                };
            }
            return {
                name: author.given + ' ' + author.family,
            };
        });
        ref.editors = ref.editors ?? citeKeyEntry.editor?.map((author) => {
            if (author.literal) {
                return {
                    name: author.literal,
                };
            }
            return {
                name: author.given + ' ' + author.family,
            };
        });
        ref.citationStyles = ref.citationStyles ?? {
            bibtex: citeKeyEntry.key,
        };
        ref.csl = ref?.csl ?? citeKeyEntry?.csl;
    }
    return ref;
}

export function convertToCiteKeyEntry(paper: IndexPaper, id = ''): CiteKeyEntry {
    // convert YYYY-MM-DD numbers [YYYY, MM, DD]
    const reference = paper.paper;
    const bibEntry = paper.bibEntry;
    let issued: Issued = { 'date-parts': [[0, 0, 0]] };
    if (reference.publicationDate) {
        const dateParts = reference.publicationDate.split('-').map(Number);
        if (dateParts.length === 3) {
            issued = {
                'date-parts': [[dateParts[0], dateParts[1], dateParts[2]]],
            };
        }
    }

    const citeKeyEntry: CiteKeyEntry = {
        // map the properties of Reference to the properties of CiteKeyEntry
        id: id ? id : reference.paperId,
        key: bibEntry?.key,
        type: bibEntry?.type ?? reference.type,
        abstract: bibEntry?.abstract ?? reference.abstract,
        DOI: bibEntry?.DOI ?? reference.externalIds?.DOI,
        fields: bibEntry?.fields,
        note: bibEntry?.note,
        page: bibEntry?.page ?? reference.journal?.pages,
        title: reference.title ?? bibEntry?.title,
        URL: bibEntry?.URL ?? reference.url,
        author: reference.authors?.map((author) => {
            const nameParts = author.name ? author.name.split(' ') : [''];
            return {
                given: nameParts.slice(0, -1).join(' '),
                family: nameParts.slice(-1).join(' '),
            };
        }),
        issued: bibEntry?.issued ?? issued,
        'container-title': reference.journal?.name,
        ISSN: bibEntry?.ISSN,
        issue: bibEntry?.issue,
        volume: bibEntry?.volume ?? reference.journal?.volume,
        language: bibEntry?.language,
        'title-short': bibEntry?.['title-short'],
        dimensions: bibEntry?.dimensions,
        source: bibEntry?.source,
        director: reference.directors?.map((director) => {
            const nameParts = director.name ? director.name.split(' ') : [''];
            return {
                given: nameParts.slice(0, -1).join(' '),
                family: nameParts.slice(-1).join(' '),
            };
        }),
        genre: bibEntry?.genre,
        number: bibEntry?.number,
        publisher: bibEntry?.publisher,
        license: bibEntry?.license,
        journalAbbreviation: bibEntry?.journalAbbreviation,
        'collection-title': bibEntry?.['collection-title'],
        'event-place': bibEntry?.['event-place'],
        ISBN: bibEntry?.ISBN,
        'publisher-place': bibEntry?.['publisher-place'],
        editor: reference.editors?.map((editor) => {
            const nameParts = editor.name ? editor.name.split(' ') : [''];
            return {
                given: nameParts.slice(0, -1).join(' '),
                family: nameParts.slice(-1).join(' '),
            };
        }),
        'number-of-pages': bibEntry?.['number-of-pages']
    };
    return citeKeyEntry;
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
};
