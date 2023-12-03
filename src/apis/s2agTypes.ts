
export type Reference = {
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
    // from other sources
    type?: string
    directors?: Author[]
    editors?: Author[]
}

export type ExternalIds = {
    ArXiv?: string
    DBLP?: string
    PubMedCentral?: string
    DOI?: string
}

export type OpenAccessPdf = {
    url?: string
    status?: string
}

export type Journal = {
    name?: string
    pages?: string
    volume?: string
}

export type CitationStyles = {
    bibtex?: string
}

export type Author = {
    authorId?: string
    name?: string
}
