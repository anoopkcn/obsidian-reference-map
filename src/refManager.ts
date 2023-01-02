import LRUCache from 'lru-cache';
import { SemanticPaper } from './types';
import { getPaperMetadata } from './referencemap';

export interface DocCache {
    paperIds: Set<string>;
    rootPapers: SemanticPaper[];
}

export class ViewManager {
    paperId: string;
    refCache: LRUCache<string, SemanticPaper[]>;

    constructor(paperId: string) {
        this.paperId = paperId;
        this.refCache = new LRUCache({ max: 20 });
    }

    getReferences = async (paperId: string): Promise<SemanticPaper[]> => {
        const cachedRefs = this.refCache.has(paperId) ? this.refCache.get(paperId) : null;
        if (!cachedRefs) {
            try {
                const references = await getPaperMetadata(paperId, 'references');
                this.refCache.set(paperId, references);
                return references;
            } catch (e) {
                // console.error(e);
                return [];
            }
        }
        return cachedRefs
    }

}