import type { EventTarget } from "#internal/EventTarget.js"; 
import { type Sentinel, kNext, kPrev } from "#internal/EventQueue.js";
import { DispatchContext } from "#internal/DispatchContext.js";

export const kTarget = Symbol("Event::target");
export const kCurrentTarget = Symbol("Event::currentTarget");
export const kContext = Symbol("Event::context");
export const kPhase = Symbol("Event::phase");

function stopPropagation(self: Event) {
    const context = self[kContext];
    if (context !== null) context.flags |= DispatchContext.STOP_PROPAGATION;
}

function stopImmediatePropagation(self: Event) {
    const context = self[kContext];
    if (context !== null) context.flags |= (DispatchContext.STOP_PROPAGATION | DispatchContext.STOP_LISTENERS);
}

function preventDefault(self: Event) {
    const context = self[kContext];
    if (context !== null && self.cancelable) context.flags |= DispatchContext.PREVENT_DEFAULT;
}

export interface EventOptions {
    cancelable?: boolean;
    bubbles?: boolean;
}

const OPT_EMPTY: EventOptions = {};

export class Event {

    static readonly NONE        = 0x0;
    static readonly ENQUEUED    = 0x1;
    static readonly DISPATCHING = 0x2;

    constructor(type: string | symbol, options: EventOptions = OPT_EMPTY) {
        this.type = type;
        this.cancelable = Boolean(options.cancelable);
        this.bubbles = Boolean(options.bubbles);
    }

    readonly type: string | symbol;
    
    [kPhase]: number = Event.NONE;
    [kContext]: DispatchContext | null = null;
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