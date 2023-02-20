import { MarkdownView, Notice, Plugin, WorkspaceLeaf } from 'obsidian'
import { ReferenceMapSettingTab } from './settings'
import { MetaData, ReferenceMapSettings, SemanticPaper } from './types'
import { addIcons } from './ui/icons'
import { ReferenceMapView, REFERENCE_MAP_VIEW_TYPE } from './reactView'
import { DEFAULT_SETTINGS, METADATA_MODAL_CREATE_TEMPLATE, METADATA_MODAL_INSERT_TEMPLATE } from './constants'
import { ReferenceSearchModal, ReferenceSuggestModal } from './modals'
import { CursorJumper, makeFileName, templateReplace, useTemplaterPluginInFile } from './utils'

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

		this.addCommand({
			id: 'open-reference-map-search-modal-to-create',
			name: 'Search and Create',
			callback: () => this.createNewReferenceNote(),
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

	async createNewReferenceNote(): Promise<void> {
		try {
			const metaData = await this.searchReferenceMetadata();

			// open file
			const activeLeaf = this.app.workspace.getLeaf();
			if (!activeLeaf) {
				if (this.settings.debugMode) console.warn('No active leaf');
				new Notice('No active leaf');
				return;
			}

			const renderedContents = await this.getRenderedContentsForCreate(metaData);

			// TODO: If the same file exists, it asks if you want to overwrite it.
			// create new File
			const fileName = makeFileName(metaData, this.settings.fileNameFormat);
			const filePath = `${this.settings.folder}/${fileName}`;
			const targetFile = await this.app.vault.create(filePath, renderedContents);

			// if use Templater plugin
			await useTemplaterPluginInFile(this.app, targetFile);

			// open file
			await activeLeaf.openFile(targetFile, { state: { mode: 'source' } });
			activeLeaf.setEphemeralState({ rename: 'all' });

			// cursor focus
			await new CursorJumper(this.app).jumpToNextCursorLocation();
		} catch (err) {
			if (this.settings.debugMode) console.warn(err);
			new Notice('Sorry, something went wrong.');
		}
	}


	async insertMetadata(): Promise<void> {
		try {
			const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (!markdownView) {
				if (this.settings.debugMode) console.warn('Can not find an active markdown view');
				new Notice('No active markdown view');
				return;
			}
			let selection = '';
			if (markdownView.getMode() === 'source') {
				selection = markdownView.editor.getSelection().trim()
			}
			const reference = await this.searchReferenceMetadata(selection);

			if (!markdownView.editor) {
				if (this.settings.debugMode) console.warn('Can not find editor from the active markdown view');
				return;
			}

			const renderedContents = await this.getRenderedContentsForInsert(reference);
			markdownView.editor.replaceRange(renderedContents, markdownView.editor.getCursor());
		} catch (err) {
			if (this.settings.debugMode) console.warn(err);
			new Notice('Sorry, something went wrong.');
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

	async getRenderedContentsForInsert(metaData: MetaData): Promise<string> {
		const template = this.settings.modalInsertTemplate
			? this.settings.modalInsertTemplate
			: METADATA_MODAL_INSERT_TEMPLATE
		return templateReplace(template, metaData)
	}

	async getRenderedContentsForCreate(metaData: MetaData): Promise<string> {
		const template = this.settings.modalCreateTemplate
			? this.settings.modalCreateTemplate
			: METADATA_MODAL_CREATE_TEMPLATE
		return templateReplace(template, metaData)
	}

}
