import { addIcon } from 'obsidian';

export function addIcons(): void {
    const width = 96
    const height = 96
    addIcon(
        "ReferenceMapIcon",
        `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path><path d="M18 14h-8"></path><path d="M15 18h-5"></path><path d="M10 6h8v4h-8V6Z"></path></svg>`
    );
    addIcon(
        "ReferenceMapCopyIcon",
        `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"></path><path d="M16 4h2a2 2 0 0 1 2 2v4"></path><path d="M21 14H11"></path><path d="m15 10-4 4 4 4"></path></svg>`
    )
}