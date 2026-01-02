import type { EventTarget } from "#internal/EventTarget.js";
import type { ListenerSentinel } from "#internal/ListenerSentinel.js"; 

export class EventTargetInternals {

    static readonly NONE    = 0x00;
    static readonly TRACKED = 0x01;
    static readonly DEAD    = 0x02;

    static create(target: EventTarget): EventTargetInternals {
        return new EventTargetInternals(target);
    }

    private constructor(target: EventTarget) {
        this.targetRef = new WeakRef(target);
    }

    readonly targetRef: WeakRef<EventTarget>;
    readonly listeners = new Map<string | symbol, ListenerSentinel>;
    slowWeakKeys: Set<WeakKey> | null = null;
    parentRef: WeakRef<EventTarget> | null = null;
    fastWeakKeys = 0;
    flags = EventTargetInternals.NONE;

}