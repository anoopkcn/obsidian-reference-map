export interface CiteKeyEntry {
    id: string
    key?: string
    type?: string
    abstract?: string
    DOI?: string
    fields?: BibFields
    note?: string
    page?: string
    title?: string
    URL?: string
    author?: Author[]
    issued?: Issued
    "container-title"?: string
    ISSN?: string
    issue?: string
    volume?: string
    language?: string
    "title-short"?: string
    dimensions?: string
    source?: string
    director?: Director[]
    genre?: string
    number?: string
    publisher?: string
    license?: string
    journalAbbreviation?: string
    "collection-title"?: string
    "event-place"?: string
    ISBN?: string
    "publisher-place"?: string
    editor?: Editor[]
    "number-of-pages"?: string
}

export interface Author {
    literal?: string
    family?: string
    given?: string
    "non-dropping-particle"?: string
}

export interface Issued {
    "date-parts": [string, number, number][]
}

export interface Director {
    literal?: string
    family?: string
    given?: string
}

export interface Editor {
    literal?: string
    family?: string
    given?: string
}

export interface BibFields {
    doi?: string[]
    url?: string[]
}