import { ReferenceMapSettings } from "./types"

export const DEFAULT_SETTINGS: ReferenceMapSettings = {
    hideButtonsOnHover: false,
    influentialCount: false,
    loadingPuff: false,
    showDetails: false,
    copyTitle: true,
    copyPaperDOI: false,
    copyAuthors: true,
    copyYear: true,
    copyAbstract: true,
    copyUrl: false,
    copyJournal: false,
    copyOpenAccessPdf: false,
    enableSorting: false,
    sortingMetadata: 'year',
    sortingOrder: 'desc'
}

export const SORTING_METADATA = [
    'year',
    'citationCount',
    'referenceCount',
    'influentialCitationCount',
] as const;

export const SORTING_ORDER = [
    'asc',
    'desc'
] as const;

export const SEMANTIC_FIELDS = [
    'abstract',
    'authors',
    'citationCount',
    'externalIds',
    'fieldsOfStudy',
    'influentialCitationCount',
    'isOpenAccess',
    'openAccessPdf',
    'journal',
    'paperId',
    'publicationDate',
    'publicationTypes',
    'referenceCount',
    'title',
    'url',
    'venue',
    'year',
    'citationStyles'
]
export const SEARCH_PARAMETERS = ['paperId', 'externalIds', 'url', 'title', 'abstract', 'venue', 'year', 'referenceCount', 'citationCount', 'influentialCitationCount', 'isOpenAccess', 'openAccessPdf', 'fieldsOfStudy', 'publicationTypes', 'publicationDate', 'journal', 'citationStyles', 'authors']
export const SEMANTIC_SEARCH_FIELDS = [
    'abstract',
    'authors',
    'citationCount',
    'externalIds',
    'fieldsOfStudy',
    'influentialCitationCount',
    'isOpenAccess',
    'journal',
    'paperId',
    'publicationDate',
    'publicationTypes',
    'referenceCount',
    's2FieldsOfStudy',
    'title',
    'url',
    'venue',
    'year'
]

export const SEMANTICSCHOLAR_API_URL = 'https://api.semanticscholar.org/graph/v1'
export const SEMANTICSCHOLAR_PARTNER_API_URL = 'https://partner.semanticscholar.org/graph/v1'
export const SEMANTICSCHOLAR_URL = "https://www.semanticscholar.org";