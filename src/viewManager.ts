import { TFile } from 'obsidian';
import LRUCache from 'lru-cache';
import { SemanticPaper } from './types';
import ReferenceMap from './main';
import { areSetsEqual, getPaperIds } from './utils';
import { getPaperMetadata, postPaperMetadata } from './routers/s2agAPI';

export interface DocCache {
    paperIds: Set<string>;
    rootPapers: SemanticPaper[];
}

export class ViewManager {
    plugin: ReferenceMap;
    cache: LRUCache<TFile, DocCache>;
    refCache: LRUCache<string, SemanticPaper[]>;
    citeCache: LRUCache<string, SemanticPaper[]>;

    constructor(plugin: ReferenceMap) {
        this.plugin = plugin;
        this.cache = new LRUCache({ max: 20 });
        this.refCache = new LRUCache({ max: 20 });
        this.citeCache = new LRUCache({ max: 20 });
    }

    getRootPapers = async (file: TFile): Promise<SemanticPaper[]> => {
        const fileContent = await app.vault.cachedRead(file);
        const paperIds = getPaperIds(fileContent)
        if (paperIds.size === 0) {
            return [];
        }
        // Get the cached document if it exists
        const cachedDoc = this.cache.has(file) ? this.cache.get(file) : null;
        // If the cached document doesn't exist or the paperIds are different, fetch the new document
        if (!cachedDoc || !areSetsEqual(cachedDoc.paperIds, paperIds)) {
            try {
                // const paper = await getPaperMetadata(paperIds.values().next().value);
                const rootPapers = await postPaperMetadata(paperIds);
                this.cache.set(file, { paperIds, rootPapers });
                return rootPapers;
            } catch (e) {
                console.log('Reference Map: S2AG API request error', e);
                return [];
            }
        }
        return cachedDoc.rootPapers;

    }
    getReferences = async (paperId: string): Promise<SemanticPaper[]> => {
        const cachedRefs = this.refCache.has(paperId) ? this.refCache.get(paperId) : null;
        if (!cachedRefs) {
            try {
                const references = await getPaperMetadata(paperId, 'references');
                this.refCache.set(paperId, references);
                return references;
            } catch (e) {
                console.log('Reference Map: S2AG API request error', e);
                return [];
            }
        }
        return cachedRefs
    }
    getCitations = async (paperId: string): Promise<SemanticPaper[]> => {
        const cachedCitations = this.citeCache.has(paperId) ? this.citeCache.get(paperId) : null;
        if (!cachedCitations) {
            try {
                const citations = await getPaperMetadata(paperId, 'citations');
                this.citeCache.set(paperId, citations);
                return citations;
            } catch (e) {
                console.log('Reference Map: S2AG API request error', e);
                return [];
            }
        }
        return cachedCitations
    }
}