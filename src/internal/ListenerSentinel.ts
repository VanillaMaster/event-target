import type { ListenerNode } from "#internal/ListenerNode.js"
import type { EventTargetInternals } from "#internal/EventTargetInternals.js";
import type { EventTarget } from "#internal/EventTarget.js";

export class ListenerSentinel {

    static create(
        next: ListenerNode.Any | null,
        length: number,
        event: string | symbol,
        internals: EventTargetInternals,
        target: WeakRef<EventTarget>,
        lock: number
    ): ListenerSentinel {
        return new ListenerSentinel(next, length, event, internals, target, lock);
    }

    private constructor(
        next: ListenerNode.Any | null,
        length: number,
        event: string | symbol,
        internals: EventTargetInternals,
        target: WeakRef<EventTarget>,
        lock: number
    ) {
        this.next = next;
        this.length = length;
        this.event = event;
        this.internals = internals;
        this.target = target;
        this.lock = lock;
    }

    next: ListenerNode.Any | null;
    length: number;
    lock: number;
    readonly event: string | symbol;
    readonly internals: EventTargetInternals;
    readonly target: WeakRef<EventTarget>;

}