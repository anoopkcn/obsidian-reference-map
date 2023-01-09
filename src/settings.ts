import { PluginSettingTab, Setting } from "obsidian";
import ReferenceMap from "./main";
import { t } from "./lang/helpers";
import { fragWithHTML } from "./utils";

export class ReferenceMapSettingTab extends PluginSettingTab {
    plugin: ReferenceMap;

    constructor(plugin: ReferenceMap) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl('h2', { text: t('GENERAL_SETTINGS') });
        new Setting(containerEl)
            .setDesc(fragWithHTML(t('REFRESH_VIEW_DESC')))
            .addButton((button) => {
                button.setButtonText(t('REFRESH_VIEW'))
                    .setCta()
                    .onClick(() => {
                        this.plugin.saveSettings();
                        // Force refresh
                        this.plugin.refresh();
                        this.display();
                    });
            });

        new Setting(containerEl)
            .setName(t('HIDE_SHOW_ABSTRACT'))
            .setDesc(fragWithHTML(t('HIDE_SHOW_ABSTRACT_DESC')))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.showDetails)
                .onChange(async (value) => {
                    this.plugin.settings.showDetails = value;
                    this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName(t('HIDE_SHOW_INFLUENTIAL_COUNT'))
            .setDesc(fragWithHTML(t('HIDE_SHOW_INFLUENTIAL_COUNT_DESC')))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.influentialCount)
                .onChange(async (value) => {
                    this.plugin.settings.influentialCount = value;
                    this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName(t('HIDE_SHOW_BUTTONS_ON_HOVER'))
            .setDesc(fragWithHTML(t('HIDE_SHOW_BUTTONS_ON_HOVER_DESC')))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.hideButtonsOnHover)
                .onChange(async (value) => {
                    this.plugin.settings.hideButtonsOnHover = value;
                    this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName(t('SEARCH_TITLE'))
            .setDesc(fragWithHTML(t('SEARCH_TITLE_DESC')))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.searchTitle)
                .onChange(async (value) => {
                    this.plugin.settings.searchTitle = value;
                    this.plugin.saveSettings();
                    this.display();
                }));

        let zoomText: HTMLDivElement;
        if (this.plugin.settings.searchTitle) {
            new Setting(containerEl)
                .setName(t('SEARCH_LIMIT'))
                .setDesc(fragWithHTML(t('SEARCH_LIMIT_DESC')))
                .addSlider(slider => slider
                    .setLimits(1, 10, 1)
                    .setValue(this.plugin.settings.searchLimit)
                    .onChange(async (value) => {
                        zoomText.innerText = ` ${value.toString()}`;
                        this.plugin.settings.searchLimit = value;
                        this.plugin.saveSettings();
                    }))
                .settingEl.createDiv("", (el) => {
                    zoomText = el;
                    el.style.minWidth = "2.3em";
                    el.style.textAlign = "right";
                    el.innerText = ` ${this.plugin.settings.searchLimit.toString()}`;
                });
        }

        new Setting(containerEl)
            .setName(t('SEARCH_FRONT_MATTER'))
            .setDesc(fragWithHTML(t('SEARCH_FRONT_MATTER_DESC')))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.searchFrontMatter)
                .onChange(async (value) => {
                    this.plugin.settings.searchFrontMatter = value;
                    this.plugin.saveSettings();
                    this.display();
                }));

        let zoomText2: HTMLDivElement;
        if (this.plugin.settings.searchFrontMatter) {
            new Setting(containerEl)
                .setName(t('SEARCH_FRONT_MATTER_KEY'))
                .setDesc(fragWithHTML(t('SEARCH_FRONT_MATTER_KEY_DESC')))
                .addText(text => text
                    .setValue(this.plugin.settings.searchFrontMatterKey)
                    .onChange(async (value) => {
                        this.plugin.settings.searchFrontMatterKey = value;
                        this.plugin.saveSettings();
                    }));
            new Setting(containerEl)
                .setName(t('SEARCH_FRONT_MATTER_LIMIT'))
                .setDesc(fragWithHTML(t('SEARCH_FRONT_MATTER_LIMIT_DESC')))
                .addSlider(slider => slider
                    .setLimits(1, 10, 1)
                    .setValue(this.plugin.settings.searchFrontMatterLimit)
                    .onChange(async (value) => {
                        zoomText2.innerText = ` ${value.toString()}`;
                        this.plugin.settings.searchFrontMatterLimit = value;
                        this.plugin.saveSettings();
                    }
                    ))
                .settingEl.createDiv("", (el) => {
                    zoomText2 = el;
                    el.style.minWidth = "2.3em";
                    el.style.textAlign = "right";
                    el.innerText = ` ${this.plugin.settings.searchFrontMatterLimit.toString()}`;
                }
                );
        }

        new Setting(containerEl)
            .setName(t('SEARCH_CITEKEY'))
            .setDesc(fragWithHTML(t('SEARCH_CITEKEY_DESC')))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.searchCiteKey)
                .onChange(async (value) => {
                    this.plugin.settings.searchCiteKey = value;
                    this.plugin.saveSettings();
                    this.display();
                }));

        if (this.plugin.settings.searchCiteKey) {
            new Setting(containerEl)
                .setName(t('SEARCH_CITEKEY_PATH'))
                .setDesc(fragWithHTML(t('SEARCH_CITEKEY_PATH_DESC')))
                .addText(text => text
                    .setValue(this.plugin.settings.searchCiteKeyPath)
                    .onChange(async (value) => {
                        this.plugin.settings.searchCiteKeyPath = value;
                        this.plugin.saveSettings();
                    }
                    ));
        }


        new Setting(containerEl)
            .setName(t('ENABLE_SORTING'))
            .setDesc(fragWithHTML(t('ENABLE_SORTING_DESC')))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableSorting)
                .onChange(async (value) => {
                    this.plugin.settings.enableSorting = value;
                    this.plugin.saveSettings();
                    this.display();
                }));

        if (this.plugin.settings.enableSorting) {
            new Setting(containerEl)
                .setName(t('SORT_BY'))
                .setDesc(fragWithHTML(t('SORT_BY_DESC')))
                .addDropdown(dropdown => dropdown
                    .addOption('year', t('SORT_BY_YEAR'))
                    .addOption('citationCount', t('SORT_BY_CITATION_COUNT'))
                    .addOption('referenceCount', t('SORT_BY_REFERENCE_COUNT'))
                    .addOption('influentialCitationCount', t('SORT_BY_INFLUENTIAL_CITATION_COUNT'))
                    .setValue(this.plugin.settings.sortBy)
                    .onChange(async (value) => {
                        this.plugin.settings.sortBy = value;
                        this.plugin.saveSettings();
                    }));
            new Setting(containerEl)
                .setName(t('SORT_ORDER'))
                .setDesc(fragWithHTML(t('SORT_ORDER_DESC')))
                .addDropdown(dropdown => dropdown
                    .addOption('desc', t('SORT_ORDER_DESCE'))
                    .addOption('asc', t('SORT_ORDER_ASC'))
                    .setValue(this.plugin.settings.sortOrder)
                    .onChange(async (value) => {
                        this.plugin.settings.sortOrder = value;
                        this.plugin.saveSettings();
                    }
                    ));
        }

        containerEl.createEl('hr');
        containerEl.createEl('h2', { text: t('SEE_DOCUMENTATION') });
        containerEl.createEl('p', { text: fragWithHTML(t('SEE_DOCUMENTATION_DESC')) });

    }
}