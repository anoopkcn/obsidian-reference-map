import * as fs from 'fs'
import * as BibTeXParser from '@retorquere/bibtex-parser'
import { indexSort, removeNullReferences, resolvePath, setCiteKeyId } from './utils'
import { DEFAULT_LIBRARY, EXCLUDE_FILE_NAMES } from './constants';
import ReferenceMap from './main';
import { CiteKey, IndexPaper, Library } from './types';
import _ from 'lodash';
import { ViewManager } from './viewManager';

export class ReferenceMapData {
    plugin: ReferenceMap
    library: Library
    viewManager: ViewManager
    constructor(plugin: ReferenceMap) {
        this.plugin = plugin
        this.library = DEFAULT_LIBRARY
        this.viewManager = new ViewManager(plugin)
    }

    resetLibraryTime = () => {
        this.library.mtime = 0;
    }

    loadLibrary = async () => {
        const { searchCiteKey, searchCiteKeyPath, debugMode } = this.plugin.settings;
        if (!searchCiteKey || !searchCiteKeyPath) return null;

        const libraryPath = resolvePath(searchCiteKeyPath);
        const stats = fs.statSync(libraryPath);
        const mtime = stats.mtimeMs;
        if (mtime === this.library.mtime) return null;

        if (debugMode) console.log(`ORM: Loading library from '${searchCiteKeyPath}'`);
        let rawData;
        try {
            rawData = fs.readFileSync(libraryPath).toString();
        } catch (e) {
            if (debugMode) console.warn('ORM: Warnings associated with loading the library file.');
            return null;
        }

        const isJson = searchCiteKeyPath.endsWith('.json');
        const isBib = searchCiteKeyPath.endsWith('.bib');
        if (!isJson && !isBib) return null;

        let libraryData;
        try {
            libraryData = isJson ? JSON.parse(rawData) : BibTeXParser.parse(rawData, { errorHandler: () => { } }).entries;
        } catch (e) {
            if (debugMode) console.warn('ORM: Warnings associated with loading the library file.');
            return null;
        }

        this.library = {
            active: true,
            adapter: isJson ? 'csl-json' : 'bibtex',
            libraryData,
            mtime,
        };
        return libraryData;
    };


    getIndexCards = async (
        paperIDs: Set<string> = new Set(),
        citeKeyMap: CiteKey[] = [],
        fileNameString = '',
        frontMatterString = '',
        basename = '',
        preprocess = false

    ) => {
        const indexCards: IndexPaper[] = [];

        // Get references using the paper IDs
        if (paperIDs.size > 0) {
            await Promise.all(
                _.map([...paperIDs], async (paperId) => {
                    const paper = await this.viewManager.getIndexPaper(paperId);
                    if (paper !== null && typeof paper !== "number") {
                        const paperCiteId =
                            this.plugin.settings.searchCiteKey &&
                                this.library.libraryData !== null &&
                                this.plugin.settings.findZoteroCiteKeyFromID
                                ? setCiteKeyId(paperId, this.library)
                                : paperId;
                        indexCards.push({ id: paperCiteId, paper });
                    }
                })
            );
        }

        // Get references using the cite keys
        if (citeKeyMap.length > 0) {
            await Promise.all(
                _.map(citeKeyMap, async (item) => {
                    const paper = await this.viewManager.getIndexPaper(item.paperId);
                    if (paper !== null && typeof paper !== "number") {
                        indexCards.push({ id: item.citeKey, paper });
                    }
                })
            );
        }

        // Get references using the file name
        if (
            this.plugin.settings.searchTitle &&
            fileNameString &&
            !EXCLUDE_FILE_NAMES.some(
                (name) => basename.toLowerCase() === name.toLowerCase()
            )
        ) {
            const titleSearchPapers = await this.viewManager.searchIndexPapers(
                fileNameString,
                this.plugin.settings.searchLimit
            );
            _.forEach(titleSearchPapers, (paper) => {
                indexCards.push({ id: paper.paperId, paper });
            });
        }

        // Get references using the front matter
        if (this.plugin.settings.searchFrontMatter && frontMatterString) {
            const frontMatterPapers = await this.viewManager.searchIndexPapers(
                frontMatterString,
                this.plugin.settings.searchFrontMatterLimit
            );
            _.forEach(frontMatterPapers, (paper) => {
                indexCards.push({ id: paper.paperId, paper });
            });
        }
        if (preprocess) {
            return this.preProcessReferences(indexCards);
        }

        return indexCards;
    };

    preProcessReferences = (indexCards: IndexPaper[]) => {
        if (!this.plugin.settings.enableIndexSorting) {
            return removeNullReferences(indexCards)
        }
        return indexSort(
            removeNullReferences(indexCards),
            this.plugin.settings.sortByIndex,
            this.plugin.settings.sortOrderIndex
        )
    }


}

