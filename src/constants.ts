import { ReferenceMapSettings, ZoteroGroup } from './types'
import { IEEE, LOCALE_EN_US } from './utils/csl'

export const METADATA_COPY_TEMPLATE_ONE = `{{bibtex}}`

export const METADATA_COPY_TEMPLATE_TWO = `# {{title}}
**{{authors}}**
*{{journal}}, {{year}}*
>[!abstract] Abstract
>{{abstract}}
`
export const METADATA_COPY_TEMPLATE_THREE = `[[{{title}}-{{author}} {{year}}]]`

export const METADATA_MODAL_INSERT_TEMPLATE = `{{title}}
{{authors}}
{{journal}}, {{year}}
{{abstract}}
`

export const METADATA_MODAL_CREATE_TEMPLATE = `{{title}}
{{authors}}
{{journal}}, {{year}}
{{abstract}}
{{doi}}
[External Link]({{url}})
{{pdfurl}}
`
export const DEFAULT_ZOTERO_PORT = '23119';

export const DEFAULT_HEADERS = {
	'Content-Type': 'application/json',
	'User-Agent': 'obsidian/zotero',
	Accept: 'application/json',
	Connection: 'keep-alive',
};

export const DEFAULT_ZOTERO_GROUPS: ZoteroGroup[] = [];

export const DEFAULT_SETTINGS: ReferenceMapSettings = {
	hideButtonsOnHover: false,
	influentialCount: false,
	showAbstract: false,
	abstractTruncateLength: 160,
	showAuthors: false,
	showJournal: true,
	filterRedundantReferences: false,
	removeDuplicateIds: true,
	lookupLinkedFiles: false,
	searchTitle: false,
	searchLimit: 3,
	searchFrontMatter: false,
	searchFrontMatterKey: 'keywords',
	searchFrontMatterLimit: 3,
	searchCiteKey: false,
	pullFromZotero: true,
	zoteroGroups: DEFAULT_ZOTERO_GROUPS,
	zoteroPort: DEFAULT_ZOTERO_PORT,
	searchCiteKeyPath: '',
	autoUpdateCitekeyFile: false,
	linkCiteKey: true,
	findZoteroCiteKeyFromID: false,
	findCiteKeyFromLinksWithoutPrefix: false,
	enableReferenceSorting: false,
	sortByReference: 'year',
	sortOrderReference: 'desc',
	enableIndexSorting: false,
	sortByIndex: 'year',
	sortOrderIndex: 'desc',
	modalSearchLimit: 10,
	fileNameFormat: '{{title}}-{{author}} {{year}}',
	folder: '',
	modalCreateTemplate: METADATA_MODAL_CREATE_TEMPLATE,
	modalInsertTemplate: METADATA_MODAL_INSERT_TEMPLATE,
	formatMetadataCopyOne: true,
	formatMetadataCopyTwo: true,
	formatMetadataCopyThree: false,
	metadataCopyTemplateOne: METADATA_COPY_TEMPLATE_ONE,
	metadataCopyTemplateTwo: METADATA_COPY_TEMPLATE_TWO,
	metadataCopyTemplateThree: METADATA_COPY_TEMPLATE_THREE,
	metadataCopyOneBatch: false,
	metadataCopyTwoBatch: false,
	metadataCopyThreeBatch: true,
	debugMode: false,
	citationStyle: IEEE,
	citationLocale: LOCALE_EN_US,
	formatRemote: false
}

export const DEFAULT_LIBRARY = {
	active: false,
	adapter: '',
	libraryData: null,
	mtime: 0,
}

export const SORTING_METADATA = [
	'year',
	'citationCount',
	'referenceCount',
	'influentialCitationCount',
] as const

export const SORTING_ORDER = ['asc', 'desc'] as const

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
	'citationStyles',
]

export const SEARCH_PARAMETERS = [
	'paperId',
	'externalIds',
	'url',
	'title',
	'abstract',
	'venue',
	'year',
	'referenceCount',
	'citationCount',
	'influentialCitationCount',
	'isOpenAccess',
	'openAccessPdf',
	'fieldsOfStudy',
	'publicationTypes',
	'publicationDate',
	'journal',
	'citationStyles',
	'authors',
]

export const SEMANTICSCHOLAR_API_URL =
	'https://api.semanticscholar.org/graph/v1'

export const SEMANTICSCHOLAR_PARTNER_API_URL =
	'https://partner.semanticscholar.org/graph/v1'

export const SEMANTICSCHOLAR_URL = 'https://www.semanticscholar.org'

export const COMMON_WORDS = ['a', 'able', 'about', 'across', 'after', 'all', 'almost', 'also', 'am', 'among', 'an', 'and', 'any', 'are', 'as', 'at', 'be', 'because', 'been', 'but', 'by', 'can', 'cannot', 'could', 'dear', 'did', 'do', 'does', 'either', 'else', 'ever', 'every', 'for', 'from', 'get', 'got', 'had', 'has', 'have', 'he', 'her', 'hers', 'him', 'his', 'how', 'however', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'just', 'least', 'let', 'like', 'likely', 'may', 'me', 'might', 'most', 'must', 'my', 'neither', 'no', 'nor', 'not', 'of', 'off', 'often', 'on', 'only', 'or', 'other', 'our', 'own', 'rather', 'said', 'say', 'says', 'she', 'should', 'since', 'so', 'some',]

export const PUNCTUATION = ['!', '"', '#', '$', '%', '&', "'", '(', ')', '*', '+', ',', '-', '.', '/', ':', ';', '<', '=', '>', '?', '@', '[', '\\', ']', '^', '_', '`', '{', '|', '}', '~',]

export const NUMBERS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

export const EXCLUDE_FILE_NAMES = ['LICENSE', 'README', 'TEST', 'UNTITLED']

export const BIBTEX_STANDARD_TYPES = [
	'article',
	'journalarticle',
	'book',
	'booklet',
	'inbook',
	'incollection',
	'inproceedings',
	'conference',
	'manual',
	'mastersthesis',
	'phdthesis',
	'misc',
	'proceedings',
	'techreport',
	'unpublished',
]

export const VALID_S2AG_API_URLS = [
	'semanticscholar.org',
	'arxiv.org',
	'aclweb.org',
	'acm.org',
	'biorxiv.org',
]