import LRUCache from 'lru-cache';
import { SemanticPaper } from './types';
import ReferenceMap from './main';
import { getPaperMetadata } from './routers/s2agAPI';

export interface DocCache {
    paperIds: Set<string>;
    rootPapers: SemanticPaper[];
}

export class ViewManager {
    plugin: ReferenceMap;
    indexCache: LRUCache<string, SemanticPaper>;
    refCache: LRUCache<string, SemanticPaper[]>;
    citeCache: LRUCache<string, SemanticPaper[]>;
    searchCache: LRUCache<string, SemanticPaper[]>;

    constructor(plugin: ReferenceMap) {
        this.plugin = plugin;
        this.indexCache = new LRUCache({ max: 200 });
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


    getIndexPaper = async (paperId: string): Promise<SemanticPaper | null> => {
        const cachedPaper = this.indexCache.has(paperId) ? this.indexCache.get(paperId) : null;
        if (!cachedPaper) {
            try {
                const paper = await getPaperMetadata(paperId);
                this.indexCache.set(paperId, paper[0]);
                return paper[0];
            } catch (e) {
                console.log('Reference Map: S2AG API Index Card request error', e);
                return null;
            }
        }
        return cachedPaper;
    }

    // Get papers of to keyword search
    searchRootPapers = async (query: string, offlimit = [0, null]): Promise<SemanticPaper[]> => {
        const cachedSearch = this.searchCache.has(query) ? this.searchCache.get(query) : null;
        if (!cachedSearch) {
            try {
                const rootPapers = await getPaperMetadata('', 'search', query, offlimit);
                this.searchCache.set(query, rootPapers);
                return rootPapers;
            } catch (e) {
                console.log('Reference Map: S2AG API SEARCH request error', e);
                return [];
            }
        }
        return cachedSearch;
    }


    // Get references of an index card paper
    getReferences = async (paperId: string): Promise<SemanticPaper[]> => {
        const cachedRefs = this.refCache.has(paperId) ? this.refCache.get(paperId) : null;
        if (!cachedRefs) {
            try {
                const references = await getPaperMetadata(paperId, 'references');
                this.refCache.set(paperId, references);
                return references;
            } catch (e) {
                console.log('Reference Map: S2AG API GET references request error', e);
                return [];
            }
        }
        return cachedRefs
    }

    // Get citations of an index card paper
    getCitations = async (paperId: string): Promise<SemanticPaper[]> => {
        const cachedCitations = this.citeCache.has(paperId) ? this.citeCache.get(paperId) : null;
        if (!cachedCitations) {
            try {
                const citations = await getPaperMetadata(paperId, 'citations');
                this.citeCache.set(paperId, citations);
                return citations;
            } catch (e) {
                console.log('Reference Map: S2AG API  GET citations request error', e);
                return [];
            }
        }
        return cachedCitations
    }
}