import path from 'path'
import { MarkdownView, Notice, Plugin, WorkspaceLeaf } from 'obsidian'
import { DIRECTION, Direction, MetaData, RELOAD, ReferenceMapSettings } from './types'
import { DEFAULT_SETTINGS, METADATA_MODAL_CREATE_TEMPLATE, METADATA_MODAL_INSERT_TEMPLATE } from './constants'
import { ReferenceMapSettingTab } from './settings/settings'
import { PromiseCapability } from './promise'
import { addIcons } from './icons'
import { SidebarView, REFERENCE_MAP_VIEW_TYPE } from './sidebar/SidebarView'
import { GraphView, REFERENCE_MAP_GRAPH_VIEW_TYPE } from './graph/GraphView';
import { getVaultRoot, makeFileName } from './utils/functions'
import { templateReplace } from './utils/postprocess'
import { ReferenceMapData } from './data/data'
import { UpdateChecker } from './data/updateChecker'
import { Reference } from './apis/s2agTypes'
import { ReferenceSearchModal } from './search/SearchModal'
import { ReferenceSuggestModal } from './search/SuggestModal'

export default class ReferenceMap extends Plugin {
	public settings: ReferenceMapSettings
	public cacheDir: string;
	public referenceMapData: ReferenceMapData;
	public updateChecker: UpdateChecker;
	public _initPromise: PromiseCapability<void>;

	get initPromise() {
		if (!this._initPromise) {
			return (this._initPromise = new PromiseCapability());
		}
		return this._initPromise;
	}

	async onload() {
		this.cacheDir = path.join(getVaultRoot(this.app), '.reference-map');
		this.referenceMapData = new ReferenceMapData(this)
		this.updateChecker = new UpdateChecker()
		this.loadSettings().then(() => {
			this.init()
			this.initPromise.promise
				.then(() => {
					this.referenceMapData.loadLibrary(true);
					this.referenceMapData.loadCache()
				})
				.finally(() => {
					this.updateChecker.library = this.referenceMapData.library;
					this.referenceMapData.initPromise.resolve()
				}
				);
			this.initPromise.resolve();
		})

	}

	async init(): Promise<void> {
		addIcons()

		this.addSettingTab(new ReferenceMapSettingTab(this.app, this))

		this.registerView(
			REFERENCE_MAP_VIEW_TYPE,
			(leaf: WorkspaceLeaf) => new SidebarView(leaf, this)
		)

		this.registerView(
			REFERENCE_MAP_GRAPH_VIEW_TYPE,
			(leaf: WorkspaceLeaf) => new GraphView(leaf, this)
		)

		this.addCommand({
			id: 'show-reference-map-sidebar-view',
			name: 'Show Sidebar View',
			callback: () => {
				this.ensureLeafExists(true)
			},
		})
		this.addCommand({
			id: 'reload-reference-map-library',
			name: 'Refresh View and Library',
			callback: () => {
				if (this.view) {
					this.referenceMapData.reload(RELOAD.HARD)
				}
			},
		})

		this.addCommand({
			id: 'open-reference-map-search-modal-to-insert',
			name: 'Search Online and Insert',
			callback: () => this.insertMetadata(),
		});

		this.addCommand({
			id: 'open-reference-map-search-modal-to-create',
			name: 'Search Online and Create',
			callback: () => this.createNewReferenceNote(),
		});

		this.addCommand({
			id: "open-reference-map-graph",
			name: "Open Literature Graph",
			callback: () => this.openReferenceMapGraph(false),
		});

		this.addCommand({
			id: "convert-selection-zotero-link",
			name: "Convert Selection to Zotero Link",
			callback: () => this.convertSelectionToZoteroLink(),
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
		this.app.workspace.detachLeavesOfType(REFERENCE_MAP_GRAPH_VIEW_TYPE);
	}

	ensureLeafExists(active = false): void {
		const { workspace } = this.app

		const preferredSidebar = DIRECTION.RIGHT

		let leaf: WorkspaceLeaf
		const existingPluginLeaves = workspace.getLeavesOfType(
			REFERENCE_MAP_VIEW_TYPE
		)

		if (existingPluginLeaves.length > 0) {
			leaf = existingPluginLeaves[0]
		} else {
			leaf =
				(preferredSidebar as Direction) === DIRECTION.LEFT
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
		const leaves = this.app.workspace.getLeavesOfType(REFERENCE_MAP_VIEW_TYPE)
		if (!leaves?.length) return null
		return leaves[0].view as SidebarView
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
			const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (!markdownView || markdownView.getMode() !== 'source') {
				new Notice('No active markdown view OR in Reading view');
				return;
			}
			const selection = markdownView.editor.getSelection().trim();
			const metaData = await this.searchReferenceMetadata(selection, 'create');
			const activeLeaf = this.app.workspace.getLeaf();
			if (!activeLeaf) {
				new Notice('No active leaf');
				return;
			}
			const renderedContents = await this.getRenderedContentsForCreate(metaData);
			const fileName = makeFileName(metaData, this.settings.fileNameFormat);
			let filePath;
			if (this.settings.folder) {
				filePath = `${this.settings.folder}/${fileName}`;
			} else {
				filePath = `${fileName}`;
			}
			const targetFile = await this.app.vault.create(filePath, renderedContents);
			await activeLeaf.openFile(targetFile, { state: { mode: 'source' } });
			// activeLeaf.setEphemeralState({ rename: 'all' });
			// await new CursorJumper(this.app).jumpToNextCursorLocation();
		} catch (err) {
			new Notice('Sorry, something went wrong.');
		}
	}

	async insertMetadata(): Promise<void> {
		try {
			const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (!markdownView || markdownView.getMode() !== 'source') {
				new Notice('No active markdown view OR in Reading view');
				return;
			}
			const selection = markdownView.editor.getSelection().trim();
			const reference = await this.searchReferenceMetadata(selection, 'insert');
			if (!markdownView.editor) {
				return;
			}
			const renderedContents = await this.getRenderedContentsForInsert(reference);
			markdownView.editor.replaceRange(renderedContents, markdownView.editor.getCursor());
		} catch (err) {
			new Notice('Sorry, something went wrong.');
		}
	}

	async searchReferenceMetadata(query?: string, mode?: string): Promise<MetaData> {
		const searchedReferences = await this.openReferenceSearchModal(query, mode);
		return await this.openReferenceSuggestModal(searchedReferences);
	}

	async openReferenceSearchModal(query = '', mode = 'insert'): Promise<Reference[]> {
		return new Promise((resolve, reject) => {
			new ReferenceSearchModal(this, query, mode, (error, results?: Reference[]) => {
				if (error) {
					reject(error);
				} else if (results) {
					resolve(results);
				} else {
					reject(new Error("No results returned"));
				}
			}).open();
		});
	}

	// Assuming the second problem is in a similar function
	async openReferenceSuggestModal(references: Reference[]): Promise<MetaData> {
		return new Promise((resolve, reject) => {
			new ReferenceSuggestModal(this.app, references, (error, selectedReference?: MetaData) => {
				if (error) {
					reject(error);
				} else if (selectedReference) {
					resolve(selectedReference);
				} else {
					reject(new Error("No reference selected"));
				}
			}).open();
		});
	}

	async getRenderedContentsForInsert(metaData: MetaData): Promise<string> {
		const template = this.settings.modalInsertTemplate || METADATA_MODAL_INSERT_TEMPLATE;
		return templateReplace(template, metaData);
	}

	async getRenderedContentsForCreate(metaData: MetaData): Promise<string> {
		const template = this.settings.modalCreateTemplate || METADATA_MODAL_CREATE_TEMPLATE;
		return templateReplace(template, metaData);
	}

	async openReferenceMapGraph(active = false) {
		const { workspace } = this.app;
		let leaf: WorkspaceLeaf;
		const existingPluginLeaves = workspace.getLeavesOfType(REFERENCE_MAP_GRAPH_VIEW_TYPE);
		if (existingPluginLeaves.length > 0) {
			leaf = existingPluginLeaves[0];
		} else {
			leaf = workspace.getLeaf('split', 'vertical');
			leaf.setViewState({ type: REFERENCE_MAP_GRAPH_VIEW_TYPE });
		}
		if (active) {
			workspace.revealLeaf(leaf);
		}
	}

	async convertSelectionToZoteroLink() {
		try {
			if (!this.settings.searchCiteKey) {
				new Notice('Please enable Get references using citeKey in the settings.');
				return;
			}
			const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (!markdownView || markdownView.getMode() !== 'source') {
				new Notice('No active markdown view OR in Reading view');
				return;
			}

			const selection = markdownView.editor.getSelection().trim();
			const from = markdownView.editor.getCursor("from");
			const to = markdownView.editor.getCursor("to");
			const citeKeys = Array.from(this.updateChecker.citeKeys);
			const foundCiteKey = citeKeys.find(key => selection.includes(key));
			if (foundCiteKey) {
				const renderedContents = `[${selection}](zotero://select/items/@${foundCiteKey})`;
				markdownView.editor.replaceRange(renderedContents, from, to);
				return;
			} else {
				new Notice('No citekey found in the selection.');
				return;
			}
		} catch (err) {
			new Notice('Sorry, something went wrong.');
		}

	}

}
