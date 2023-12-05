import React from 'react'
import { addIcon } from 'obsidian'
import { BsSearch } from 'react-icons/bs';
import { SiOpenaccess } from 'react-icons/si';
import { LuClipboard, LuClipboardCopy, LuClipboardList, LuCopy } from 'react-icons/lu';

const IconSize = 16; // Set the size you want for your icons

export const SearchIcon = () => <BsSearch size={IconSize} />
export const OpenAccessIcon = () => <SiOpenaccess size={IconSize} />
export const CopyIconOne = () => <LuClipboard size={IconSize} />
export const CopyIconTwo = () => <LuClipboardCopy size={IconSize} />
export const CopyIconThree = () => <LuClipboardList size={IconSize} />
export const CopyIcon = () => <LuCopy size={IconSize} />


export function addIcons(): void {
	const width = 96
	const height = 96
	addIcon(
		'ReferenceMapIconScroll',
		`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17v2a2 2 0 0 1-2 2v0a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v3h3"></path><path d="M22 17v2a2 2 0 0 1-2 2H8"></path><path d="M19 17V5a2 2 0 0 0-2-2H4"></path><path d="M22 17H10"></path></svg>`
	)
	addIcon(
		"ReferenceMapGraphIcon",
		`<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="graph-icon" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><line x1="6" x2="6" y1="3" y2="15"></line><circle cx="18" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><path d="M18 9a9 9 0 0 1-9 9"></path></svg>
		`
	)

}