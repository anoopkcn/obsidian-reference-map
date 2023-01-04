import { Plugin, WorkspaceLeaf } from 'obsidian';
import { ReferenceMapSettingTab } from './settings';
import { ReferenceMapSettings } from './types';
import { addIcons } from './ui/icons';
import { ReferenceMapView, REFERENCE_MAP_VIEW_TYPE } from './reactView';
import { DEFAULT_SETTINGS } from './constants';

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
			id: 'show-reference-map-sidebar-view',
			name: 'Open view',
			checkCallback: (checking: boolean) => {
				if (checking) {
					return this.view === null;
				}
				this.activateView();
			},
		});
		const ribbonIconEl = this.addRibbonIcon('ReferenceMapIconScroll', 'Reference Map', async (evt: MouseEvent) => {
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

	//refresh view on setting schange 
	refresh = () => {
		this.activateView()
	}
}