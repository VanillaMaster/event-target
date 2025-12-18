import type { ListenerNode_t } from "#internal/ListenerNode.js"
import type { EventTargetInternals_t } from "#internal/EventTargetInternals.js";
import type { EventTarget } from "#internal/EventTarget.js";

export interface ListenerSentinel_t {
    next: ListenerNode_t | null;
    length: number;
    event: string | symbol;
    internals: EventTargetInternals_t;
    target: WeakRef<EventTarget>;
    lock: number;
}

export function create(
    next: ListenerNode_t | null,
    length: number,
    event: string | symbol,
    internals: EventTargetInternals_t,
    target: WeakRef<EventTarget>,
    lock: number
): ListenerSentinel_t {
    return { next, length, event, internals, target, lock };
}