import { Plugin } from 'obsidian';
import { ReferenceMapSettingTab } from './settings';
import { ReferenceMapSettings } from './types';
import { SampleModal } from './modal';
// import { getPaperMetadata } from './referencemap';
// import { getPaperIds } from './utils';
import { ExampleView, VIEW_TYPE_EXAMPLE } from './view';

const DEFAULT_SETTINGS: ReferenceMapSettings = {
	mySetting: 'default'
}

export default class ReferenceMap extends Plugin {
	settings: ReferenceMapSettings;

	async onload() {
		await this.loadSettings();
		this.registerView(
			VIEW_TYPE_EXAMPLE,
			(leaf) => new ExampleView(leaf)
		);

		const ribbonIconEl = this.addRibbonIcon('dice', 'Reference Map', async (evt: MouseEvent) => {
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
			this.activateView();
		});

		ribbonIconEl.addClass('my-plugin-ribbon-class');

		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});

		this.addSettingTab(new ReferenceMapSettingTab(this.app, this));
	}

	onunload() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_EXAMPLE);
	}

	async activateView() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_EXAMPLE);

		await this.app.workspace.getRightLeaf(false).setViewState({
			type: VIEW_TYPE_EXAMPLE,
			active: true,
		});

		this.app.workspace.revealLeaf(
			this.app.workspace.getLeavesOfType(VIEW_TYPE_EXAMPLE)[0]
		);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}