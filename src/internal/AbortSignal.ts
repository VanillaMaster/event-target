import type { Listener } from "#internal/Listener.js";
import { EventTarget, type AddEventListenerOptions } from "#internal/EventTarget.js"
import type { Event } from "#internal/Event.js";

export const kAborted = Symbol("AbortSignal::aborted");
export const kReason = Symbol("AbortSignal::reason");

export class AbortSignal extends EventTarget {
    constructor(aborted: boolean, reason: unknown) {
        super();
        this[kAborted] = aborted;
        this[kReason] = reason;
    }
    
    [kAborted]: boolean;
    [kReason]: unknown;

    get aborted() {
        return this[kAborted];
    }
    get reason() {
        return this[kReason];
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