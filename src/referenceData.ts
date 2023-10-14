import * as fs from 'fs'
import * as BibTeXParser from '@retorquere/bibtex-parser'
import { resolvePath } from './utils'
import { DEFAULT_LIBRARY } from './constants';
import ReferenceMap from './main';
import { Library } from './types';

export class ReferenceMapData {
    plugin: ReferenceMap
    library: Library
    constructor(plugin: ReferenceMap) {
        this.plugin = plugin
        this.library = DEFAULT_LIBRARY
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


}

