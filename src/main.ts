import { Plugin, WorkspaceLeaf } from 'obsidian';
import { ReferenceMapSettingTab } from './settings';
import { ReferenceMapSettings } from './types';
import { addIcons } from './ui/icons';
import { ReferenceMapView, REFERENCE_MAP_VIEW_TYPE } from './reactView';
import { DEFAULT_SETTINGS } from './constants';

enum Direction {
	Left = 'left',
	Right = 'right',
}

export default class ReferenceMap extends Plugin {
	settings: ReferenceMapSettings;
	library: { active: boolean, adapter: string };

	async onload() {
		await this.loadSettings();
		addIcons();

		this.addSettingTab(new ReferenceMapSettingTab(this));

		this.registerView(
			REFERENCE_MAP_VIEW_TYPE,
			(leaf: WorkspaceLeaf) => new ReferenceMapView(leaf, this)
		);

		this.addCommand({
			id: 'show-reference-map-sidebar-view',
			name: 'Show View',
			callback: () => {
				this.ensureLeafExists(true);
			},
		});

		this.app.workspace.onLayoutReady(() => {
			this.ensureLeafExists(false);
		});

		this.addCommand({
			id: 'refresh-reference-map-sidebar-view',
			name: 'Refresh View',
			callback: () => {
				this.refresh();
			}
		});

		this.addRibbonIcon(
			'ReferenceMapIconScroll',
			'Reference Map',
			async (evt: MouseEvent) => {
				this.ensureLeafExists(true);
				// this.activateView()
			});
	}


	onunload() {
		// TODO: in the production version unload the view
		// this.app.workspace
		// 	.getLeavesOfType(REFERENCE_MAP_VIEW_TYPE)
		// 	.forEach((leaf) => leaf.detach());
	}

	ensureLeafExists(active = false): void {
		const { workspace } = this.app;

		const preferredSidebar = Direction.Right;

		let leaf: WorkspaceLeaf;
		const existingPluginLeaves = workspace.getLeavesOfType(REFERENCE_MAP_VIEW_TYPE);

		if (existingPluginLeaves.length > 0) {
			leaf = existingPluginLeaves[0];
		}
		else {
			leaf = preferredSidebar as Direction === Direction.Left ? workspace.getLeftLeaf(false) : workspace.getRightLeaf(false);
			workspace.revealLeaf(leaf);
			leaf.setViewState({ type: REFERENCE_MAP_VIEW_TYPE });
		}

		if (active) {
			workspace.setActiveLeaf(leaf);
		}
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

	//refresh view on settings change 
	refresh = () => {
		this.activateView()
	}
}