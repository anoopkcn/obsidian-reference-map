
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
