import { App, PluginSettingTab, Setting } from "obsidian";
import ReferenceMap from "./main";
import { t } from "./lang/helpers";
import { fragWithHTML } from "./utils";

export class ReferenceMapSettingTab extends PluginSettingTab {
    plugin: ReferenceMap;

    constructor(app: App, plugin: ReferenceMap) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        containerEl.createEl('h2', { text: 'General Settings' });

        new Setting(containerEl)
            .setName(t('HIDE_SHOW_INFLUENTIAL_COUNT'))
            .setDesc(fragWithHTML(t('HIDE_SHOW_INFLUENTIAL_COUNT_DESC')))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.influentialCount)
                .onChange(async (value) => {
                    this.plugin.settings.influentialCount = value;
                    await this.plugin.saveSettings();
                    this.plugin.refresh();
                }));

        new Setting(containerEl)
            .setName(t('HIDE_SHOW_BUTTONS_ON_HOVER'))
            .setDesc(fragWithHTML(t('HIDE_SHOW_BUTTONS_ON_HOVER_DESC')))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.hideButtonsOnHover)
                .onChange(async (value) => {
                    this.plugin.settings.hideButtonsOnHover = value;
                    await this.plugin.saveSettings();
                    this.plugin.refresh();
                }));
    }
}