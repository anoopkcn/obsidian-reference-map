import * as fs from 'fs'
import { parse } from '@retorquere/bibtex-parser'
import _ from 'lodash';
import { CiteKey, IndexPaper, Library, LocalCache, RELOAD, Reload } from 'src/types';
import { DEFAULT_LIBRARY, EXCLUDE_FILE_NAMES } from 'src/constants';
import { getCanvasContent, getLinkedFiles, removeNullReferences, resolvePath } from 'src/utils/functions'
import { convertToCiteKeyEntry, fillMissingReference, indexSort, setCiteKeyId } from 'src/utils/postprocess';
import { PromiseCapability } from 'src/promise';
import { getZBib } from 'src/utils/zotero';
import ReferenceMap from 'src/main';
import { ViewManager } from './viewManager';
import { CiteKeyEntry } from 'src/apis/bibTypes';
import { getCSLLocale, getCSLStyle } from 'src/utils/cslHelpers';
import { cslList } from 'src/utils/cslList';
import { cslLangList } from 'src/utils/cslLangList'
import { MetadataCache, TFile, Vault } from 'obsidian';

export class ReferenceMapData {
    plugin: ReferenceMap
    library: Library
    viewManager: ViewManager
    initPromise: PromiseCapability<void>;
    cache: LocalCache;

    constructor(plugin: ReferenceMap) {
        this.plugin = plugin
        this.library = DEFAULT_LIBRARY
        this.viewManager = new ViewManager(plugin)
        this.initPromise = new PromiseCapability();
        this.cache = {
            styleURL: '',
            locale: '',
            styleCache: new Map<string, string>(),
            localeCache: new Map<string, string>()
        }
    }

    async loadCache() {
        const { cacheDir, settings } = this.plugin;
        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir);
        }
        this.cache.styleURL = cslList.find((item) => item.label === settings.cslStyle)?.value ?? settings.defaultStyleURL
        this.cache.locale = cslLangList.find((item) => item.label === settings.cslLocale)?.value ?? settings.defaultLocale
        // The following will set the style cache and localeCache
        const citationStyle = await getCSLStyle(this.cache.styleCache, cacheDir, this.cache.styleURL);
        const citationLocale = await getCSLLocale(this.cache.localeCache, cacheDir, this.cache.locale);

        if (citationStyle && citationLocale) {
            return true;
        }
        return false;
    }

    async reload(reloadType: Reload) {
        const debug = this.plugin.settings.debugMode
        if (reloadType === RELOAD.HARD) {
            this.viewManager.clearCache()
            this.library.mtime = 0;
            await this.loadLibrary(false)
            this.loadCache()
            this.plugin.updateChecker.library = this.library;
            this.plugin.view?.processReferences()
            if (debug) console.log('ORM: Reloaded View and library')
        } else if (reloadType === RELOAD.SOFT) {
            await this.loadLibrary(false)
            this.viewManager.clearCache()
            this.plugin.updateChecker.library = this.library;
            this.plugin.view?.processReferences()
            if (debug) console.log('ORM: Reloaded library')
        } else if (reloadType === RELOAD.VIEW) {
            this.plugin.view?.processReferences()
            if (debug) console.log('ORM: Reloaded View')
        }
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

        const bib: CiteKeyEntry[] = [];
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
        const libraryPath = resolvePath(searchCiteKeyPath, this.plugin.app);
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
                    libraryData = JSON.parse(rawData) as CiteKeyEntry[];
                } else {
                    // the key property in Entry and id property in CiteKeyEntry are the same
                    libraryData = (parse(rawData, { errorHandler: () => { } }).entries as unknown) as CiteKeyEntry[];
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

    prepare = async (activeFile: TFile | null | undefined, vault: Vault, metadataCache: MetadataCache) => {
        let isUpdate = false
        if (activeFile === undefined) return isUpdate
        const settings = this.plugin.settings
        let fileCache = ''
        if (activeFile) {
            let isFm = false, isFn = false, isIdx = false, isCite = false;
            this.plugin.updateChecker.basename = activeFile.basename
            try {
                fileCache = await vault.cachedRead(activeFile);
            } catch (e) {
                fileCache = await vault.read(activeFile);
            }
            if (activeFile.extension === 'canvas') {
                fileCache += await getCanvasContent(fileCache, vault)
            }
            if (settings.lookupLinkedFiles) {
                const linkedFiles = getLinkedFiles(activeFile, metadataCache)
                for (const file of linkedFiles) {
                    if (file) {
                        const cache = await vault.cachedRead(file)
                        fileCache += cache
                    }
                }
            }
            const fileMetadataCache = metadataCache.getFileCache(activeFile);
            const isLibrary = settings.searchCiteKey && this.library.libraryData !== null
            if (isLibrary && settings.autoUpdateCitekeyFile) this.loadLibrary(false)
            this.plugin.updateChecker.setCache(fileCache, fileMetadataCache)
            const prefix = settings.findCiteKeyFromLinksWithoutPrefix ? '' : '@';

            if (settings.searchFrontMatter) isFm = this.plugin.updateChecker.checkFrontmatterUpdate(settings.searchFrontMatterKey)
            if (settings.searchTitle) isFn = this.plugin.updateChecker.checkFileNameUpdate()
            if (settings.searchCiteKey) isCite = this.plugin.updateChecker.checkCiteKeysUpdate(prefix)
            isIdx = this.plugin.updateChecker.checkIndexIdsUpdate()
            isUpdate = isFm || isFn || isIdx || isCite
        }
        else {
            this.plugin.updateChecker.resetCache()
            isUpdate = true
        }
        return isUpdate
    }

    getLocalReferences = async (citeKeyMap: CiteKey[] = []) => {
        const indexCards: IndexPaper[] = [];
        if (_.isEmpty(citeKeyMap)) return indexCards;
        _.map(citeKeyMap, (item: CiteKey): void => {
            const localPaper = this.library.libraryData?.find((entry) => entry.id === item.citeKey.replace('@', '')) as CiteKeyEntry;
            if (localPaper) {
                const paper_ = fillMissingReference(localPaper);
                indexCards.push({
                    id: item.citeKey,
                    location: item.location,
                    isLocal: true,
                    paper: paper_,
                    bibEntry: localPaper
                });
            }
        });
        return indexCards;
    }

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
                        indexCards.push({
                            id: paperCiteId,
                            location: null,
                            isLocal: false,
                            paper: paper,
                            bibEntry: undefined
                        });
                    }
                })
            );
        }

        // Get references using the cite keys
        if (citeKeyMap.length > 0 && settings.searchCiteKey) {
            await Promise.all(
                _.map(citeKeyMap, async (item, index): Promise<void> => {
                    const localPaper = this.library.libraryData?.find((entry) => entry.id === item.citeKey.replace('@', ''));
                    if (localPaper) {
                        let isLocal = true;
                        let paper = fillMissingReference(localPaper);
                        if (item.citeKey !== item.paperId) {
                            const indexPaper = await this.viewManager.getIndexPaper(item.paperId);
                            if (indexPaper && indexPaper.paperId) {
                                paper = fillMissingReference(localPaper, indexPaper);
                                isLocal = false;
                            }
                        }
                        indexCards.push({
                            id: item.citeKey,
                            location: item.location,
                            isLocal: isLocal,
                            paper: paper,
                            bibEntry: localPaper
                        });
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
                indexCards.push({ id: paper.paperId, location: null, isLocal: false, paper });
            });
        }

        // Get references using the front matter
        if (settings.searchFrontMatter && frontmatter) {
            const frontMatterPapers = await this.viewManager.searchIndexPapers(
                frontmatter, settings.searchFrontMatterLimit);
            _.forEach(frontMatterPapers, (paper) => {
                indexCards.push({ id: paper.paperId, location: null, isLocal: false, paper });
            });
        }

        const indexCards_ = this.preProcessReferences(indexCards);
        if (indexCards_.length > 0) {
            const CiteKeyEntry = indexCards_.map((indexPaper) => {
                return convertToCiteKeyEntry(indexPaper, indexPaper.id);
            });

            this.plugin.updateChecker.checkCSlEngineUpdate(
                CiteKeyEntry,
                this.cache.styleCache.get(this.cache.styleURL) as string,
                this.cache.localeCache.get(this.cache.locale) as string
            );
            const bibData = this.plugin.updateChecker.getCSL(CiteKeyEntry.map(item => item.id));
            if (bibData) {
                const indexCardsMap = new Map(indexCards_.map(item => [item.id, item]));
                bibData.forEach((item) => {
                    const paper = indexCardsMap.get(item.id);
                    if (paper) {
                        paper.paper.csl = item.bib;
                    }
                });
            }
        }
        return indexCards_
    };


    preProcessReferences = (indexCards: IndexPaper[]) => {
        let indexCardsTemp = removeNullReferences(indexCards);

        // This sorting has to be first because it is based on the location
        // of the reference in the file. otherwise _.uniqBy will remove the
        // duplicate references with locations

        if (!this.plugin.settings.enableIndexSorting) {
            indexCardsTemp = indexCardsTemp.sort((a, b) => {
                if (a.location === null) return 1;
                if (b.location === null) return -1;
                return a.location - b.location;
            });
        }

        indexCardsTemp = _.uniqBy(indexCardsTemp, item => item.paper.paperId);

        if (this.plugin.settings.enableIndexSorting) {
            indexCardsTemp = indexSort(
                indexCardsTemp,
                this.plugin.settings.sortByIndex,
                this.plugin.settings.sortOrderIndex
            );
        }

        return indexCardsTemp
    }
}

