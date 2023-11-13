import { CachedMetadata } from "obsidian";
import { CiteKey, Library } from "src/types";
import { EXCLUDE_FILE_NAMES } from "src/constants";
import { areSetsEqual } from "src/utils/functions";
import { getCiteKeyIds } from 'src/utils/postprocess';
import { getCiteKeys, getPaperIds, extractKeywords } from 'src/utils/parser';

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

    constructor() {
        this.citeKeys = new Set<string>();
        this.citeKeyMap = []
        this.indexIds = new Set<string>();
        this.frontmatter = '';
        this.fileName = '';
        this.basename = '';
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
}
