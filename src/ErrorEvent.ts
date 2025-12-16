import { Event, type EventOptions } from "./Event.js";

export interface ErrorEventOptions extends EventOptions {
    error?: unknown;
}

const OPT_EMPTY: ErrorEventOptions = {};

export class ErrorEvent extends Event {
    constructor(type: string | symbol, options: ErrorEventOptions = OPT_EMPTY) {
        super(type, options);
        this.error = options.error;
    }

    readonly error: unknown;
}