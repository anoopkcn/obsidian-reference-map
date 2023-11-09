import { App, FileSystemAdapter, MarkdownView, Notice, TFile, CachedMetadata } from 'obsidian'
import path from 'path'
import fs from 'fs';
import doiRegex from 'doi-regex'
import download from 'download';
import { request } from 'http';
import https from 'https';
import { CSLList, CiteKey, IndexPaper, Library, MetaData, PartialCSLEntry, Reference, citeKeyLibrary } from './types'
import {
	// BIBTEX_STANDARD_TYPES,
	COMMON_WORDS,
	DEFAULT_HEADERS,
	DEFAULT_ZOTERO_PORT,
	NUMBERS,
	PUNCTUATION,
	SEARCH_PARAMETERS,
	VALID_S2AG_API_URLS,
	EXCLUDE_FILE_NAMES
} from './constants'

export function getVaultRoot() {
	// This is a desktop only plugin, so assume adapter is FileSystemAdapter
	return (app.vault.adapter as FileSystemAdapter).getBasePath();
}

export const fragWithHTML = (html: string) =>
	createFragment((frag) => (frag.createDiv().innerHTML = html))

export const errorlog = (data: Record<string, unknown>) => {
	console.error({ plugin: 'Zotero Annotations', ...data })
}

export const isEmpty = (obj: Reference): boolean => {
	return Object.keys(obj).length === 0
}

export function areSetsEqual<T>(as: Set<T>, bs: Set<T>) {
	if (as.size !== bs.size) return false
	return Array.from(as).every((element) => {
		return bs.has(element)
	})
}

export function camelToNormalCase(str: string) {
	return str.replace(/([A-Z])/g, ' $1').replace(/^./, function (str) {
		return str.toUpperCase()
	})
}

// Get normalized path
export const resolvePath = function (rawPath: string): string {
	const vaultRoot =
		this.app.vault.adapter instanceof FileSystemAdapter
			? this.app.vault.adapter.getBasePath()
			: '/'
	return path.normalize(path.resolve(vaultRoot, rawPath))
}

// Given a markdown file contents regex match the DOI's from the file
export const getPaperIds = (content: string): Set<string> => {
	const modContent = content.replaceAll('](', ' ')
	const output: string[] = []

	const arxivRegex = /arXiv:\s*(\d{4}\.\d{4,5})/gi
	const arXivMatches = modContent.matchAll(arxivRegex)
	const corpusRegex = /CorpusId:\s*(\d{4,})/gi
	const corpusMatches = modContent.matchAll(corpusRegex)
	const magRegex = /MAG:\s*(\d{4,})/gi
	const magMatches = modContent.matchAll(magRegex)
	const pmidRegex = /PMID:\s*(\d{4,})/gi
	const pmidMatches = modContent.matchAll(pmidRegex)
	const pmcidRegex = /PMCID:\s*([a-zA-Z]*\d{4,})/gi
	const pmcidMatches = modContent.matchAll(pmcidRegex)
	const urlRegex = /URL:\s*(http[s]?:.[^\s]+)/gi
	const urlMatches = modContent.matchAll(urlRegex)
	const doi_matches = modContent.match(doiRegex())

	if (arXivMatches) {
		for (const match of arXivMatches) {
			output.push(`arXiv:${match[1]}`)
		}
	}
	if (corpusMatches) {
		for (const match of corpusMatches) {
			output.push(`CorpusId:${match[1]}`)
		}
	}
	if (magMatches) {
		for (const match of magMatches) {
			output.push(`MAG:${match[1]}`)
		}
	}
	if (pmidMatches) {
		for (const match of pmidMatches) {
			output.push(`PMID:${match[1]}`)
		}
	}

	if (pmcidMatches) {
		for (const match of pmcidMatches) {
			output.push(`PMCID:${match[1]}`)
		}
	}
	if (urlMatches) {
		for (const match of urlMatches) {
			if (VALID_S2AG_API_URLS.some((item) => match[1].includes(item))) {
				output.push(`URL:${match[1]}`)
			}
		}
	}
	if (doi_matches) {
		for (const match of doi_matches) {
			output.push(match.replace(/\)+$|\]+$|\*+$|_+$|`+$/, ''))
		}
	}
	return new Set(output.sort())
}

export const sanitizeDOI = (dirtyDOI: string) => {
	const doi_matches = dirtyDOI.match(doiRegex())
	if (doi_matches) {
		for (const match of doi_matches) {
			return match
				.replace(/\)+$|\]+$|\*+$|_+$|`+$/, '')
				.replace(/\s+/g, '')
		}
	}
	return dirtyDOI.replace(/\s+/g, '')
}

export const sanitizeCiteKey = (dirtyCiteKey: string) => {
	return dirtyCiteKey
		.replace(/^@+|\)+$|\]+$|\*+$|_+$|`+$|'+$|"+$/, '')
		.replace(/\s+/g, '')
}

export const getCiteKeys = (
	libraryData: citeKeyLibrary[] | null | undefined,
	content: string,
	prefix: string
): Set<string> => {
	const citekeys = libraryData?.map((item) => prefix + item.id) ?? []
	// Collect all citekes from the content
	const pattern = new RegExp(citekeys.join('|'), 'g');
	const matches = content.match(pattern);
	const output = matches?.map(match => match.startsWith('@') ? match.slice(1) : match);
	return new Set(output)
}

export function copyElToClipboard(el: string) {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	require('electron').clipboard.writeText(el)
	new Notice('Copied to clipboard')
}

export function removeNullReferences(references: IndexPaper[]) {
	const result = references.filter((element) => {
		if (element.paper.paperId !== null) {
			return true
		}
		return false
	})
	return result
}

// given a string of text, extract keywords from it excluding common words, punctuation, and numbers
export function extractKeywords(text: string) {
	const regex = new RegExp(`[${PUNCTUATION.join('')}]`, 'gmi')
	const keywords = text.replace(regex, ' ').replace(/\s\s+/g, ' ').split(' ')
	const result = keywords.filter((element) => {
		if (
			!COMMON_WORDS.includes(element) &&
			!PUNCTUATION.includes(element) &&
			!NUMBERS.includes(element)
		) {
			return true
		}
		return false
	})
	return result
}
export const makeMetaData = (paper: Reference): MetaData => {
	const paperTitle = paper.title?.trim().replace(/[^\x20-\x7E]/g, '') || 'Could not recover Title';
	const author = paper.authors?.[0]?.name?.trim() || 'Could not recover Author';
	const authors = paper.authors?.map(author => author.name).join(', ') || 'Could not recover Authors';
	const year = paper.year?.toString().trim() || 'Could not recover Year';
	const journal = paper.journal?.name?.trim() || 'Could not recover Journal';
	const volume = paper.journal?.volume?.trim() || 'Could not recover Volume';
	const pages = paper.journal?.pages?.trim() || 'Could not recover Pages';
	const abstract = paper.abstract?.trim() || 'No abstract available';
	const bibTex = paper.citationStyles?.bibtex || 'No BibTex available';
	const referenceCount = paper.referenceCount?.toString() || '0';
	const citationCount = paper.citationCount?.toString() || '0';
	const influentialCount = paper.influentialCitationCount?.toString() || '0';
	const openAccessPdfUrl = paper.isOpenAccess ? paper.openAccessPdf?.url || '' : '';
	const paperURL = paper.url || 'Could not recover URL';
	const doi = paper.externalIds?.DOI || 'Could not recover DOI';

	return {
		bibtex: bibTex,
		title: paperTitle,
		author,
		authors,
		year,
		journal,
		volume,
		pages,
		abstract,
		url: paperURL,
		pdfurl: openAccessPdfUrl,
		doi,
		referenceCount,
		citationCount,
		influentialCount,
	};
};

export const templateReplace = (template: string, data: MetaData, id = '') => {
	if (id === '') { id = data.doi ? data.doi : '' }
	return template
		.replaceAll('{{id}}', id)
		.replaceAll('{{bibtex}}', data.bibtex)
		.replaceAll('{{title}}', data.title.replace(/[:\\\\/]/g, ''))
		.replaceAll('{{author}}', data.author.replace(/[:\\\\/]/g, ''))
		.replaceAll('{{authors}}', data.authors.replace(/[:\\\\/]/g, ''))
		.replaceAll('{{year}}', data.year.replace(/[:\\\\/]/g, ''))
		.replaceAll('{{journal}}', data.journal.replace(/[:\\\\/]/g, ''))
		.replaceAll('{{volume}}', data.volume.replace(/[:\\\\/]/g, ''))
		.replaceAll('{{pages}}', data.pages.replace(/[:\\\\/]/g, ''))
		.replaceAll('{{abstract}}', data.abstract)
		.replaceAll('{{url}}', data.url)
		.replaceAll('{{pdfurl}}', data.pdfurl)
		.replaceAll('{{doi}}', data.doi)
}

export const setCiteKeyId = (paperId: string, citeLibrary: Library): string => {
	if (citeLibrary.adapter === 'csl-json') {
		const citeKey = citeLibrary.libraryData?.find(
			(item) =>
				item?.DOI?.toLowerCase() === paperId.toLowerCase() ||
				item?.DOI?.toLowerCase() ===
				`https://doi.org/${paperId.toLowerCase()}` ||
				item?.URL?.toLowerCase() ===
				paperId.replace('URL:', '').toLowerCase()
		)?.id
		return citeKey ? '@' + citeKey : paperId
	} else if (citeLibrary.adapter === 'bibtex') {
		const citeKey = citeLibrary.libraryData?.find(
			(item) =>
				item.fields?.doi?.[0]?.toLowerCase() ===
				paperId.toLowerCase() ||
				item.fields?.doi?.[0]?.toLowerCase() ===
				`https://doi.org/${paperId.toLowerCase()}` ||
				item.fields?.url?.[0]?.toLowerCase() ===
				paperId.replace('URL:', '').toLowerCase()
		)?.key
		return citeKey ? '@' + citeKey : paperId
	} else {
		return paperId
	}
}
export const getCiteKeyIds = (citeKeys: Set<string>, citeLibrary: Library | null | undefined) => {
	const citeKeysMap: CiteKey[] = []
	let index = 1; // Initialize index variable outside the loop
	if (citeKeys.size > 0) {
		// Get DOI from CiteKeyData corresponding to each item in citeKeys
		for (const citeKey of citeKeys) {
			let entry: citeKeyLibrary | undefined;
			if (citeLibrary?.adapter === 'csl-json') {
				entry = citeLibrary.libraryData?.find((item) => item.id === citeKey);
			} else if (citeLibrary?.adapter === 'bibtex') {
				entry = citeLibrary.libraryData?.find((item) => item.key === citeKey);
			}

			let paperId = '@' + citeKey;
			if (entry?.DOI) {
				paperId = sanitizeDOI(entry?.DOI).toLowerCase();
			} else if (VALID_S2AG_API_URLS.some((item) => entry?.URL?.includes(item))) {
				paperId = `URL:${entry?.URL}`;
			} else if (entry?.fields?.doi?.[0]) {
				paperId = sanitizeDOI(entry?.fields?.doi?.[0]).toLowerCase();
			} else if (VALID_S2AG_API_URLS.some((item) => entry?.fields?.url?.[0]?.includes(item))) {
				paperId = `URL:${entry?.fields?.url?.[0]}`;
			}

			citeKeysMap.push({
				citeKey: '@' + citeKey,
				location: index,
				paperId: paperId,
			});

			index++;
		}
	}
	return citeKeysMap;
}
// export const standardizeBibtex = (bibtex: string) => {
// 	const bibRegex = /(^@\[.*\]|@None)/gm
// 	// Get words from group one
// 	const matches = bibtex.matchAll(bibRegex)
// 	if (matches) {
// 		for (const match of matches) {
// 			const possibleTypes = match[1]
// 				.replace(/[@\\[\]'\s+]/g, '')
// 				.split(',')
// 			//check if any of the possible types are in the BIBTEX_STANDARD_TYPES
// 			// if so return one type else type is 'misc'
// 			let type =
// 				possibleTypes.find((item) =>
// 					BIBTEX_STANDARD_TYPES.includes(item.toLowerCase())
// 				) || 'misc'
// 			if (type === 'JournalArticle') type = 'article'
// 			return bibtex.replace(match[1], `@${type.toLowerCase()}`)
// 		}
// 	}
// 	return ''
// }

export const dataSearch = (data: Reference[], query: string) => {
	return data.filter((item: Reference) =>
		SEARCH_PARAMETERS.some((parameter) => {
			if (parameter === 'authors') {
				return item.authors.some((author) =>
					author.name?.toLowerCase().includes(query.toLowerCase())
				)
			} else {
				return item[parameter as keyof typeof item]
					?.toString()
					.toLowerCase()
					.includes(query.toLowerCase())
			}
		})
	)
}

export const dataSort = (
	data: Reference[],
	sortProperty: string,
	sortOrder: string
) => {
	return data.sort((a, b) => {
		const left = a[sortProperty as keyof typeof a]
		const right = b[sortProperty as keyof typeof b]
		if (sortOrder === 'asc') {
			if (left === undefined) return 1
			if (right === undefined) return -1
			return left > right ? 1 : -1
		} else {
			if (left === undefined) return -1
			if (right === undefined) return 1
			return left < right ? 1 : -1
		}
	})
}

export const indexSearch = (data: IndexPaper[], query: string) => {
	return data.filter((item: IndexPaper) =>
		SEARCH_PARAMETERS.some((parameter) => {
			if (parameter === 'authors') {
				return item.paper.authors.some((author) =>
					author.name?.toLowerCase().includes(query.toLowerCase())
				)
			} else {
				return item.paper[parameter as keyof typeof item.paper]
					?.toString()
					.toLowerCase()
					.includes(query.toLowerCase())
			}
		})
	)
}

export const indexSort = (
	data: IndexPaper[],
	sortProperty: string,
	sortOrder: string
) => {
	return data.sort((a, b) => {
		const left = a.paper[sortProperty as keyof typeof a.paper];
		const right = b.paper[sortProperty as keyof typeof b.paper];
		if (sortOrder === 'asc') {
			if (left === undefined) return 1;
			if (right === undefined) return -1;
			return left > right ? 1 : -1;
		} else {
			if (left === undefined) return -1;
			if (right === undefined) return 1;
			return left < right ? 1 : -1;
		}
	});
};

export async function useTemplaterPluginInFile(app: App, file: TFile) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const templater = (app as any).plugins.plugins['templater-obsidian'];
	if (templater && !templater?.settings['trigger_on_file_creation']) {
		await templater.templater.overwrite_file_commands(file);
	}
}

export class CursorJumper {
	constructor(private app: App) { }

	async jumpToNextCursorLocation(): Promise<void> {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!activeView) {
			return;
		}
		if (!activeView.file) {
			return;
		}
		const content = await this.app.vault.cachedRead(activeView.file);
		const indexOffset = content.length + 1;
		const editor = activeView.editor;
		editor.focus();
		editor.setCursor(indexOffset, 0);
	}
}

export function makeFileName(metaData: MetaData, fileNameFormat?: string) {
	let output;
	if (fileNameFormat) {
		output = templateReplace(fileNameFormat, metaData);
	} else {
		output = metaData.title;
	}
	return replaceIllegalFileNameCharactersInString(output) + '.md';
}

export function replaceIllegalFileNameCharactersInString(text: string) {
	return text.replace(/[\\,#%&{}/*<>$":@?.]/g, '').replace(/\s+/g, ' ');
}

// Following functions are copied from 
// https://github.com/mgmeyers/obsidian-pandoc-reference-list/blob/main/src/bib/helpers.ts
// with some modifications

export class PromiseCapability<T> {
	settled = false;
	promise: Promise<T>;
	resolve: (data: T) => void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	reject: (reason?: any) => void;

	constructor() {
		this.promise = new Promise((resolve, reject) => {
			this.resolve = (data) => {
				resolve(data);
				this.settled = true;
			};

			this.reject = (reason) => {
				reject(reason);
				this.settled = true;
			};
		});
	}
}

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
	const p = download(`http://127.0.0.1:${port}/better-bibtex/cayw?probe=true`);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const res: any = await Promise.race([
		p,
		new Promise((res) => {
			getGlobal().setTimeout(() => {
				res(null);
				p.destroy();
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

	const bib = await download(
		`http://127.0.0.1:${port}/better-bibtex/export/library?/${groupId}/library.json`
	);

	const str = bib.toString();

	fs.writeFileSync(cached, str);

	return applyGroupID(JSON.parse(str) as CSLList, groupId);
}


export async function getZUserGroups(
	port: string = DEFAULT_ZOTERO_PORT
): Promise<Array<{ id: number; name: string }>> {
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


export class UpdateChecker {
	citeKeys: Set<string>;
	citeKeyMap: CiteKey[]
	indexIds: Set<string>;
	library: Library | null | undefined;
	fileMetadataCache: CachedMetadata | null;
	fileCache = '';
	frontmatter = '';
	fileName = '';
	basename = '';

	constructor() {
		this.citeKeys = new Set<string>();
		this.citeKeyMap = []
		this.indexIds = new Set<string>();
		this.frontmatter = '';
		this.fileName = '';
		this.basename = '';
	}

	setCache = (fileCache: string, fileMetadataCache: CachedMetadata | null) => {
		this.fileCache = fileCache
		this.fileMetadataCache = fileMetadataCache
	}

	checkCiteKeysUpdate = (prefix = '@', checkOrder = false) => {
	// checkOrder is used to force update (usually for reference map view order correction)
		if (this.library === null) return false;
		const newCiteKeys = getCiteKeys(this.library?.libraryData, this.fileCache, prefix)
		if (!checkOrder) {
			if (areSetsEqual(newCiteKeys, this.citeKeys)) {
				return false;
			} 
		}
		this.citeKeys = newCiteKeys;
		this.citeKeyMap = getCiteKeyIds(this.citeKeys, this.library)
		return true;
	}

	checkIndexIdsUpdate = () => {
		const newIds = getPaperIds(this.fileCache)
		if (areSetsEqual(newIds, this.indexIds)) return false;
		this.indexIds = newIds;
		return true;
	}

	checkFrontmatterUpdate = (key = '') => {
		if (!this.fileMetadataCache?.frontmatter) return false;
		const keywords = this.fileMetadataCache?.frontmatter?.[key];
		if (keywords) this.frontmatter = extractKeywords(keywords).unique().join("+");
		return true;
	}

	checkFileNameUpdate = () => {
		if (!this.basename) return false;
		if (!EXCLUDE_FILE_NAMES.some((name) => this.basename.toLowerCase() === name.toLowerCase())) {
			this.fileName = extractKeywords(this.basename).unique().join('+')
			return true;
		}
		return false;
	}
}