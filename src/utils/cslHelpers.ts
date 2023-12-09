// Following functions are copied from 
// https://github.com/mgmeyers/obsidian-pandoc-reference-list
// with some modifications

import https from "https";
import fs from "fs";
import { ensureDir } from "./functions";
import path from "path";

export async function getCSLLocale(
    localeCache: Map<string, string>,
    cacheDir: string,
    lang: string
): Promise<string> {
    if (!lang) lang = 'en-US';

    if (localeCache.has(lang)) {
        return localeCache.get(lang) as string
    }

    const url = `https://raw.githubusercontent.com/citation-style-language/locales/master/locales-${lang}.xml`;
    const outPath = path.join(cacheDir, `locales-${lang}.xml`);

    ensureDir(cacheDir);
    if (fs.existsSync(outPath)) {
        const localeData = fs.readFileSync(outPath).toString();
        localeCache.set(lang, localeData);
        return localeData;
    }

    const str = await new Promise<string>((res, rej) => {
        https.get(url, (result) => {
            let output = '';

            result.setEncoding('utf8');
            result.on('data', (chunk) => (output += chunk));
            result.on('error', (e) => rej(`Downloading locale: ${e}`));
            result.on('close', () => {
                rej(new Error('Error: cannot download locale'));
            });
            result.on('end', () => {
                if (/^404: Not Found/.test(output)) {
                    rej(new Error('Error downloading locale: 404: Not Found'));
                } else {
                    res(output);
                }
            });
        });
    });

    fs.writeFileSync(outPath, str);
    localeCache.set(lang, str);
    return str;
}

export async function getCSLStyle(
    styleCache: Map<string, string>,
    cacheDir: string,
    url: string,
): Promise<string> {
    if (!url) url = 'https://raw.githubusercontent.com/citation-style-language/styles/master/apa.csl';

    if (styleCache.has(url)) {
        return styleCache.get(url) as string
    }

    const fileFromURL = url.split('/').pop();
    const outPath = path.join(cacheDir, fileFromURL ?? '');

    ensureDir(cacheDir);
    if (fs.existsSync(outPath)) {
        const styleData = fs.readFileSync(outPath).toString();
        styleCache.set(url, styleData);
        return styleData;
    }

    const str = await new Promise<string>((res, rej) => {
        https.get(url, (result) => {
            let output = '';

            result.setEncoding('utf8');
            result.on('data', (chunk) => (output += chunk));
            result.on('error', (e) => rej(`Error downloading CSL: ${e}`));
            result.on('close', () => {
                rej(new Error('Error: cannot download CSL'));
            });
            result.on('end', () => {
                try {
                    res(output);
                } catch (e) {
                    rej(e);
                }
            });
        });
    });

    fs.writeFileSync(outPath, str);
    styleCache.set(url, str);
    return str;
}
