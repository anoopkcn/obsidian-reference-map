import { ItemView, WorkspaceLeaf } from "obsidian";
import ReferenceMap from "./main";

export const REFERENCE_MAP_VIEW_TYPE = "example-view";

export class ReferenceMapView extends ItemView {
    constructor(leaf: WorkspaceLeaf, plugin: ReferenceMap) {
        super(leaf);
    }

    getViewType() {
        return REFERENCE_MAP_VIEW_TYPE;
    }

    getDisplayText() {
        return "Example view";
    }
    getIcon() {
        return 'ReferenceMapIcon';
    }

    async onOpen() {
        const container = this.containerEl.children[1];
        container.empty();
        container.createEl("span", { text: "Example view" });
    }

    async onClose() {
        // Nothing to clean up.
    }
}