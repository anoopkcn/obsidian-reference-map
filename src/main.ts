import { Plugin, WorkspaceLeaf } from 'obsidian';
import { ReferenceMapSettingTab } from './settings';
import { ReferenceMapSettings } from './types';
import { addIcons } from './ui/icons';
// import { getPaperMetadata } from './referencemap';
// import { getPaperIds } from './utils';
import { ReferenceMapView, REFERENCE_MAP_VIEW_TYPE } from './view';

const DEFAULT_SETTINGS: ReferenceMapSettings = {
	mySetting: 'default'
}

export default class ReferenceMap extends Plugin {
	settings: ReferenceMapSettings;

	async onload() {
		await this.loadSettings();
		addIcons();
		this.registerView(
			REFERENCE_MAP_VIEW_TYPE,
			(leaf: WorkspaceLeaf) => new ReferenceMapView(leaf, this)
		);

		this.addCommand({
			id: 'show-reference-map-view',
			name: 'Reference Map: Open view',
			checkCallback: (checking: boolean) => {
				if (checking) {
					return this.view === null;
				}
				this.activateView();
			},
		});
		const ribbonIconEl = this.addRibbonIcon('ReferenceMapIcon', 'Reference Map', async (evt: MouseEvent) => {
			// Function to fetch data from an API and return the data as a JSON object
			// const doi = `10.1017/9781108955652.006`;
			// const paper = await getPaperMetadata(doi);
			// const references = await getPaperMetadata(doi, 'references');
			// const citations = await getPaperMetadata(doi, 'citations');
			// console.log(paper[0]);
			// console.log(references[3]);
			// console.log(citations[0]);
			// parsing the DOI from the active file
			// const activeView = app.workspace.getActiveViewOfType(MarkdownView);
			// if (activeView) {
			// 	const fileContent = await app.vault.cachedRead(activeView.file);
			// 	const tags = getPaperIds(fileContent)
			// 	console.log(tags)
			// }
			this.activateView()
		});

		ribbonIconEl.addClass('reference-map-ribbon-class');

		this.addSettingTab(new ReferenceMapSettingTab(this.app, this));
	}


	onunload() {
		// TODO: in the production version unload the view
		// this.app.workspace
		// 	.getLeavesOfType(REFERENCE_MAP_VIEW_TYPE)
		// 	.forEach((leaf) => leaf.detach());
	}

	// Create the reference map 
	async activateView() {
		this.app.workspace.detachLeavesOfType(REFERENCE_MAP_VIEW_TYPE);

		await this.app.workspace.getRightLeaf(false).setViewState({
			type: REFERENCE_MAP_VIEW_TYPE,
			active: true,
		});

		this.app.workspace.revealLeaf(
			this.app.workspace.getLeavesOfType(REFERENCE_MAP_VIEW_TYPE)[0]
		);
	}

	// Get the reference map view
	get view() {
		const leaves = app.workspace.getLeavesOfType(REFERENCE_MAP_VIEW_TYPE);
		if (!leaves?.length) return null;
		return leaves[0].view as ReferenceMapView;
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}