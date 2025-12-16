import { EventTarget, type Listener, type AddEventListenerOptions } from "./EventTarget.js"
import type { Event } from "./Event.js";

export class AbortSignal extends EventTarget {
    constructor(aborted: boolean, reason: unknown) {
        super();
        this.#aborted = aborted;
        this.#reason = reason;
    }
    
    #aborted: boolean;
    #reason: unknown;

    get aborted() {
        return this.#aborted;
    }
    get reason() {
        return this.#reason;
    }
}

export interface AbortSignalEventMap {
    "abort": Event;
}

export interface AbortSignal {
    addEventListener<K extends keyof AbortSignalEventMap>(type: K, listener: Listener<AbortSignalEventMap[K]>, options?: AddEventListenerOptions): boolean;
    addEventListener(type: string | symbol, listener: Listener<Event>, options?: AddEventListenerOptions): boolean;

    removeEventListener<K extends keyof AbortSignalEventMap>(type: K, listener: Listener<AbortSignalEventMap[K]>): boolean
    removeEventListener(type: string | symbol, listener: Listener<Event>): boolean
}