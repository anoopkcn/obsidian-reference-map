import { CiteKeyEntry } from "./apis/bibTypes"

export interface ReferenceMapSettings {
	hideButtonsOnHover: boolean
	influentialCount: boolean
	showAbstract: boolean
	showAuthors: boolean
	showInvalidItems: boolean
	filterRedundantReferences: boolean
	removeDuplicateIds: boolean
	lookupLinkedFiles: boolean
	searchTitle: boolean
	searchLimit: number
	searchFrontMatter: boolean
	searchFrontMatterKey: string
	searchFrontMatterLimit: number
	searchCiteKey: boolean
	pullFromZotero: boolean
	zoteroGroups: ZoteroGroup[] 
	zoteroPort: string
	searchCiteKeyPath: string
	autoUpdateCitekeyFile: boolean
	linkCiteKey: boolean
	findZoteroCiteKeyFromID: boolean
	findCiteKeyFromLinksWithoutPrefix: boolean
	enableReferenceSorting: boolean
	sortByReference: string
	sortOrderReference: string
	enableIndexSorting: boolean
	sortByIndex: string
	sortOrderIndex: string
	modalSearchLimit: number
	fileNameFormat: string
	folder: string
	modalCreateTemplate: string
	modalInsertTemplate: string
	formatMetadataCopyOne: boolean
	formatMetadataCopyTwo: boolean
	formatMetadataCopyThree: boolean
	metadataCopyTemplateOne: string
	metadataCopyTemplateTwo: string
	metadataCopyTemplateThree: string
	metadataCopyOneBatch: boolean
	metadataCopyTwoBatch: boolean
	metadataCopyThreeBatch: boolean
	debugMode: boolean
}

export interface Reference {
	paperId: string
	externalIds?: ExternalIds
	url?: string
	title?: string
	abstract?: string
	venue?: string
	year?: string
	referenceCount?: number
	citationCount?: number
	influentialCitationCount?: number
	isOpenAccess?: boolean
	openAccessPdf?: OpenAccessPdf
	fieldsOfStudy?: string[]
	publicationTypes?: string[]
	publicationDate?: string
	journal?: Journal
	citationStyles?: CitationStyles
	authors?: Author[]
}

export interface ExternalIds {
	ArXiv?: string
	DBLP?: string
	PubMedCentral?: string
	DOI?: string
}

export interface OpenAccessPdf {
	url?: string
	status?: string
}

export interface Journal {
	name?: string
	pages?: string
	volume?: string
}

export interface CitationStyles {
	bibtex?: string
}

export interface Author {
	authorId?: string
	name?: string
}

export interface MetaData {
	bibtex: string
	title: string
	author: string
	authors: string
	year: string
	journal: string
	volume: string
	pages: string
	abstract: string
	url: string
	pdfurl: string
	doi: string
	referenceCount: string
	citationCount: string
	influentialCount: string
}

export interface IndexPaper {
	id: string
	location: number | null
	isLocal?: boolean
	paper: Reference
}

export interface CiteKey {
	citeKey: string
	location: number
	paperId: string
}

export interface Library {
	active: boolean
	adapter: string
	libraryData: CiteKeyEntry[] | null
	mtime: number
}

export const RELOAD = {
	HARD: 'hard',
	SOFT: 'soft',
	VIEW: 'view',
} as const

export type Reload = typeof RELOAD[keyof typeof RELOAD]

export const DIRECTION = {
	LEFT: 'left',
	RIGHT: 'right',
} as const

export type Direction = typeof DIRECTION[keyof typeof DIRECTION]

export interface PartialCSLEntry {
	id: string;
	title: string;
	groupID?: number;
}

export interface ZoteroGroup {
	id: number;
	name: string;
	lastUpdate?: number;
}

export type CSLList = PartialCSLEntry[];

export type CardSpecType = 'media' | 'image' | 'pdf' | 'text' | 'file' | 'link';