export interface ReferenceMapSettings {
    hideButtonsOnHover: boolean;
    influentialCount: boolean;
    showAbstract: boolean;
    showAuthors: boolean;
    searchTitle: boolean;
    searchLimit: number;
    searchFrontMatter: boolean;
    searchFrontMatterKey: string;
    searchFrontMatterLimit: number;
    searchCiteKey: boolean;
    searchCiteKeyPath: string;
    linkCiteKey: boolean;
    findZoteroCiteKeyFromID: boolean;
    enableReferenceSorting: boolean;
    sortByReference: string;
    sortOrderReference: string;
    enableIndexSorting: boolean;
    sortByIndex: string;
    sortOrderIndex: string;
    standardizeBibtex: boolean;
    formatMetadataCopyOne: boolean;
    formatMetadataCopyTwo: boolean;
    formatMetadataCopyThree: boolean;
    metadataCopyTemplateOne: string;
    metadataCopyTemplateTwo: string;
    metadataCopyTemplateThree: string;
    metadataCopyOneBatch: boolean;
    metadataCopyTwoBatch: boolean;
    metadataCopyThreeBatch: boolean;
    debugMode: boolean;
}


export interface SemanticPaper {
    paperId: string;
    externalIds: ExternalIds;
    url: string;
    title: string;
    abstract: string;
    venue: string;
    year: number;
    referenceCount: number;
    citationCount: number;
    influentialCitationCount: number;
    isOpenAccess: boolean;
    openAccessPdf: OpenAccessPdf;
    fieldsOfStudy: string[];
    publicationTypes: string[];
    publicationDate: string;
    journal: Journal;
    citationStyles: CitationStyles;
    authors: Author[];
}

export interface ExternalIds {
    ArXiv: string
    DBLP: string
    PubMedCentral: string
    DOI: string
}

export interface OpenAccessPdf {
    url: string
    status: string
}

export interface Journal {
    name: string
    pages: string
    volume: string
}

export interface CitationStyles {
    bibtex: string
}

export interface Author {
    authorId: string
    name: string
}


export interface citeKeyLibrary {
    key?: string;
    id?: string;
    DOI?: string | null;
    fields?: BibFields;
    abstract?: string | null;
    title?: string | null;
    URL?: string | null;
}

export interface BibFields {
    doi?: string[];
    url?: string[];
}

export interface MetaData {
    bibtex: string,
    title: string,
    author: string,
    authors: string,
    year: string,
    journal: string,
    volume: string,
    pages: string,
    abstract: string,
    url: string,
    pdfurl: string,
    doi: string,
    referenceCount: string,
    citationCount: string,
    influentialCount: string
}

export interface IndexPaper {
    id: string;
    paper: SemanticPaper;
}

export interface CiteKey {
    citeKey: string;
    paperId: string;
}    

export interface Library {
    active: boolean;
    adapter: string;
    libraryData: citeKeyLibrary[] | null
    mtime: number;
}