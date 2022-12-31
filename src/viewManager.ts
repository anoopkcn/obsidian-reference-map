// import LRUCache from 'lru-cache';
// import { TFile } from 'obsidian';
// import { SemanticPaper } from './types';
import ReferenceMap from './main';
import { getPaperIds } from './utils';
import { getPaperMetadata } from './referencemap';
import { TFile } from 'obsidian';

// export interface DocCache {
//     paperIds: string[];
//     paper: SemanticPaper;
// }

export class ViewManager {
    plugin: ReferenceMap;
    // cache: LRUCache<TFile, DocCache>;

    constructor(plugin: ReferenceMap) {
        this.plugin = plugin;
        // this.cache = new LRUCache({ max: 20 });
    }

    getRootPaper = async (file: TFile, fileContent: string) => {
        const paperIds = getPaperIds(fileContent)
        console.log(paperIds)
        // if (paperIds.length === 0) {
        //     return null;
        // }
        const paper = await getPaperMetadata(paperIds[0]);
        const rootPaper = paper[0];
        console.log(rootPaper)
        return rootPaper;

    }

}