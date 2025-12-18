import type { EventTarget } from "#internal/EventTarget.js";
import type { ListenerSentinel_t } from "#internal/ListenerSentinel.js"; 

export const enum FLAGS {
    NONE        = 0x00,
    TRACKED     = 0x01,
    DEAD        = 0x02
}

export interface EventTargetInternals_t {
    listeners: Map<string | symbol, ListenerSentinel_t>;
    targetRef: WeakRef<EventTarget>;
    fastWeakKeys: number;
    slowWeakKeys: Set<WeakKey> | null;
    parentRef: WeakRef<EventTarget> | null;
    flags: number;
}

export function create(target: EventTarget): EventTargetInternals_t {
    return {
        listeners: new Map(),
        targetRef: new WeakRef(target),
        fastWeakKeys: 0,
        slowWeakKeys: null,
        parentRef: null,
        flags: FLAGS.NONE
    }
}