import { MarkdownView, Plugin, WorkspaceLeaf } from 'obsidian'
import { ReferenceMapSettingTab } from './settings'
import { MetaData, ReferenceMapSettings, SemanticPaper } from './types'
import { addIcons } from './ui/icons'
import { ReferenceMapView, REFERENCE_MAP_VIEW_TYPE } from './reactView'
import { DEFAULT_SETTINGS, METADATA_COPY_TEMPLATE_ONE } from './constants'
import { ReferenceSearchModal, ReferenceSuggestModal } from './modals'
import { templateReplace } from './utils'

enum Direction {
	Left = 'left',
	Right = 'right',
}

export default class ReferenceMap extends Plugin {
	settings: ReferenceMapSettings

	async onload() {
		this.loadSettings().then(() => this.init())
	}

	async init(): Promise<void> {
		addIcons()

		this.addSettingTab(new ReferenceMapSettingTab(this))

		this.registerView(
			REFERENCE_MAP_VIEW_TYPE,
			(leaf: WorkspaceLeaf) => new ReferenceMapView(leaf, this)
		)

		this.addCommand({
			id: 'show-reference-map-sidebar-view',
			name: 'Show View',
			callback: () => {
				this.ensureLeafExists(true)
			},
		})
		this.addCommand({
			id: 'reload-reference-map-library',
			name: 'Refresh View',
			callback: () => {
				if (this.view) {
					this.view.reload('soft')
				}
			},
		})

		this.addCommand({
			id: 'open-reference-map-search-modal-to-insert',
			name: 'Search and Insert',
			callback: () => this.insertMetadata(),
		});

		this.app.workspace.onLayoutReady(() => {
			this.ensureLeafExists(false)
		})

		this.addRibbonIcon(
			'ReferenceMapIconScroll',
			'Reference Map',
			async (evt: MouseEvent) => {
				this.ensureLeafExists(true)
			}
		)
	}

	onunload() {
		// TODO: in the production version unload the view
		// this.app.workspace
		// 	.getLeavesOfType(REFERENCE_MAP_VIEW_TYPE)
		// 	.forEach((leaf) => leaf.detach());
	}

	ensureLeafExists(active = false): void {
		const { workspace } = this.app

		const preferredSidebar = Direction.Right

		let leaf: WorkspaceLeaf
		const existingPluginLeaves = workspace.getLeavesOfType(
			REFERENCE_MAP_VIEW_TYPE
		)

		if (existingPluginLeaves.length > 0) {
			leaf = existingPluginLeaves[0]
		} else {
			leaf =
				(preferredSidebar as Direction) === Direction.Left
					? workspace.getLeftLeaf(false)
					: workspace.getRightLeaf(false)
			workspace.revealLeaf(leaf)
			leaf.setViewState({ type: REFERENCE_MAP_VIEW_TYPE })
		}

		if (active) {
			workspace.setActiveLeaf(leaf)
		}
	}

	// Create the reference map
	async activateView() {
		this.app.workspace.detachLeavesOfType(REFERENCE_MAP_VIEW_TYPE)

		await this.app.workspace.getRightLeaf(false).setViewState({
			type: REFERENCE_MAP_VIEW_TYPE,
			active: false,
		})

		this.app.workspace.revealLeaf(
			this.app.workspace.getLeavesOfType(REFERENCE_MAP_VIEW_TYPE)[0]
		)
	}

	// Get the reference map view
	get view() {
		const leaves = app.workspace.getLeavesOfType(REFERENCE_MAP_VIEW_TYPE)
		if (!leaves?.length) return null
		return leaves[0].view as ReferenceMapView
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		)
	}

	async saveSettings() {
		await this.saveData(this.settings)
	}

	async insertMetadata(): Promise<void> {
		try {
			const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (!markdownView) {
				if (this.settings.debugMode) console.warn('Can not find an active markdown view');
				return;
			}

			// TODO: Try using a search query on the selected text
			const reference = await this.searchReferenceMetadata();

			if (!markdownView.editor) {
				if (this.settings.debugMode) console.warn('Can not find editor from the active markdown view');
				return;
			}

			const renderedContents = await this.getRenderedContents(reference);
			markdownView.editor.replaceRange(renderedContents, markdownView.editor.getCursor());
		} catch (err) {
			if (this.settings.debugMode) console.warn(err);
		}
	}

	async searchReferenceMetadata(query?: string): Promise<MetaData> {
		const searchedBooks = await this.openReferenceSearchModal(query);
		return await this.openReferenceSuggestModal(searchedBooks);
	}

	async openReferenceSearchModal(query = ''): Promise<SemanticPaper[]> {
		return new Promise((resolve, reject) => {
			return new ReferenceSearchModal(this, query, (error, results: SemanticPaper[]) => {
				return error ? reject(error) : resolve(results);
			}).open();
		});
	}
	async openReferenceSuggestModal(references: SemanticPaper[]): Promise<MetaData> {
		return new Promise((resolve, reject) => {
			return new ReferenceSuggestModal(this.app, references, (error, selectedReference: MetaData) => {
				return error ? reject(error) : resolve(selectedReference);
			}).open();
		});
	}

	async getRenderedContents(metaData: MetaData): Promise<string> {
		return templateReplace(METADATA_COPY_TEMPLATE_ONE, metaData)
	}

}
