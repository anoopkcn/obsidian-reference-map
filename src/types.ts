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
    formatMetadataCopyOne: boolean;
    formatMetadataCopyTwo: boolean;
    formatMetadataCopyThree: boolean;
    metadataCopyTemplateOne: string;
    metadataCopyTemplateTwo: string;
    metadataCopyTemplateThree: string;
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
    abstract?: string | null;
    title: string;
    URL?: string | null;
}