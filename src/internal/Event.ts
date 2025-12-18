import type { EventTarget } from "#internal/EventTarget.js"; 
import { type Sentinel, kNext, kPrev } from "#internal/EventQueue.js";
import { type DispatchContext_t, FLAGS } from "#internal/DispatchContext.js";

export const kTarget = Symbol("Event::target");
export const kCurrentTarget = Symbol("Event::currentTarget");
export const kContext = Symbol("Event::context");
export const kPhase = Symbol("Event::phase");

export const enum PHASE {
    NONE,
    ENQUEUED,
    DISPATCHING
}

function stopPropagation(self: Event) {
    const context = self[kContext];
    if (context !== null) context.flags |= FLAGS.STOP_PROPAGATION;
}

function stopImmediatePropagation(self: Event) {
    const context = self[kContext];
    if (context !== null) context.flags |= (FLAGS.STOP_PROPAGATION | FLAGS.STOP_LISTENERS);
}

function preventDefault(self: Event) {
    const context = self[kContext];
    if (context !== null && self.cancelable) context.flags |= FLAGS.PREVENT_DEFAULT;
}

export interface EventOptions {
    cancelable?: boolean;
    bubbles?: boolean;
}

const OPT_EMPTY: EventOptions = {};

export class Event {
    constructor(type: string | symbol, options: EventOptions = OPT_EMPTY) {
        this.type = type;
        this.cancelable = Boolean(options.cancelable);
        this.bubbles = Boolean(options.bubbles);
    }

    readonly type: string | symbol;
    
    [kPhase]: PHASE = PHASE.NONE;
    [kContext]: DispatchContext_t | null = null;
    [kTarget]: EventTarget | null = null;
    [kCurrentTarget]: EventTarget | null = null;
    [kNext]: Sentinel | Event | null = null;
    [kPrev]: Sentinel | Event | null = null;

    get phase() {
        return this[kPhase];
    }

    get target() {
        return this[kTarget];
    }

    get currentTarget() {
        return this[kCurrentTarget];
    }

    readonly cancelable: boolean;
    readonly bubbles: boolean;

    stopPropagation() {
        stopPropagation(this);
    }

    stopImmediatePropagation() {
        stopImmediatePropagation(this);
    }

    preventDefault() {
        preventDefault(this);
    }
}