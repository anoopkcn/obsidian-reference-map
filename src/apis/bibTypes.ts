export type CiteKeyEntry = {
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

export type Author = {
    literal?: string
    family?: string
    given?: string
    "non-dropping-particle"?: string
}

export type Issued = {
    "date-parts": [number, number, number]
}

export type Director = {
    literal?: string
    family?: string
    given?: string
}

export type Editor = {
    literal?: string
    family?: string
    given?: string
}

export type BibFields = {
    doi?: string[]
    url?: string[]
}