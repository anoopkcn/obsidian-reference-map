import { FileSystemAdapter, Notice, TFile } from 'obsidian'
import path from 'path'
import { CardSpecType, IndexPaper, MetaData, Reference } from 'src/types'
import { templateReplace } from './postprocess';
import { CanvasData, CanvasNodeData } from 'obsidian/canvas';

export const getLinkedFiles = (file: TFile) => {
	if (file) {
		const links = app.metadataCache.getFileCache(file)?.links
		// IF this links exist in the vault as markdown files then get the file path
		if (links) {
			return links.map((link) => app.metadataCache.getFirstLinkpathDest(link.link, ''))
		}
	}
	return []
}

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


export async function getCanvasContent(fileCache: string) {
	let content = '';
	const canvasJson: CanvasData = JSON.parse(fileCache);
	const nodes = canvasJson?.nodes as CanvasNodeData[];
	if (nodes) {
		for (const node of nodes) {
			switch (node.type as CardSpecType) {
				case 'text': {
					content += node?.text ? node?.text : '';
					break;
				}
				case 'link': {
					content += node?.url ? node?.url : '';
					break;
				}
				case 'file': {
					if (node.file) {
						try {
							const file = this.app.vault.getAbstractFileByPath(node.file);
							if (file instanceof TFile) {
								const temContent = await app.vault.read(file);
								content += temContent;
							} else {
								content += node?.file ? node?.file : '';
							}
						} catch (err) {
							content += '';
						}
					}
					break;
				}
			}
		}
		fileCache += content;
	}
	return fileCache;
}