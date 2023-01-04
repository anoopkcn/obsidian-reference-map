import { App, PluginSettingTab, Setting } from "obsidian";
import ReferenceMap from "./main";
import { t } from "./lang/helpers";
import { fragWithHTML } from "./utils";
// import { camelToNormalCase, fragWithHTML } from "./utils";
// import { SORTING_METADATA } from "./constants";

export class ReferenceMapSettingTab extends PluginSettingTab {
    plugin: ReferenceMap;

    constructor(app: App, plugin: ReferenceMap) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl, plugin } = this;
        const { settings } = plugin;

        containerEl.empty();

        containerEl.createEl('h2', { text: 'General Settings' });
        // containerEl.createEl('p', { text: 'Changing the settings will refresh the Reference Map.' });

        new Setting(containerEl)
            .setName(t('HIDE_SHOW_INFLUENTIAL_COUNT'))
            .setDesc(fragWithHTML(t('HIDE_SHOW_INFLUENTIAL_COUNT_DESC')))
            .addToggle(toggle => toggle
                .setValue(settings.influentialCount)
                .onChange(async (value) => {
                    settings.influentialCount = value;
                    await plugin.saveSettings();
                    plugin.refresh();
                }));

        new Setting(containerEl)
            .setName(t('HIDE_SHOW_BUTTONS_ON_HOVER'))
            .setDesc(fragWithHTML(t('HIDE_SHOW_BUTTONS_ON_HOVER_DESC')))
            .addToggle(toggle => toggle
                .setValue(settings.hideButtonsOnHover)
                .onChange(async (value) => {
                    settings.hideButtonsOnHover = value;
                    await plugin.saveSettings();
                    plugin.refresh();
                }));
        // containerEl.createEl('h2', { text: 'Sorting Settings' });
        // containerEl.createEl('p', { text: 'Sort Reference Map based on a metadata value' });

        // new Setting(containerEl)
        //     .setName(t('ENABLE_SORTING'))
        //     .setDesc(fragWithHTML(t('ENABLE_SORTING_DESC')))
        //     .addToggle(toggle => toggle
        //         .setValue(settings.enableSorting)
        //         .onChange(async (value) => {
        //             settings.enableSorting = value;
        //             await plugin.saveSettings();
        //             this.display();
        //             plugin.refresh();
        //         }));

        // if (settings.enableSorting) {
        //     new Setting(containerEl)
        //         .setName(t('SORTING_METADATA'))
        //         .setDesc(fragWithHTML(t('SORTING_METADATA_DESC')))
        //         .addDropdown(dropdown => dropdown
        //             .addOption(SORTING_METADATA[0], camelToNormalCase(SORTING_METADATA[0]))
        //             .addOption(SORTING_METADATA[1], camelToNormalCase(SORTING_METADATA[1]))
        //             .addOption(SORTING_METADATA[2], camelToNormalCase(SORTING_METADATA[2]))
        //             .addOption(SORTING_METADATA[3], camelToNormalCase(SORTING_METADATA[3]))
        //             .setValue(settings.sortingMetadata)
        //             .onChange(async (value) => {
        //                 settings.sortingMetadata = value;
        //                 await plugin.saveSettings();
        //                 plugin.refresh();
        //             }));

        //     new Setting(containerEl)
        //         .setName(t('SORTING_ORDER'))
        //         .setDesc(fragWithHTML(t('SORTING_ORDER_DESC')))
        //         .addDropdown(dropdown => dropdown
        //             .addOption('asc', 'Ascending')
        //             .addOption('desc', 'Descending')
        //             .setValue(settings.sortingOrder)
        //             .onChange(async (value) => {
        //                 settings.sortingOrder = value;
        //                 await plugin.saveSettings();
        //                 plugin.refresh();
        //             }));
        // }

        containerEl.createEl('h2', { text: 'Metadata for copy' });
        // containerEl.createEl('p', { text: 'Select metadata values to add to the 📎 button for copying to clipboard' });
        new Setting(containerEl)
            .setName(t('COPY_TITLE'))
            .setDesc(fragWithHTML(t('COPY_TITLE_DESC')))
            .addToggle(toggle => toggle
                .setValue(settings.copyTitle)
                .onChange(async (value) => {
                    settings.copyTitle = value;
                    await plugin.saveSettings();
                    plugin.refresh();
                }));
        new Setting(containerEl)
            .setName(t('COPY_PAPER_DOI'))
            .setDesc(fragWithHTML(t('COPY_PAPER_DOI_DESC')))
            .addToggle(toggle => toggle
                .setValue(settings.copyPaperDOI)
                .onChange(async (value) => {
                    settings.copyPaperDOI = value;
                    await plugin.saveSettings();
                    plugin.refresh();
                }
                ));
        new Setting(containerEl)
            .setName(t('COPY_AUTHORS'))
            .setDesc(fragWithHTML(t('COPY_AUTHORS_DESC')))
            .addToggle(toggle => toggle
                .setValue(settings.copyAuthors)
                .onChange(async (value) => {
                    settings.copyAuthors = value;
                    await plugin.saveSettings();
                    plugin.refresh();
                }
                ));
        new Setting(containerEl)
            .setName(t('COPY_YEAR'))
            .setDesc(fragWithHTML(t('COPY_YEAR_DESC')))
            .addToggle(toggle => toggle
                .setValue(settings.copyYear)
                .onChange(async (value) => {
                    settings.copyYear = value;
                    await plugin.saveSettings();
                    plugin.refresh();
                }
                ));
        new Setting(containerEl)
            .setName(t('COPY_ABSTRACT'))
            .setDesc(fragWithHTML(t('COPY_ABSTRACT_DESC')))
            .addToggle(toggle => toggle
                .setValue(settings.copyAbstract)
                .onChange(async (value) => {
                    settings.copyAbstract = value;
                    await plugin.saveSettings();
                    plugin.refresh();
                }
                ));
        new Setting(containerEl)
            .setName(t('COPY_URL'))
            .setDesc(fragWithHTML(t('COPY_URL_DESC')))
            .addToggle(toggle => toggle
                .setValue(settings.copyUrl)
                .onChange(async (value) => {
                    settings.copyUrl = value;
                    await plugin.saveSettings();
                    plugin.refresh();
                }
                ));
        new Setting(containerEl)
            .setName(t('COPY_OPEN_ACCESS_PDF'))
            .setDesc(fragWithHTML(t('COPY_OPEN_ACCESS_PDF_DESC')))
            .addToggle(toggle => toggle
                .setValue(settings.copyOpenAccessPdf)
                .onChange(async (value) => {
                    settings.copyOpenAccessPdf = value;
                    await plugin.saveSettings();
                    plugin.refresh();
                }
                ));
    }
}