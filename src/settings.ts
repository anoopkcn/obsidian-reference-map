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
                .setValue(this.plugin.settings.showAbstract)
                .onChange(async (value) => {
                    this.plugin.settings.showAbstract = value;
                    this.plugin.saveSettings();
                }));
        new Setting(containerEl)
            .setName(t('HIDE_SHOW_AUTHORS'))
            .setDesc(fragWithHTML(t('HIDE_SHOW_AUTHORS_DESC')))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.showAuthors)
                .onChange(async (value) => {
                    this.plugin.settings.showAuthors = value;
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
            .setName(fragWithHTML(t('SEARCH_CITEKEY')))
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
                .setName(fragWithHTML(t('SEARCH_CITEKEY_PATH')))
                .setDesc(fragWithHTML(t('SEARCH_CITEKEY_PATH_DESC')))
                .addText(text => text
                    .setValue(this.plugin.settings.searchCiteKeyPath)
                    .onChange(async (value) => {
                        this.plugin.settings.searchCiteKeyPath = value;
                        this.plugin.saveSettings();
                    }
                    ));
            new Setting(containerEl)
                .setName(t('CITEKEY_ZOTERO_LINK'))
                .setDesc(fragWithHTML(t('CITEKEY_ZOTERO_LINK_DESC')))
                .addToggle(toggle => toggle
                    .setValue(this.plugin.settings.linkCiteKey)
                    .onChange(async (value) => {
                        this.plugin.settings.linkCiteKey = value;
                        this.plugin.saveSettings();
                    }
                    ));
            new Setting(containerEl)
                .setName(t('FIND_ZOTERO_CITEKEY_FROM_ID'))
                .setDesc(fragWithHTML(t('FIND_ZOTERO_CITEKEY_FROM_ID_DESC')))
                .addToggle(toggle => toggle
                    .setValue(this.plugin.settings.findZoteroCiteKeyFromID)
                    .onChange(async (value) => {
                        this.plugin.settings.findZoteroCiteKeyFromID = value;
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
        new Setting(containerEl)
            .setName(t('STANDARDIZE_BIBTEX'))
            .setDesc(fragWithHTML(t('STANDARDIZE_BIBTEX_DESC')))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.standardizeBibtex)
                .onChange(async (value) => {
                    this.plugin.settings.standardizeBibtex = value;
                    this.plugin.saveSettings();
                }
                ));



        containerEl.createEl('h2', { text: 'Buttons Settings' });

        new Setting(containerEl)
            .setName(fragWithHTML(t('FORMAT_METADATA_COPY_ONE')))
            .setDesc(fragWithHTML(t('FORMAT_METADATA_COPY_ONE_DESC')))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.formatMetadataCopyOne)
                .onChange(async (value) => {
                    this.plugin.settings.formatMetadataCopyOne = value;
                    this.plugin.saveSettings();
                    this.display();
                }));

        if (this.plugin.settings.formatMetadataCopyOne) {
            new Setting(containerEl)
                .setName(fragWithHTML(t('METADATA_COPY_TEMPLATE_ONE')))
                .setDesc(fragWithHTML(t('METADATA_COPY_TEMPLATE_ONE_DESC')))
                .addTextArea(text => {
                    text
                        .setValue(this.plugin.settings.metadataCopyTemplateOne)
                        .onChange(async (value) => {
                            this.plugin.settings.metadataCopyTemplateOne = value;
                            this.plugin.saveSettings();
                        }
                        )
                });
            new Setting(containerEl)
                .setName(fragWithHTML(t('METADATA_COPY_ONE_BATCH')))
                .setDesc(fragWithHTML(t('METADATA_COPY_ONE_BATCH_DESC')))
                .addToggle(toggle => toggle
                    .setValue(this.plugin.settings.metadataCopyOneBatch)
                    .onChange(async (value) => {
                        this.plugin.settings.metadataCopyOneBatch = value;
                        this.plugin.saveSettings();
                    }
                    ));
        }

        new Setting(containerEl)
            .setName(fragWithHTML(t('FORMAT_METADATA_COPY_TWO')))
            .setDesc(fragWithHTML(t('FORMAT_METADATA_COPY_TWO_DESC')))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.formatMetadataCopyTwo)
                .onChange(async (value) => {
                    this.plugin.settings.formatMetadataCopyTwo = value;
                    this.plugin.saveSettings();
                    this.display();
                }
                ));

        if (this.plugin.settings.formatMetadataCopyTwo) {
            new Setting(containerEl)
                .setName(fragWithHTML(t('METADATA_COPY_TEMPLATE_TWO')))
                .setDesc(fragWithHTML(t('METADATA_COPY_TEMPLATE_ONE_DESC')))
                .addTextArea(text => {
                    text.inputEl.rows = 7;
                    text.setValue(this.plugin.settings.metadataCopyTemplateTwo)
                        .onChange(async (value) => {
                            this.plugin.settings.metadataCopyTemplateTwo = value;
                            this.plugin.saveSettings();
                        }
                        )
                });
            new Setting(containerEl)
                .setName(fragWithHTML(t('METADATA_COPY_TWO_BATCH')))
                .setDesc(fragWithHTML(t('METADATA_COPY_TWO_BATCH_DESC')))
                .addToggle(toggle => toggle
                    .setValue(this.plugin.settings.metadataCopyTwoBatch)
                    .onChange(async (value) => {
                        this.plugin.settings.metadataCopyTwoBatch = value;
                        this.plugin.saveSettings();
                    }
                    ));
        }


        new Setting(containerEl)
            .setName(fragWithHTML(t('FORMAT_METADATA_COPY_THREE')))
            .setDesc(fragWithHTML(t('FORMAT_METADATA_COPY_THREE_DESC')))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.formatMetadataCopyThree)
                .onChange(async (value) => {
                    this.plugin.settings.formatMetadataCopyThree = value;
                    this.plugin.saveSettings();
                    this.display();
                }
                ));

        if (this.plugin.settings.formatMetadataCopyThree) {
            new Setting(containerEl)
                .setName(fragWithHTML(t('METADATA_COPY_TEMPLATE_THREE')))
                .setDesc(fragWithHTML(t('METADATA_COPY_TEMPLATE_THREE_DESC')))
                .addTextArea(text => text
                    .setValue(this.plugin.settings.metadataCopyTemplateThree)
                    .onChange(async (value) => {
                        this.plugin.settings.metadataCopyTemplateThree = value;
                        this.plugin.saveSettings();
                    }
                    ));
            new Setting(containerEl)
                .setName(fragWithHTML(t('METADATA_COPY_THREE_BATCH')))
                .setDesc(fragWithHTML(t('METADATA_COPY_THREE_BATCH_DESC')))
                .addToggle(toggle => toggle
                    .setValue(this.plugin.settings.metadataCopyThreeBatch)
                    .onChange(async (value) => {
                        this.plugin.settings.metadataCopyThreeBatch = value;
                        this.plugin.saveSettings();
                    }
                    ));
        }

        containerEl.createEl('h2', { text: 'Debug Settings' });

        new Setting(containerEl)
            .setName(fragWithHTML(t('DEBUG_MODE')))
            .setDesc(fragWithHTML(t('DEBUG_MODE_DESC')))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.debugMode)
                .onChange(async (value) => {
                    this.plugin.settings.debugMode = value;
                    this.plugin.saveSettings();
                }
                ));


        containerEl.createEl('hr');
        containerEl.createEl('h2', { text: t('SEE_DOCUMENTATION') });
        containerEl.createEl('p', { text: fragWithHTML(t('SEE_DOCUMENTATION_DESC')) });

    }
}