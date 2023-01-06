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

        containerEl.createEl('h2', { text: 'General Settings' });
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

        containerEl.createEl('h2', { text: 'Metadata for copy' });
        // containerEl.createEl('p', { text: 'Select metadata values to add to the 📎 button for copying to clipboard' });
        new Setting(containerEl)
            .setName(t('COPY_TITLE'))
            .setDesc(fragWithHTML(t('COPY_TITLE_DESC')))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.copyTitle)
                .onChange(async (value) => {
                    this.plugin.settings.copyTitle = value;
                    this.plugin.saveSettings();
                }));
        new Setting(containerEl)
            .setName(t('COPY_PAPER_DOI'))
            .setDesc(fragWithHTML(t('COPY_PAPER_DOI_DESC')))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.copyPaperDOI)
                .onChange(async (value) => {
                    this.plugin.settings.copyPaperDOI = value;
                    this.plugin.saveSettings();
                }
                ));
        new Setting(containerEl)
            .setName(t('COPY_AUTHORS'))
            .setDesc(fragWithHTML(t('COPY_AUTHORS_DESC')))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.copyAuthors)
                .onChange(async (value) => {
                    this.plugin.settings.copyAuthors = value;
                    this.plugin.saveSettings();
                }
                ));
        new Setting(containerEl)
            .setName(t('COPY_YEAR'))
            .setDesc(fragWithHTML(t('COPY_YEAR_DESC')))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.copyYear)
                .onChange(async (value) => {
                    this.plugin.settings.copyYear = value;
                    this.plugin.saveSettings();
                }
                ));
        new Setting(containerEl)
            .setName(t('COPY_ABSTRACT'))
            .setDesc(fragWithHTML(t('COPY_ABSTRACT_DESC')))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.copyAbstract)
                .onChange(async (value) => {
                    this.plugin.settings.copyAbstract = value;
                    this.plugin.saveSettings();
                }
                ));
        new Setting(containerEl)
            .setName(t('COPY_URL'))
            .setDesc(fragWithHTML(t('COPY_URL_DESC')))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.copyUrl)
                .onChange(async (value) => {
                    this.plugin.settings.copyUrl = value;
                    this.plugin.saveSettings();
                }
                ));
        new Setting(containerEl)
            .setName(t('COPY_OPEN_ACCESS_PDF'))
            .setDesc(fragWithHTML(t('COPY_OPEN_ACCESS_PDF_DESC')))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.copyOpenAccessPdf)
                .onChange(async (value) => {
                    this.plugin.settings.copyOpenAccessPdf = value;
                    this.plugin.saveSettings();
                }
                ));
    }
}