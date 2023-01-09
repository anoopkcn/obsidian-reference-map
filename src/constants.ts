import { ReferenceMapSettings } from "./types"

export const METADATA_COPY_TEMPLATE = `{{title}}
{{authors}}
{{year}}
{{abstract}}
{{url}}
{{pdf}}
{{doi}}
`

export const NOTE_FILE_NAME_TEMPLATE = `{{title}}-{{author}} {{year}}}}`
export const NOTE_FILE_PATH = ''
export const NOTE_FILE_TEMPLATE = `{{title}}
{{authors}}
{{year}}
{{abstract}}
{{url}}
{{pdf}}
{{doi}}
`

export const DEFAULT_SETTINGS: ReferenceMapSettings = {
    hideButtonsOnHover: false,
    influentialCount: false,
    showDetails: false,
    searchTitle: false,
    searchLimit: 3,
    searchFrontMatter: false,
    searchFrontMatterKey: 'keywords',
    searchFrontMatterLimit: 3,
    searchCiteKey: false,
    searchCiteKeyPath: 'My Library.json',
    enableSorting: false,
    sortBy: 'year',
    sortOrder: 'desc',
    metadataCopy: true,
    metadataCopyTemplate: METADATA_COPY_TEMPLATE,
    noteFileNameTemplate: NOTE_FILE_NAME_TEMPLATE
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

export const SEMANTICSCHOLAR_API_URL = 'https://api.semanticscholar.org/graph/v1'
export const SEMANTICSCHOLAR_PARTNER_API_URL = 'https://partner.semanticscholar.org/graph/v1'
export const SEMANTICSCHOLAR_URL = "https://www.semanticscholar.org";


export const COMMONWORDS = ["a", "able", "about", "across", "after", "all", "almost", "also", "am", "among", "an", "and", "any", "are", "as", "at", "be", "because", "been", "but", "by", "can", "cannot", "could", "dear", "did", "do", "does", "either", "else", "ever", "every", "for", "from", "get", "got", "had", "has", "have", "he", "her", "hers", "him", "his", "how", "however", "i", "if", "in", "into", "is", "it", "its", "just", "least", "let", "like", "likely", "may", "me", "might", "most", "must", "my", "neither", "no", "nor", "not", "of", "off", "often", "on", "only", "or", "other", "our", "own", "rather", "said", "say", "says", "she", "should", "since", "so", "some"];
export const PUNCTUATION = ["!", '"', "#", "$", "%", "&", "'", "(", ")", "*", "+", ",", "-", ".", "/", ":", ";", "<", "=", ">", "?", "@", "[", "\\", "]", "^", "_", "`", "{", "|", "}", "~"];
export const NUMBERS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

export const EXCLUDE_FILE_NAMES = ["LICENSE", "README", "TEST", "UNTITLED"]