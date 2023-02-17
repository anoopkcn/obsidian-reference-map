import LRUCache from 'lru-cache';
import { SemanticPaper } from './types';
import ReferenceMap from './main';
import { getIndexItem, getReferenceItems, getCitationItems, getSearchItems } from './routers/s2agAPI';

export interface DocCache {
    paperIds: Set<string>;
    rootPapers: SemanticPaper[];
}

export class ViewManager {
    plugin: ReferenceMap;
    indexCache: LRUCache<string, SemanticPaper | number | null>;
    refCache: LRUCache<string, SemanticPaper[]>;
    citeCache: LRUCache<string, SemanticPaper[]>;
    searchCache: LRUCache<string, SemanticPaper[]>;

    constructor(plugin: ReferenceMap) {
        this.plugin = plugin;
        this.indexCache = new LRUCache({ max: 250 });
        this.refCache = new LRUCache({ max: 20 });
        this.citeCache = new LRUCache({ max: 20 });
        this.searchCache = new LRUCache({ max: 20 });
    }

    clearCache = () => {
        // Clear all caches when the user unmounts the view
        this.indexCache.clear();
        this.refCache.clear();
        this.citeCache.clear();
        this.searchCache.clear();
    }


    getIndexPaper = async (paperId: string): Promise<SemanticPaper | number | null> => {
        const cachedPaper = this.indexCache.has(paperId) ? this.indexCache.get(paperId) : null;
        const debugMode = this.plugin.settings.debugMode;
        if (!cachedPaper) {
            try {
                const paper = await getIndexItem(paperId, debugMode);
                this.indexCache.set(paperId, paper);
                return paper;
            } catch (e) {
                if (debugMode) console.log('ORM: S2AG API Index Card request error', e);
                // Cache the 404 status(no entry found) to avoid repeated requests
                if (e.status === 404) this.indexCache.set(paperId, e.status);
                return e.status;
            }
        }
        return cachedPaper;
    }

    // Get papers of to keyword search
    searchIndexPapers = async (query: string, limit = 0): Promise<SemanticPaper[]> => {
        const cacheKey = query + limit.toString();
        const cachedSearch = this.searchCache.has(cacheKey) ? this.searchCache.get(cacheKey) : null;
        const debugMode = this.plugin.settings.debugMode;
        if (!cachedSearch) {
            try {
                const indexCardsList = await getSearchItems(query, limit, debugMode);
                // Add limit to the key to avoid collisions
                this.searchCache.set(cacheKey, indexCardsList);
                return indexCardsList;
            } catch (e) {
                if (debugMode) console.log('ORM: S2AG API SEARCH request error', e);
                return [];
            }
        }
        return cachedSearch;
    }


    // Get references of an index card paper
    getReferences = async (paperId: string): Promise<SemanticPaper[]> => {
        const cachedRefs = this.refCache.has(paperId) ? this.refCache.get(paperId) : null;
        const debugMode = this.plugin.settings.debugMode;
        if (!cachedRefs) {
            try {
                const references = await getReferenceItems(paperId, debugMode);
                this.refCache.set(paperId, references);
                return references;
            } catch (e) {
                if (debugMode) console.log('ORM: S2AG API GET references request error', e);
                return [];
            }
        }
        return cachedRefs
    }

    // Get citations of an index card paper
    getCitations = async (paperId: string): Promise<SemanticPaper[]> => {
        const cachedCitations = this.citeCache.has(paperId) ? this.citeCache.get(paperId) : null;
        const debugMode = this.plugin.settings.debugMode;
        if (!cachedCitations) {
            try {
                const citations = await getCitationItems(paperId, debugMode);
                this.citeCache.set(paperId, citations);
                return citations;
            } catch (e) {
                if (debugMode) console.log('ORM: S2AG API  GET citations request error', e);
                return [];
            }
        }
        return cachedCitations
    }
}