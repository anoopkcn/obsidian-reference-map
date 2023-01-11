import { TFile } from 'obsidian';
import LRUCache from 'lru-cache';
import { SemanticPaper } from './types';
import ReferenceMap from './main';
import { areSetsEqual } from './utils';
import { getPaperMetadata, postPaperMetadata } from './routers/s2agAPI';

export interface DocCache {
    paperIds: Set<string>;
    rootPapers: SemanticPaper[];
}

export class ViewManager {
    plugin: ReferenceMap;
    cache: LRUCache<TFile, DocCache>;
    pandocCache: LRUCache<TFile, DocCache>;
    refCache: LRUCache<string, SemanticPaper[]>;
    citeCache: LRUCache<string, SemanticPaper[]>;
    searchCache: LRUCache<string, SemanticPaper[]>;

    constructor(plugin: ReferenceMap) {
        this.plugin = plugin;
        this.cache = new LRUCache({ max: 20 });
        this.pandocCache = new LRUCache({ max: 20 });
        this.refCache = new LRUCache({ max: 20 });
        this.citeCache = new LRUCache({ max: 20 });
        this.searchCache = new LRUCache({ max: 20 });
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


    // Get papers of a paper id
    getRootPapers = async (file: TFile, paperIds: Set<string>): Promise<SemanticPaper[]> => {
        if (paperIds.size === 0) {
            return [];
        }
        // Get the cached document if it exists
        const cachedDoc = this.cache.has(file) ? this.cache.get(file) : null;
        // If the cached document doesn't exist or the paperIds are different, fetch the new document
        if (!cachedDoc || !areSetsEqual(cachedDoc.paperIds, paperIds)) {
            console.log(paperIds)
            try {
                // const paper = await getPaperMetadata(paperIds.values().next().value);
                const rootPapers = await postPaperMetadata(paperIds);
                this.cache.set(file, { paperIds, rootPapers });
                return rootPapers;
            } catch (e) {
                console.log('Reference Map: S2AG API  GET rootPaper request error', e);
                return [];
            }
        }
        return cachedDoc.rootPapers;

    }

    // Get papers of a pandoc citekey id
    pandocGetRootPapers = async (file: TFile, paperIds: Set<string>): Promise<SemanticPaper[]> => {
        if (paperIds.size === 0) {
            return [];
        }
        // Get the cached document if it exists
        const cachedDoc = this.pandocCache.has(file) ? this.pandocCache.get(file) : null;
        // If the cached document doesn't exist or the paperIds are different, fetch the new document
        if (!cachedDoc || !areSetsEqual(cachedDoc.paperIds, paperIds)) {
            console.log(paperIds)
            try {
                const rootPapers = await postPaperMetadata(paperIds);
                this.pandocCache.set(file, { paperIds, rootPapers });
                return rootPapers;
            } catch (e) {
                console.log('Reference Map: S2AG API  GET rootPaper request error', e);
                return [];
            }
        }
        return cachedDoc.rootPapers;

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