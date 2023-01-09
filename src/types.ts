export interface ReferenceMapSettings {
    hideButtonsOnHover: boolean;
    influentialCount: boolean;
    showDetails: boolean;
    searchTitle: boolean;
    searchLimit: number;
    searchFrontMatter: boolean;
    searchFrontMatterKey: string;
    searchFrontMatterLimit: number;
    searchCiteKey: boolean;
    searchCiteKeyPath: string;
    enableSorting: boolean;
    sortBy: string;
    sortOrder: string;
    copyTitle: boolean;
    copyPaperDOI: boolean;
    copyAuthors: boolean;
    copyYear: boolean;
    copyAbstract: boolean;
    copyUrl: boolean;
    copyJournal: boolean;
    copyOpenAccessPdf: boolean;
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


export interface CslJson {
    id: string;
    DOI: string | null;
    citationKey: string;
    abstract?: string | null;
    containerTitle?: string | null;
    ISSN?: string | null;
    issue?: string | null;
    page?: string | null;
    title: string;
    type: string;
    volume?: string | null;
    titleShort?: string | null;
    URL?: string | null;
    number?: string | null;
    publisher?: string | null;
    ISBN?: string | null;
    PMID?: string | null;
    language?: string | null;
    note?: string | null;
}