import * as fs from 'fs'
import { parse } from '@retorquere/bibtex-parser'
import {
    PromiseCapability,
    getZBib,
    indexSort,
    removeNullReferences,
    resolvePath,
    setCiteKeyId
} from '../utils'
import { DEFAULT_LIBRARY, EXCLUDE_FILE_NAMES } from '../constants';
import ReferenceMap from '../main';
import { CiteKey, IndexPaper, Library, RELOAD, Reload, citeKeyLibrary } from '../types';
import { ViewManager } from './viewManager';
import _ from 'lodash';

export class ReferenceMapData {
    plugin: ReferenceMap
    library: Library
    viewManager: ViewManager
    initPromise: PromiseCapability<void>;

    constructor(plugin: ReferenceMap) {
        this.plugin = plugin
        this.library = DEFAULT_LIBRARY
        this.viewManager = new ViewManager(plugin)
        this.initPromise = new PromiseCapability();
    }

    async reload(reloadType: Reload) {
        const debug = this.plugin.settings.debugMode
        if (reloadType === RELOAD.HARD) {
            this.viewManager.clearCache()
            this.resetLibraryTime()
            await this.loadLibrary(false)
            this.plugin.updateChecker.library = this.library;
            this.plugin.view?.processReferences()
            if (debug) console.log('ORM: Reloaded View and library')
        } else if (reloadType === RELOAD.SOFT) {
            await this.loadLibrary(false)
            this.plugin.updateChecker.library = this.library;
            this.plugin.view?.processReferences()
            if (debug) console.log('ORM: Reloaded library')
        } else if (reloadType === RELOAD.VIEW) {
            this.plugin.view?.processReferences()
            if (debug) console.log('ORM: Reloaded View')
        }
    }

    resetLibraryTime = () => {
        this.library.mtime = 0;
    }

    async reinit(clearCache: boolean) {
        this.initPromise = new PromiseCapability();
        if (this.plugin.settings.pullFromZotero) {
            await this.loadBibFileFromCache(false);
        } else {
            await this.loadBibFileFromCache(true);
        }

        this.initPromise.resolve();
    }

    async loadBibFileFromCache(fromCache?: boolean) {
        const { settings, cacheDir } = this.plugin;
        if (!settings.zoteroGroups?.length) return;

        const bib: citeKeyLibrary[] = [];
        for (const group of settings.zoteroGroups) {
            try {
                const list = await getZBib(
                    settings.zoteroPort,
                    cacheDir,
                    group.id,
                    fromCache
                );
                if (list?.length) {
                    bib.push(...list);
                    group.lastUpdate = Date.now();
                }
            } catch (e) {
                console.error('Error fetching bibliography from Zotero', e);
                continue;
            }
        }
        this.library = {
            active: true,
            adapter: 'csl-json',
            libraryData: bib,
            mtime: Date.now(),
        };
        return bib;
    }

    loadBibFileFromUserPath = async () => {
        const { searchCiteKey, searchCiteKeyPath, debugMode } = this.plugin.settings;
        if (!searchCiteKey || !searchCiteKeyPath) return null;
        const libraryPath = resolvePath(searchCiteKeyPath);
        try {
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
                if (isJson) {
                    libraryData = JSON.parse(rawData) as citeKeyLibrary[];
                } else {
                    libraryData = parse(rawData, { errorHandler: () => { } }).entries as citeKeyLibrary[];
                }
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
        }
        catch (e) {
            if (debugMode) console.log('ORM: Error loading library file.');
            return null;
        }
    }

    loadLibrary = async (fromCache?: boolean) => {
        if (this.plugin.settings.searchCiteKey && this.plugin.settings.pullFromZotero) {
            await this.loadBibFileFromCache(fromCache);
            this.plugin.updateChecker.library = this.library;
            return
        } else if (this.plugin.settings.searchCiteKey && this.plugin.settings.searchCiteKeyPath) {
            await this.loadBibFileFromUserPath();
            this.plugin.updateChecker.library = this.library;
            return
        } else {
            this.library = DEFAULT_LIBRARY
        }
    };


    getIndexCards = async (
        indexIds: Set<string>,
        citeKeyMap: CiteKey[],
        fileName: string,
        frontmatter: string,
        basename: string,

    ) => {
        const indexCards: IndexPaper[] = [];
        const settings = this.plugin.settings
        // Get references using the paper IDs
        if (indexIds.size > 0) {
            await Promise.all(
                _.map([...indexIds], async (paperId) => {
                    const paper = await this.viewManager.getIndexPaper(paperId);
                    if (paper !== null && typeof paper !== "number") {
                        const paperCiteId =
                            settings.searchCiteKey &&
                                this.library.libraryData !== null &&
                                settings.findZoteroCiteKeyFromID
                                ? setCiteKeyId(paperId, this.library)
                                : paperId;
                        indexCards.push({ id: paperCiteId, location: null, paper });
                    }
                })
            );
        }

        // Get references using the cite keys
        if (citeKeyMap.length > 0 && settings.searchCiteKey) {
            await Promise.all(
                _.map(citeKeyMap, async (item) => {
                    if (item.paperId !== item.citeKey) {
                        const paper = await this.viewManager.getIndexPaper(item.paperId);
                        if (paper !== null && typeof paper !== "number") {
                            indexCards.push({ id: item.citeKey, location: item.location, paper });
                        }
                    }
                })
            );
        }

        // Get references using the file name
        if (settings.searchTitle && fileName && !EXCLUDE_FILE_NAMES.some(
            (name) => basename.toLowerCase() === name.toLowerCase())
        ) {
            const titleSearchPapers = await this.viewManager.searchIndexPapers(
                fileName,
                settings.searchLimit
            );
            _.forEach(titleSearchPapers, (paper) => {
                indexCards.push({ id: paper.paperId, location: null, paper });
            });
        }

        // Get references using the front matter
        if (settings.searchFrontMatter && frontmatter) {
            const frontMatterPapers = await this.viewManager.searchIndexPapers(
                frontmatter, settings.searchFrontMatterLimit);
            _.forEach(frontMatterPapers, (paper) => {
                indexCards.push({ id: paper.paperId, location: null, paper });
            });
        }
        return this.preProcessReferences(indexCards);
    };


    preProcessReferences = (indexCards: IndexPaper[]) => {
        if (!this.plugin.settings.enableIndexSorting) {
            // Remove null references and sort the array
            return removeNullReferences(indexCards).sort((a, b) => {
                // If location is null, place it at the end
                if (a.location === null) return 1;
                if (b.location === null) return -1;

                // Sort by location
                return a.location - b.location;
            });
        }
        return indexSort(
            removeNullReferences(indexCards),
            this.plugin.settings.sortByIndex,
            this.plugin.settings.sortOrderIndex
        )
    }
}

