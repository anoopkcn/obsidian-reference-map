import React from 'react';
import { App, debounce } from 'obsidian';
import { createRoot } from 'react-dom/client'
import { FileSystemAdapter, PluginSettingTab, Setting } from 'obsidian'
import { RELOAD } from '../types'
import ReferenceMap from '../main'
import { t } from '../lang/helpers'
import { ZoteroPullSetting } from './ZoteroPullSettings'
import { fragWithHTML, resolvePath } from '../utils/functions'
import { ButtonSettings } from './ButtonSettings';
import { CSLListSuggest, CSLLocaleSuggest, FolderSuggest } from './list-suggest';

export class ReferenceMapSettingTab extends PluginSettingTab {
	plugin: ReferenceMap

	citationPathLoadingEl: HTMLElement
	citationPathErrorEl: HTMLElement
	citationPathSuccessEl: HTMLElement

	constructor(app: App, plugin: ReferenceMap) {
		super(app, plugin)
		this.plugin = plugin

		this.citationPathLoadingEl = document.createElement('div');
		this.citationPathErrorEl = document.createElement('div');
		this.citationPathSuccessEl = document.createElement('div');
	}

	async checkCitationExportPath(filePath: string): Promise<boolean> {
		this.citationPathLoadingEl.addClass('d-none')
		if (filePath.endsWith('.json') || filePath.endsWith('.bib')) {
			try {
				await FileSystemAdapter.readLocalFile(resolvePath(filePath, this.app))
				this.citationPathErrorEl.addClass('d-none')
			} catch (e) {
				this.citationPathSuccessEl.addClass('d-none')
				this.citationPathErrorEl.removeClass('d-none')
				return false
			}
		} else {
			this.citationPathSuccessEl.addClass('d-none')
			this.citationPathErrorEl.removeClass('d-none')
			return false
		}
		return true
	}

	showCitationExportPathSuccess(): void {
		if (!this.plugin.view?.referenceMapData.library.active) return

		this.citationPathSuccessEl.setText(
			`Successfully Loaded Library Containing References.`
		)
		this.citationPathSuccessEl.removeClass('d-none')
	}

	display(): void {
		const { containerEl } = this
		containerEl.empty()

		containerEl.createEl('h2', { text: t('GENERAL_SETTINGS') })

		new Setting(containerEl)
			.setName(t('HIDE_SHOW_ABSTRACT'))
			// .setDesc(fragWithHTML(t('HIDE_SHOW_ABSTRACT_DESC')))
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.showAbstract)
					.onChange(async (value) => {
						this.plugin.settings.showAbstract = value
						this.plugin.saveSettings().then(() => {
							if (this.plugin.view)
								this.plugin.referenceMapData.reload(RELOAD.VIEW)
						})
						this.display()
					})
			)
		let truncateLength: HTMLDivElement
		if (this.plugin.settings.showAbstract) {
			new Setting(containerEl)
				.setName(t('ABSTRACT_TRUNCATE_LENGTH'))
				.setDesc(fragWithHTML(t('ABSTRACT_TRUNCATE_LENGTH_DESC')))
				.addSlider((slider) =>
					slider
						.setLimits(0, 1000, 20)
						.setValue(this.plugin.settings.abstractTruncateLength)
						.onChange(async (value) => {
							truncateLength.innerText = ` ${value.toString()}`
							this.plugin.settings.abstractTruncateLength = value
							this.plugin.saveSettings().then(() => {
								if (this.plugin.view)
									this.plugin.referenceMapData.reload(RELOAD.VIEW)
							})
						})
				)
				.settingEl.createDiv('', (el) => {
					truncateLength = el
					el.style.minWidth = '2.3em'
					el.style.textAlign = 'right'
					el.innerText = ` ${this.plugin.settings.abstractTruncateLength.toString()}`
				})

		}
		new Setting(containerEl)
			.setName(t('HIDE_SHOW_AUTHORS'))
			// .setDesc(fragWithHTML(t('HIDE_SHOW_AUTHORS_DESC')))
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.showAuthors)
					.onChange(async (value) => {
						this.plugin.settings.showAuthors = value
						this.plugin.saveSettings().then(() => {
							if (this.plugin.view)
								this.plugin.referenceMapData.reload(RELOAD.VIEW)
						})
					})
			)

		new Setting(containerEl)
			.setName(t('HIDE_SHOW_JOURNAL'))
			// .setDesc(fragWithHTML(t('HIDE_SHOW_JOURNAL_DESC')))
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.showJournal)
					.onChange(async (value) => {
						this.plugin.settings.showJournal = value
						this.plugin.saveSettings().then(() => {
							if (this.plugin.view)
								this.plugin.referenceMapData.reload(RELOAD.VIEW)
						})
					})
			)

		new Setting(containerEl)
			.setName(t('HIDE_SHOW_INFLUENTIAL_COUNT'))
			// .setDesc(fragWithHTML(t('HIDE_SHOW_INFLUENTIAL_COUNT_DESC')))
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.influentialCount)
					.onChange(async (value) => {
						this.plugin.settings.influentialCount = value
						this.plugin.saveSettings().then(() => {
							if (this.plugin.view)
								this.plugin.referenceMapData.reload(RELOAD.VIEW)
						})
					})
			)

		new Setting(containerEl)
			.setName(t('HIDE_SHOW_BUTTONS_ON_HOVER'))
			// .setDesc(fragWithHTML(t('HIDE_SHOW_BUTTONS_ON_HOVER_DESC')))
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.hideButtonsOnHover)
					.onChange(async (value) => {
						this.plugin.settings.hideButtonsOnHover = value
						this.plugin.saveSettings().then(() => {
							if (this.plugin.view)
								this.plugin.referenceMapData.reload(RELOAD.VIEW)
						})
					})
			)

		new Setting(containerEl)
			.setName(t('LOOKUP_ENTRIES_LINKED_FILES'))
			// .setDesc(fragWithHTML(t('LOOKUP_ENTRIES_LINKED_FILES_DESC')))
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.lookupLinkedFiles)
					.onChange(async (value) => {
						this.plugin.settings.lookupLinkedFiles = value
						this.plugin.saveSettings().then(() => {
							if (this.plugin.view)
								this.plugin.referenceMapData.reload(RELOAD.SOFT)
						})
					})
			)

		new Setting(containerEl)
			.setName(t('ENABLE_SORTING_INDEX_CARDS'))
			// .setDesc(fragWithHTML(t('ENABLE_SORTING_INDEX_CARDS_DESC')))
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.enableIndexSorting)
					.onChange(async (value) => {
						this.plugin.settings.enableIndexSorting = value
						this.plugin.saveSettings().then(() => {
							if (this.plugin.view)
								this.plugin.referenceMapData.reload(RELOAD.VIEW)
						})
						this.display()
					})
			)

		if (this.plugin.settings.enableIndexSorting) {
			new Setting(containerEl)
				.setName(t('SORT_BY'))
				// .setDesc(fragWithHTML(t('SORT_BY_DESC')))
				.addDropdown((dropdown) =>
					dropdown
						.addOption('year', t('SORT_BY_YEAR'))
						.addOption('citationCount', t('SORT_BY_CITATION_COUNT'))
						.addOption(
							'referenceCount',
							t('SORT_BY_REFERENCE_COUNT')
						)
						.addOption(
							'influentialCitationCount',
							t('SORT_BY_INFLUENTIAL_CITATION_COUNT')
						)
						.setValue(this.plugin.settings.sortByIndex)
						.onChange(async (value) => {
							this.plugin.settings.sortByIndex = value
							this.plugin.saveSettings().then(() => {
								if (this.plugin.view)
									this.plugin.referenceMapData.reload(RELOAD.VIEW)
							})
						})
				)
			new Setting(containerEl)
				.setName(t('SORT_ORDER'))
				// .setDesc(fragWithHTML(t('SORT_ORDER_DESC')))
				.addDropdown((dropdown) =>
					dropdown
						.addOption('desc', t('SORT_ORDER_DESC'))
						.addOption('asc', t('SORT_ORDER_ASC'))
						.setValue(this.plugin.settings.sortOrderIndex)
						.onChange(async (value) => {
							this.plugin.settings.sortOrderIndex = value
							this.plugin.saveSettings().then(() => {
								if (this.plugin.view)
									this.plugin.referenceMapData.reload(RELOAD.VIEW)
							})
						})
				)
		}

		new Setting(containerEl)
			.setName(t('ENABLE_SORTING_REFERENCE_CARDS'))
			// .setDesc(fragWithHTML(t('ENABLE_SORTING_REFERENCE_CARDS_DESC')))
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.enableReferenceSorting)
					.onChange(async (value) => {
						this.plugin.settings.enableReferenceSorting = value
						this.plugin.saveSettings().then(() => {
							if (this.plugin.view)
								this.plugin.referenceMapData.reload(RELOAD.VIEW)
						})
						this.display()
					})
			)

		if (this.plugin.settings.enableReferenceSorting) {
			new Setting(containerEl)
				.setName(t('SORT_BY'))
				// .setDesc(fragWithHTML(t('SORT_BY_DESC')))
				.addDropdown((dropdown) =>
					dropdown
						.addOption('year', t('SORT_BY_YEAR'))
						.addOption('citationCount', t('SORT_BY_CITATION_COUNT'))
						.addOption(
							'referenceCount',
							t('SORT_BY_REFERENCE_COUNT')
						)
						.addOption(
							'influentialCitationCount',
							t('SORT_BY_INFLUENTIAL_CITATION_COUNT')
						)
						.setValue(this.plugin.settings.sortByReference)
						.onChange(async (value) => {
							this.plugin.settings.sortByReference = value
							this.plugin.saveSettings().then(() => {
								if (this.plugin.view)
									this.plugin.referenceMapData.reload(RELOAD.VIEW)
							})
						})
				)
			new Setting(containerEl)
				.setName(t('SORT_ORDER'))
				// .setDesc(fragWithHTML(t('SORT_ORDER_DESC')))
				.addDropdown((dropdown) =>
					dropdown
						.addOption('desc', t('SORT_ORDER_DESC'))
						.addOption('asc', t('SORT_ORDER_ASC'))
						.setValue(this.plugin.settings.sortOrderReference)
						.onChange(async (value) => {
							this.plugin.settings.sortOrderReference = value
							this.plugin.saveSettings().then(() => {
								if (this.plugin.view)
									this.plugin.referenceMapData.reload(RELOAD.VIEW)
							})
						})
				)
		}

		new Setting(this.containerEl)
			.setName("Citation style ")
			.addSearch((cb) => {
				new CSLListSuggest(this.app, cb.inputEl);
				cb.setPlaceholder("CSL Style: style-name")
					.setValue(this.plugin.settings.cslStyle)
					.onChange(
						debounce((style) => {
						this.plugin.settings.cslStyle = style;
						this.plugin.saveSettings().then(() => {
							if (this.plugin.view) {
								this.plugin.referenceMapData.loadCache()
								this.plugin.referenceMapData.reload(RELOAD.VIEW)
							}
						})
						}, 300)
					);
				// @ts-ignore
				cb.containerEl.addClass("orm-csl-search");
			});

		new Setting(this.containerEl)
			.setName("Citation language")
			.addSearch((cb) => {
				new CSLLocaleSuggest(this.app, cb.inputEl);
				cb.setPlaceholder("CSL Style Locale: locale-name")
					.setValue(this.plugin.settings.cslLocale)
					.onChange(
						debounce((style) => {
						this.plugin.settings.cslLocale = style;
						this.plugin.saveSettings().then(() => {
							if (this.plugin.view) {
								this.plugin.referenceMapData.loadCache()
								this.plugin.referenceMapData.reload(RELOAD.VIEW)
							}
						})
						}, 300)
					);
				// @ts-ignore
				cb.containerEl.addClass("orm-csl-search");
			});

		containerEl.createEl('h2', { text: 'Static List Settings' })
		new Setting(containerEl)
			.setName(fragWithHTML(t('SEARCH_CITEKEY')))
			.setDesc(fragWithHTML(t('SEARCH_CITEKEY_DESC')))
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.searchCiteKey)
					.onChange(async (value) => {
						this.plugin.settings.searchCiteKey = value
						this.plugin.saveSettings().then(() => {
							if (this.plugin.view)
								this.plugin.referenceMapData.reload(RELOAD.HARD)
						})
						this.display()
					})
			)

		if (this.plugin.settings.searchCiteKey) {
			new Setting(containerEl)
				.setName(fragWithHTML(t('SEARCH_CITEKEY_PATH')))
				.setDesc(fragWithHTML(t('SEARCH_CITEKEY_PATH_DESC')))
				.addText((text) => {
					text.setValue(
						this.plugin.settings.searchCiteKeyPath
					).onChange(async (value) => {
						this.checkCitationExportPath(value).then((success) => {
							if (success) {
								this.showCitationExportPathSuccess()
								this.plugin.settings.searchCiteKeyPath = value
								this.plugin.saveSettings().then(() => {
									if (this.plugin.view)
										this.plugin.referenceMapData.reload(RELOAD.SOFT)
								})
							}
						})
					})
				})


			this.citationPathLoadingEl = containerEl.createEl('p', {
				cls: 'orm-PathLoading d-none',
				text: 'Loading citation database...',
			})
			this.citationPathErrorEl = containerEl.createEl('p', {
				cls: 'orm-PathError d-none',
				text: fragWithHTML(t('CITEKEY_PATH_ERROR')),
			})
			this.citationPathSuccessEl = containerEl.createEl('p', {
				cls: 'orm-PathSuccess d-none',
				text: 'Successfully Loaded Library Containing References.',
			})

			new Setting(containerEl)
				.setName(fragWithHTML(t('AUTO_DETECT_UPDATE_TO_CITEKEY')))
				.setDesc(fragWithHTML(t('AUTO_DETECT_UPDATE_TO_CITEKEY_DESC')))
				.addToggle((toggle) =>
					toggle
						.setValue(
							this.plugin.settings
								.autoUpdateCitekeyFile
						)
						.onChange(async (value) => {
							this.plugin.settings.autoUpdateCitekeyFile =
								value
							this.plugin.saveSettings().then(() => {
								if (this.plugin.view)
									this.plugin.referenceMapData.reload(RELOAD.SOFT)
							})
						})
				)


			containerEl.createDiv('setting-item orm-setting-item-wrapper', (el) => {
				createRoot(el).render(
					<ZoteroPullSetting plugin={this.plugin} />,
				);
			})

			new Setting(containerEl)
				.setName(t('CITEKEY_ZOTERO_LINK'))
				.setDesc(fragWithHTML(t('CITEKEY_ZOTERO_LINK_DESC')))
				.addToggle((toggle) =>
					toggle
						.setValue(this.plugin.settings.linkCiteKey)
						.onChange(async (value) => {
							this.plugin.settings.linkCiteKey = value
							this.plugin.saveSettings().then(() => {
								if (this.plugin.view)
									this.plugin.referenceMapData.reload(RELOAD.VIEW)
							})
						})
				)
			new Setting(containerEl)
				.setName(t('FIND_ZOTERO_CITEKEY_FROM_ID'))
				.setDesc(fragWithHTML(t('FIND_ZOTERO_CITEKEY_FROM_ID_DESC')))
				.addToggle((toggle) =>
					toggle
						.setValue(this.plugin.settings.findZoteroCiteKeyFromID)
						.onChange(async (value) => {
							this.plugin.settings.findZoteroCiteKeyFromID = value
							this.plugin.saveSettings().then(() => {
								if (this.plugin.view)
									this.plugin.referenceMapData.reload(RELOAD.VIEW)
							})
						})
				)
			new Setting(containerEl)
				.setName(fragWithHTML(t('FIND_CITEKEY_WITHOUT_PREFIX')))
				.setDesc(fragWithHTML(t('FIND_CITEKEY_WITHOUT_PREFIX_DESC')))
				.addToggle((toggle) =>
					toggle
						.setValue(
							this.plugin.settings
								.findCiteKeyFromLinksWithoutPrefix
						)
						.onChange(async (value) => {
							this.plugin.settings.findCiteKeyFromLinksWithoutPrefix =
								value
							this.plugin.saveSettings().then(() => {
								if (this.plugin.view)
									this.plugin.referenceMapData.reload(RELOAD.VIEW)
							})
						})
				)
		}


		containerEl.createEl('h2', { text: 'Buttons Settings' })

		containerEl.createDiv('setting-item orm-setting-item-wrapper', (el) => {
			createRoot(el).render(
				<ButtonSettings plugin={this.plugin} />,
			);
		})

		containerEl.createEl('h2', { text: 'Search Settings' })
		let zoomText: HTMLDivElement
		new Setting(containerEl)
			.setName(fragWithHTML(t('MODAL_SEARCH_LIMIT')))
			.setDesc(fragWithHTML(t('MODAL_SEARCH_LIMIT_DESC')))
			.addSlider((slider) =>
				slider
					.setLimits(1, 100, 1)
					.setValue(this.plugin.settings.modalSearchLimit)
					.onChange(async (value) => {
						zoomText.innerText = ` ${value.toString()}`
						this.plugin.settings.modalSearchLimit = value
						this.plugin.saveSettings().then(() => {
							if (this.plugin.view)
								this.plugin.referenceMapData.reload(RELOAD.VIEW)
						})
					})
			)
			.settingEl.createDiv('', (el) => {
				zoomText = el
				el.style.minWidth = '2.3em'
				el.style.textAlign = 'right'
				el.innerText = ` ${this.plugin.settings.modalSearchLimit.toString()}`
			})

		new Setting(containerEl)
			.setName(fragWithHTML(t('MODAL_SEARCH_CREATE_FOLDER')))
			.setDesc(fragWithHTML(t('MODAL_SEARCH_CREATE_FOLDER_DESC')))
			.addSearch((cb) => {
				new FolderSuggest(this.app, cb.inputEl);
				cb.setPlaceholder("Folder Name: folder/subfolder")
					.setValue(this.plugin.settings.folder)
					.onChange((folder) => {
						this.plugin.settings.folder = folder;
						this.plugin.saveSettings()
					});
				// @ts-ignore
				cb.containerEl.addClass("orm-csl-search");
			});

		new Setting(containerEl)
			.setName(fragWithHTML(t('MODAL_SEARCH_CREATE_FILE_FORMAT')))
			.setDesc(fragWithHTML(t('MODAL_SEARCH_CREATE_FILE_FORMAT_DESC')))
			.addText((text) =>
				text
					.setValue(this.plugin.settings.fileNameFormat)
					.onChange(async (value) => {
						this.plugin.settings.fileNameFormat = value
						this.plugin.saveSettings()
					})
			)
		new Setting(containerEl)
			.setName(fragWithHTML(t('MODAL_SEARCH_CREATE_FILE_TEMPLATE')))
			.setDesc(fragWithHTML(t('MODAL_SEARCH_CREATE_FILE_TEMPLATE_DESC')))
			.addTextArea((text) => {
				text.inputEl.rows = 7
				text
					.setValue(this.plugin.settings.modalCreateTemplate)
					.onChange(async (value) => {
						this.plugin.settings.modalCreateTemplate = value
						this.plugin.saveSettings()
					})
			}
			)

		new Setting(containerEl)
			.setName(fragWithHTML(t('MODAL_SEARCH_INSERT_TEMPLATE')))
			.setDesc(fragWithHTML(t('MODAL_SEARCH_INSERT_TEMPLATE_DESC')))
			.addTextArea((text) => {
				text.inputEl.rows = 7
				text
					.setValue(this.plugin.settings.modalInsertTemplate)
					.onChange(async (value) => {
						this.plugin.settings.modalInsertTemplate = value
						this.plugin.saveSettings()
					})
			})

		containerEl.createEl('h2', { text: 'Misc' })

		new Setting(containerEl)
			.setName(t('REMOVE_DUPLICATE_IDS'))
			.setDesc(fragWithHTML(t('REMOVE_DUPLICATE_IDS_DESC')))
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.removeDuplicateIds)
					.onChange(async (value) => {
						this.plugin.settings.removeDuplicateIds = value
						this.plugin.saveSettings().then(() => {
							if (this.plugin.view)
								this.plugin.referenceMapData.reload(RELOAD.SOFT)
						})
					})
			)

		new Setting(containerEl)
			.setName(t('HIDE_SHOW_REDUNDANT_REFERENCES'))
			.setDesc(fragWithHTML(t('HIDE_SHOW_REDUNDANT_REFERENCES_DESC')))
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.filterRedundantReferences)
					.onChange(async (value) => {
						this.plugin.settings.filterRedundantReferences = value
						this.plugin.saveSettings().then(() => {
							if (this.plugin.view)
								this.plugin.referenceMapData.reload(RELOAD.SOFT)
						})
					})
			)

		new Setting(containerEl)
			.setName(t('SEARCH_TITLE'))
			.setDesc(fragWithHTML(t('SEARCH_TITLE_DESC')))
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.searchTitle)
					.onChange(async (value) => {
						this.plugin.settings.searchTitle = value
						this.plugin.saveSettings().then(() => {
							if (this.plugin.view)
								this.plugin.referenceMapData.reload(RELOAD.VIEW)
						})
						this.display()
					})
			)

		let zoomText2: HTMLDivElement
		if (this.plugin.settings.searchTitle) {
			new Setting(containerEl)
				.setName(t('SEARCH_LIMIT'))
				.setDesc(fragWithHTML(t('SEARCH_LIMIT_DESC')))
				.addSlider((slider) =>
					slider
						.setLimits(1, 10, 1)
						.setValue(this.plugin.settings.searchLimit)
						.onChange(async (value) => {
							zoomText2.innerText = ` ${value.toString()}`
							this.plugin.settings.searchLimit = value
							this.plugin.saveSettings().then(() => {
								if (this.plugin.view)
									this.plugin.referenceMapData.reload(RELOAD.VIEW)
							})
						})
				)
				.settingEl.createDiv('', (el) => {
					zoomText2 = el
					el.style.minWidth = '2.3em'
					el.style.textAlign = 'right'
					el.innerText = ` ${this.plugin.settings.searchLimit.toString()}`
				})
		}

		new Setting(containerEl)
			.setName(t('SEARCH_FRONT_MATTER'))
			.setDesc(fragWithHTML(t('SEARCH_FRONT_MATTER_DESC')))
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.searchFrontMatter)
					.onChange(async (value) => {
						this.plugin.settings.searchFrontMatter = value
						this.plugin.saveSettings().then(() => {
							if (this.plugin.view)
								this.plugin.referenceMapData.reload(RELOAD.VIEW)
						})
						this.display()
					})
			)

		let zoomText3: HTMLDivElement
		if (this.plugin.settings.searchFrontMatter) {
			new Setting(containerEl)
				.setName(t('SEARCH_FRONT_MATTER_KEY'))
				.setDesc(fragWithHTML(t('SEARCH_FRONT_MATTER_KEY_DESC')))
				.addText((text) =>
					text
						.setValue(this.plugin.settings.searchFrontMatterKey)
						.onChange(async (value) => {
							this.plugin.settings.searchFrontMatterKey = value
							this.plugin.saveSettings().then(() => {
								if (this.plugin.view)
									this.plugin.referenceMapData.reload(RELOAD.VIEW)
							})
						})
				)
			new Setting(containerEl)
				.setName(t('SEARCH_FRONT_MATTER_LIMIT'))
				.setDesc(fragWithHTML(t('SEARCH_FRONT_MATTER_LIMIT_DESC')))
				.addSlider((slider) =>
					slider
						.setLimits(1, 10, 1)
						.setValue(this.plugin.settings.searchFrontMatterLimit)
						.onChange(async (value) => {
							zoomText3.innerText = ` ${value.toString()}`
							this.plugin.settings.searchFrontMatterLimit = value
							this.plugin.saveSettings().then(() => {
								if (this.plugin.view)
									this.plugin.referenceMapData.reload(RELOAD.VIEW)
							})
						})
				)
				.settingEl.createDiv('', (el) => {
					zoomText3 = el
					el.style.minWidth = '2.3em'
					el.style.textAlign = 'right'
					el.innerText = ` ${this.plugin.settings.searchFrontMatterLimit.toString()}`
				})
		}

		new Setting(containerEl)
			.setName(fragWithHTML(t('DEBUG_MODE')))
			.setDesc(fragWithHTML(t('DEBUG_MODE_DESC')))
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.debugMode)
					.onChange(async (value) => {
						this.plugin.settings.debugMode = value
						this.plugin.saveSettings().then(() => {
							if (this.plugin.view)
								this.plugin.referenceMapData.reload(RELOAD.HARD)
						})
					})
			)
		containerEl.createEl('hr')
		containerEl.createEl('h2', { text: t('SEE_DOCUMENTATION') })
		containerEl.createEl('p', {
			text: fragWithHTML(t('SEE_DOCUMENTATION_DESC')),
		})
	}
}
