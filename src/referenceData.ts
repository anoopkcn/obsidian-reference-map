import * as fs from 'fs'
import * as BibTeXParser from '@retorquere/bibtex-parser'
import {
    PromiseCapability,
    extractKeywords,
    getCiteKeyIds,
    getCiteKeys,
    getPaperIds,
    getZBib,
    indexSort,
    removeNullReferences,
    resolvePath,
    setCiteKeyId
} from './utils'
import { DEFAULT_LIBRARY, EXCLUDE_FILE_NAMES } from './constants';
import ReferenceMap from './main';
import { CiteKey, IndexPaper, Library, RELOAD, Reload, citeKeyLibrary } from './types';
import _ from 'lodash';
import { ViewManager } from './viewManager';
import { CachedMetadata, MarkdownView } from 'obsidian';

export class ReferenceMapData {
    plugin: ReferenceMap
    library: Library
    viewManager: ViewManager
    paperIDs: Set<string>
    citeKeyMap: CiteKey[]
    frontMatterString: string
    fileNameString: string
    basename: string
    initPromise: PromiseCapability<void>;

    constructor(plugin: ReferenceMap) {
        this.plugin = plugin
        this.library = DEFAULT_LIBRARY
        this.viewManager = new ViewManager(plugin)
        this.initPromise = new PromiseCapability();
        this.paperIDs = new Set()
        this.citeKeyMap = []
        this.frontMatterString = ''
        this.fileNameString = ''
        this.basename = ''
    }

    async reload(reloadType: Reload) {
        const debug = this.plugin.settings.debugMode
        if (reloadType === RELOAD.HARD) {
            this.viewManager.clearCache()
            this.resetLibraryTime()
            await this.loadLibrary(false)
            this.plugin.view?.processReferences()
            if (debug) console.log('ORM: Reloaded View and library')
        } else if (reloadType === RELOAD.SOFT) {
            await this.loadLibrary(false)
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
        }
        catch (e) {
            if (debugMode) console.log('ORM: Error loading library file.');
            return null;
        }
    }

    loadLibrary = async (fromCache?: boolean) => {
        if (this.plugin.settings.searchCiteKey && this.plugin.settings.pullFromZotero) {
            await this.loadBibFileFromCache(fromCache);
            return
        } else if (this.plugin.settings.searchCiteKey && this.plugin.settings.searchCiteKeyPath) {
            await this.loadBibFileFromUserPath();
            return
        } else {
            this.library = DEFAULT_LIBRARY
        }
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
        const settings = this.plugin.settings
        // Get references using the paper IDs
        if (paperIDs.size > 0) {
            await Promise.all(
                _.map([...paperIDs], async (paperId) => {
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
        if (
            settings.searchTitle &&
            fileNameString &&
            !EXCLUDE_FILE_NAMES.some(
                (name) => basename.toLowerCase() === name.toLowerCase()
            )
        ) {
            const titleSearchPapers = await this.viewManager.searchIndexPapers(
                fileNameString,
                settings.searchLimit
            );
            _.forEach(titleSearchPapers, (paper) => {
                indexCards.push({ id: paper.paperId, location: null, paper });
            });
        }

        // Get references using the front matter
        if (settings.searchFrontMatter && frontMatterString) {
            const frontMatterPapers = await this.viewManager.searchIndexPapers(
                frontMatterString,
                settings.searchFrontMatterLimit
            );
            _.forEach(frontMatterPapers, (paper) => {
                indexCards.push({ id: paper.paperId, location: null, paper });
            });
        }
        if (preprocess) {
            return this.preProcessReferences(indexCards);
        }

        return indexCards;
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


    updatePaperIDs = (
        activeView: MarkdownView,
        fileMetadataCache = '',
        fileCache: CachedMetadata | null = null,
        check = false
    ) => {
        let paperIDs = new Set<string>()
        let citeKeyMap: CiteKey[] = []
        let frontMatterString = ''
        let fileNameString = ''
        let isUpdated = false

        const settings = this.plugin.settings
        const isLibrary = settings.searchCiteKey && this.library.libraryData !== null
        if (isLibrary && settings.autoUpdateCitekeyFile) this.loadLibrary(false)
        this.basename = activeView.file?.basename ?? ''

        if (fileMetadataCache) paperIDs = getPaperIds(fileMetadataCache)

        if (isLibrary) {
            const prefix = settings.findCiteKeyFromLinksWithoutPrefix ? '' : '@'
            const citeKeys = getCiteKeys(this.library.libraryData, fileMetadataCache, prefix)
            citeKeyMap = getCiteKeyIds(citeKeys, this.library)
        }

        if (settings.searchFrontMatter) {
            if (activeView.file && fileCache) {
                if (fileCache?.frontmatter) {
                    const keywords =
                        fileCache?.frontmatter?.[
                        settings.searchFrontMatterKey
                        ];
                    if (keywords)
                        frontMatterString = extractKeywords(keywords)
                            .unique()
                            .join("+");
                }
            }
        }

        if (
            settings.searchTitle &&
            !EXCLUDE_FILE_NAMES.some(
                (name) => this.basename.toLowerCase() === name.toLowerCase()
            )
        ) {
            fileNameString = extractKeywords(this.basename)
                .unique()
                .join('+')
        }

        if (check) {
            const isPaperIDsUpdated = _.isEqual(paperIDs, this.paperIDs)
            const isCiteKeyMapUpdated = _.isEqual(citeKeyMap, this.citeKeyMap)
            const isFrontMatterUpdated = frontMatterString === this.frontMatterString
            const isFileNameUpdated = fileNameString === this.fileNameString

            isUpdated =
                !isPaperIDsUpdated ||
                !isCiteKeyMapUpdated ||
                !isFrontMatterUpdated ||
                !isFileNameUpdated
            if (isUpdated) {
                this.paperIDs = paperIDs
                this.citeKeyMap = citeKeyMap
                this.frontMatterString = frontMatterString
                this.fileNameString = fileNameString
                return isUpdated
            }
            return isUpdated
        } else {
            this.paperIDs = paperIDs
            this.citeKeyMap = citeKeyMap
            this.frontMatterString = frontMatterString
            this.fileNameString = fileNameString
            return isUpdated
        }
    }
}

