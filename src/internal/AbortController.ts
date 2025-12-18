import { AbortSignal, kAborted, kReason } from "#internal/AbortSignal.js";
import { Event } from "#internal/Event.js";

const kSignal = Symbol("AbortController::signal");

export class AbortController {

    constructor() {}

    [kSignal]: AbortSignal | null = null;

    get signal() {
        let signal = this[kSignal];
        if (signal === null) {
            signal = new AbortSignal(false, undefined);
            this[kSignal] = signal;
        }
        return signal;
    }

    abort(reason?: any) {
        const signal = this[kSignal];
        if (signal !== null && !signal[kAborted]) {
            signal[kAborted] = true;
            signal[kReason] = reason;
            const event = new Event("abort");
            signal.dispatchEvent(event);
        }
    }
}