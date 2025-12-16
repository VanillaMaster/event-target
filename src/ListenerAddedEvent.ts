import { Event, type EventOptions } from "./Event.js";

export interface ListenerAddedEventOptions extends EventOptions {
    listenerType: string | symbol;
    newLength: number;
}

export class ListenerAddedEvent extends Event {
    constructor(type: string | symbol, options: ListenerAddedEventOptions) {
        super(type, options);

        this.listenerType = options.listenerType;
        this.newLength = options.newLength;
    }

    readonly listenerType: string | symbol;
    readonly newLength: number;
}