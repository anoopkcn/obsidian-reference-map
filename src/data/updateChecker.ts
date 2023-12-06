import { CachedMetadata, htmlToMarkdown } from "obsidian";
import { BibData, CiteKey, Library } from "src/types";
import { EXCLUDE_FILE_NAMES } from "src/constants";
import { areSetsEqual, fragWithHTML } from "src/utils/functions";
import { getCiteKeyIds } from 'src/utils/postprocess';
import { getCiteKeys, getPaperIds, extractKeywords } from 'src/utils/parser';
import { CiteKeyEntry } from "src/apis/bibTypes";
import CSL from 'citeproc';

export class UpdateChecker {
    citeKeys: Set<string>;
    citeKeyMap: CiteKey[]
    indexIds: Set<string>;
    library: Library | null | undefined;
    fileMetadataCache: CachedMetadata | null;
    fileCache = '';
    frontmatter = '';
    fileName = '';
    basename = '';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cslEngine: any;

    constructor() {
        this.citeKeys = new Set<string>();
        this.citeKeyMap = []
        this.indexIds = new Set<string>();
        this.frontmatter = '';
        this.fileName = '';
        this.basename = '';
        this.fileMetadataCache = null;
        this.cslEngine = null;
    }

    resetCache = () => {
        this.citeKeys = new Set<string>();
        this.citeKeyMap = []
        this.indexIds = new Set<string>();
        this.fileMetadataCache = null;
        this.fileCache = '';
        this.frontmatter = '';
        this.fileName = '';
        this.basename = '';
    }

    setCache = (fileCache: string, fileMetadataCache: CachedMetadata | null) => {
        this.fileCache = fileCache
        this.fileMetadataCache = fileMetadataCache
    }

    checkCiteKeysUpdate = (prefix = '@', checkOrder = false) => {
        // checkOrder is used to force update (usually for reference map view order correction)
        if (this.library === null) return false;
        const newCiteKeys = getCiteKeys(this.library, this.fileCache, prefix)
        if (!checkOrder) {
            if (areSetsEqual(newCiteKeys, this.citeKeys)) {
                return false;
            }
        }
        this.citeKeys = newCiteKeys;
        this.citeKeyMap = getCiteKeyIds(this.citeKeys, this.library)
        return true;
    }

    checkIndexIdsUpdate = () => {
        const newIds = getPaperIds(this.fileCache)
        if (areSetsEqual(newIds, this.indexIds)) return false;
        this.indexIds = newIds;
        return true;
    }

    checkFrontmatterUpdate = (key = '') => {
        if (!this.fileMetadataCache?.frontmatter) {
            this.frontmatter = '';
            return false;
        }
        const keywords = this.fileMetadataCache?.frontmatter?.[key];
        this.frontmatter = extractKeywords(keywords).unique().join("+");
        return true;
    }

    checkFileNameUpdate = () => {
        if (!this.basename) {
            this.fileName = '';
            return false;
        }
        if (!EXCLUDE_FILE_NAMES.some((name) => this.basename.toLowerCase() === name.toLowerCase())) {
            this.fileName = extractKeywords(this.basename).unique().join('+')
            return true;
        }
        return false;
    }

    checkCSlEngineUpdate = (
        references: CiteKeyEntry[],
        citationStyle: string,
        citationLocale: string
    ) => {
        if (!(references.length > 0)) return null;
        if (!citationStyle || !citationLocale) return null;
        const citeprocOptions = {
            retrieveLocale: () => citationLocale,
            retrieveItem: (id: string) => references.find((item) => item.id === id),
        };
        this.cslEngine = new CSL.Engine(citeprocOptions, citationStyle);
        return this.cslEngine
        // citeproc.opt.development_extensions.wrap_url_and_doi = true;
        // cslEngine.updateItems([...references.map((item) => item.id)])
        // this.bibliography = cslEngine.makeBibliography()[1]
        // return this.bibliography
    }

    getCSL = (ids: string[]): BibData[] | null => {
        if (!this.cslEngine) return null;
        this.cslEngine.updateItems(ids)
        const bibHtml = this.cslEngine.makeBibliography()
        const bibMetadataIds = bibHtml[0]?.entry_ids
        const cslData: BibData[] = bibMetadataIds.map((id: string[], index: number) => {
            const bib = htmlToMarkdown(fragWithHTML(bibHtml[1][index])).replace(/\n/, ' ')
            const index_ = index + 1 // CSL index starts from 1
            return { id: id[0], index: index_, bib: bib } as BibData
        });
        if (cslData.length === 0) return null;
        return cslData
    }
}
