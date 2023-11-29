import { CiteKeyEntry } from "./apis/bibTypes"
import { Reference } from "./apis/s2agTypes"

export interface ReferenceMapSettings {
	hideButtonsOnHover: boolean
	influentialCount: boolean
	showAbstract: boolean
	showAuthors: boolean
	showJournal: boolean
	abstractTruncateLength: number
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
	referenceCount: number
	citationCount: number
	influentialCount: number
	csl?: string
}

export interface IndexPaper {
	id: string
	location: number | null
	isLocal?: boolean
	paper: Reference
	cslEntry?: CiteKeyEntry
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
	VIEW: 'view'
} as const

export type Reload = typeof RELOAD[keyof typeof RELOAD]

export const DIRECTION = { LEFT: 'left', RIGHT: 'right' } as const

export type Direction = typeof DIRECTION[keyof typeof DIRECTION]

export type CSLList = PartialCSLEntry[];

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

export type CardSpecType = 'media' | 'image' | 'pdf' | 'text' | 'file' | 'link';