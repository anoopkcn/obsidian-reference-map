// Following functions are copied from 
// https://github.com/mgmeyers/obsidian-pandoc-reference-list/blob/main/src/bib/helpers.ts
// with some modifications

import fs from "fs";
import http, { request } from "http";
import https from "https";
import path from "path";
import { DEFAULT_HEADERS, DEFAULT_ZOTERO_PORT } from "src/constants";
import { CSLList, PartialCSLEntry } from "src/types";


function ensureDir(dir: string) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}
function getGlobal() {
    if (window?.activeWindow) return activeWindow;
    if (window) return window;
    return global;

}
export async function isZoteroRunning(port: string = DEFAULT_ZOTERO_PORT) {
    const options = {
        hostname: '127.0.0.1',
        port: port,
        path: '/better-bibtex/cayw?probe=true',
        method: 'GET',
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: any = await Promise.race([
        new Promise((resolve, reject) => {
            const req = http.request(options, res => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve(data));
            });
            req.on('error', (error: NodeJS.ErrnoException) => {
                // if (error.code === 'ECONNREFUSED') {
                resolve(null); // if connection is refused, return false



                // } else {
                // 	reject(error); // for other errors, reject the promise
                // }
            });
            req.end();
        }),
        new Promise((resolve) => {
            getGlobal().setTimeout(() => {
                resolve(null);
            }, 150);
        }),
    ]);

    return res?.toString() === 'ready';
}
function applyGroupID(list: CSLList, groupId: number) {
    return list.map((item) => {
        item.groupID = groupId;
        return item;
    });
}

export async function getZBib(
    port: string = DEFAULT_ZOTERO_PORT,
    cacheDir: string,
    groupId: number,
    loadCached?: boolean
) {
    const isRunning = await isZoteroRunning(port);
    const cached = path.join(cacheDir, `zotero-library-${groupId}.json`);

    ensureDir(cacheDir);
    if (loadCached || !isRunning) {
        if (fs.existsSync(cached)) {
            return applyGroupID(
                JSON.parse(fs.readFileSync(cached).toString()) as CSLList,
                groupId
            );
        }
        if (!isRunning) {
            return null;
        }
    }

    const options = {
        hostname: '127.0.0.1',
        port: port,
        path: `/better-bibtex/export/library?/${groupId}/library.json`,
        method: 'GET',
    };

    const req = http.request(options);
    req.end();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bib: any = await new Promise((resolve, reject) => {
        req.on('response', (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(data));
        });
        req.on('error', reject);
    });

    const str = bib.toString();

    fs.writeFileSync(cached, str);

    return applyGroupID(JSON.parse(str) as CSLList, groupId);
}


export async function getZUserGroups(
    port: string = DEFAULT_ZOTERO_PORT
): Promise<Array<{ id: number; name: string; }>> {
    if (!(await isZoteroRunning(port))) return [];

    return new Promise((res, rej) => {
        const body = JSON.stringify({
            jsonrpc: '2.0',
            method: 'user.groups',
        });

        const postRequest = request(
            {
                host: '127.0.0.1',
                port: port,
                path: '/better-bibtex/json-rpc',
                method: 'POST',
                headers: {
                    ...DEFAULT_HEADERS,
                    'Content-Length': Buffer.byteLength(body),
                },
            },
            (result) => {
                let output = '';

                result.setEncoding('utf8');
                result.on('data', (chunk) => (output += chunk));
                result.on('error', (e) => rej(`Error connecting to Zotero: ${e}`));
                result.on('close', () => {
                    rej(new Error('Error: cannot connect to Zotero'));
                });
                result.on('end', () => {
                    try {
                        res(JSON.parse(output).result);
                    } catch (e) {
                        rej(e);
                    }
                });
            }
        );

        postRequest.write(body);
        postRequest.end();
    });
}
function panNum(n: number) {
    if (n < 10) return `0${n}`;
    return n.toString();
}
function timestampToZDate(ts: number) {
    const d = new Date(ts);
    return `${d.getUTCFullYear()}-${panNum(d.getUTCMonth() + 1)}-${panNum(
        d.getUTCDate()
    )} ${panNum(d.getUTCHours())}:${panNum(d.getUTCMinutes())}:${panNum(
        d.getUTCSeconds()
    )}`;
}

export async function getZModified(
    port: string = DEFAULT_ZOTERO_PORT,
    groupId: number,
    since: number
): Promise<CSLList> {
    if (!(await isZoteroRunning(port))) return [];

    return new Promise((res, rej) => {
        const body = JSON.stringify({
            jsonrpc: '2.0',
            method: 'item.search',
            params: [[['dateModified', 'isAfter', timestampToZDate(since)]], groupId],
        });

        const postRequest = request(
            {
                host: '127.0.0.1',
                port: port,
                path: '/better-bibtex/json-rpc',
                method: 'POST',
                headers: {
                    ...DEFAULT_HEADERS,
                    'Content-Length': Buffer.byteLength(body),
                },
            },
            (result) => {
                let output = '';

                result.setEncoding('utf8');
                result.on('data', (chunk) => (output += chunk));
                result.on('error', (e) => rej(`Error connecting to Zotero: ${e}`));
                result.on('close', () => {
                    rej(new Error('Error: cannot connect to Zotero'));
                });
                result.on('end', () => {
                    try {
                        res(JSON.parse(output).result);
                    } catch (e) {
                        rej(e);
                    }
                });
            }
        );

        postRequest.write(body);
        postRequest.end();
    });
}


export async function refreshZBib(
    port: string = DEFAULT_ZOTERO_PORT,
    cacheDir: string,
    groupId: number,
    since: number
) {
    if (!(await isZoteroRunning(port))) {
        return null;
    }

    const cached = path.join(cacheDir, `zotero-library-${groupId}.json`);
    ensureDir(cacheDir);
    if (!fs.existsSync(cached)) {
        return null;
    }

    const mList = (await getZModified(port, groupId, since)) as CSLList;

    if (!mList?.length) {
        return null;
    }

    const modified: Map<string, PartialCSLEntry> = new Map();
    const newKeys: Set<string> = new Set();

    for (const mod of mList) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mod.id = (mod as any).citekey || (mod as any)['citation-key'];
        if (!mod.id) continue;
        modified.set(mod.id, mod);
        newKeys.add(mod.id);
    }

    const list = JSON.parse(fs.readFileSync(cached).toString()) as CSLList;

    for (let i = 0; i < list.length; i++) {
        const item = list[i];
        if (modified.has(item.id)) {
            newKeys.delete(item.id);
            const modifiedItem = modified.get(item.id);
            if (modifiedItem !== undefined) {
                list[i] = modifiedItem;
            }
        }
    }

    for (const key of newKeys) {
        const modifiedItem = modified.get(key);
        if (modifiedItem !== undefined) {
            list.push(modifiedItem);
        }
    }

    fs.writeFileSync(cached, JSON.stringify(list));

    return {
        list: applyGroupID(list, groupId),
        modified,
    };
}


export async function getCSLStyle(
    styleCache: Map<string, string>,
    cacheDir: string,
    url: string,
    explicitPath?: string
) {
    if (explicitPath) {
        if (styleCache.has(explicitPath)) {
            return styleCache.get(explicitPath);
        }

        if (!fs.existsSync(explicitPath)) {
            throw new Error(
                `Error: retrieving citation style; Cannot find file '${explicitPath}'.`
            );
        }

        const styleData = fs.readFileSync(explicitPath).toString();
        styleCache.set(explicitPath, styleData);
        return styleData;
    }

    if (styleCache.has(url)) {
        return styleCache.get(url);
    }

    const fileFromURL = url.split('/').pop();
    const outpath = path.join(cacheDir, fileFromURL ?? '');

    ensureDir(cacheDir);
    if (fs.existsSync(outpath)) {
        const styleData = fs.readFileSync(outpath).toString();
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

    fs.writeFileSync(outpath, str);
    styleCache.set(url, str);
    return str;
}
