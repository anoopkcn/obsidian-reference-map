import { Events } from "obsidian";

export const EVENTS = {
	SELECTION: 'orm-editor-selection',
	UPDATE: 'orm-index-update',
} as const

export type Reload = typeof EVENTS[keyof typeof EVENTS]

// Event bus for internal Plugin communication
class EventBus extends Events {
    constructor() {
        super();
    }
}

export default new EventBus();