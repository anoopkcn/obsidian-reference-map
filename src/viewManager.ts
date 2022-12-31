import LRUCache from 'lru-cache';
// import { TFile } from 'obsidian';
import { SemanticPaper } from './types';
import ReferenceMap from './main';
import { areSetsEqual, getPaperIds } from './utils';
import { getPaperMetadata } from './referencemap';
import { TFile } from 'obsidian';

export interface DocCache {
    paperIds: Set<string>;
    rootPaper: SemanticPaper;
}

export class ViewManager {
    plugin: ReferenceMap;
    cache: LRUCache<TFile, DocCache>;

    constructor(plugin: ReferenceMap) {
        this.plugin = plugin;
        this.cache = new LRUCache({ max: 20 });
    }

    getRootPaper = async (file: TFile): Promise<SemanticPaper | null> => {
        const fileContent = await app.vault.cachedRead(file);
        const paperIds = getPaperIds(fileContent)
        if (paperIds.size === 0) {
            return null;
        }
        // Get the cached document if it exists
        const cachedDoc = this.cache.has(file) ? this.cache.get(file) : null;
        // If the cached document doesn't exist or the paperIds are different, fetch the new document
        if (!cachedDoc || !areSetsEqual(cachedDoc.paperIds, paperIds)) {
            try {
                const paper = await getPaperMetadata(paperIds.values().next().value);
                const rootPaper = paper[0];
                this.cache.set(file, { paperIds, rootPaper });
                return paper[0];
            } catch (e) {
                if (!e.message.includes('references container not found')) {
                    console.error(e);
                }
                return null;
            }
        }
        return cachedDoc.rootPaper;

    }

}