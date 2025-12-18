import { Event, type EventOptions } from "#internal/Event.js";

export interface ListenersChangeEventOptions extends EventOptions {
    listenerType: string | symbol;
    newLength: number;
}

export class ListenersChangeEvent extends Event {
    constructor(type: string | symbol, options: ListenersChangeEventOptions) {
        super(type, options);

        this.listenerType = options.listenerType;
        this.newLength = options.newLength;
    }

    readonly listenerType: string | symbol;
    readonly newLength: number;
}