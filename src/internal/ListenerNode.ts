import type { Event } from "#internal/Event.js"; 
import type { ListenerSentinel_t } from "#internal/ListenerSentinel.js"
import type { Listener, FunctionListener } from "#internal/Listener.js";
import type { WeakKey_t } from "#internal/WeakKey.js"; 

export const enum FLAGS {
    NONE     = 0x00,
    FUNCTION = 0x01,
    DEAD     = 0x02
}

interface ListenerNodeBase_t {
    listener: Listener<Event> | WeakRef<Listener<Event>>;
    sentinel: ListenerSentinel_t;
    
    flags: number;
    signal: WeakRef<ListenerNode_t> | null;
    weakKey: WeakKey_t | null;
    once: boolean;

    next: ListenerNode_t | null;
    prev: ListenerNode_t | ListenerSentinel_t;

    handleEvent: FunctionListener<Event>;
}

interface StrongListenerNode_t extends ListenerNodeBase_t {
    listener: Listener<Event>;
    weakKey: null;
}

interface WeakListenerNode_t extends ListenerNodeBase_t {
    listener: WeakRef<Listener<Event>>;
    weakKey: WeakKey_t;
}

export type ListenerNode_t =
    | StrongListenerNode_t
    | WeakListenerNode_t;
    
export function create(
    listener: Listener<Event>,
    sentinel: ListenerSentinel_t,
    flags: number,
    signal: WeakRef<ListenerNode_t> | null,
    weakKey: null,
    once: boolean,
    next: ListenerNode_t | null,
    prev: ListenerNode_t | ListenerSentinel_t,
    handleEvent: FunctionListener<Event>
): StrongListenerNode_t;
export function create(
    listener: WeakRef<Listener<Event>>,
    sentinel: ListenerSentinel_t,
    flags: number,
    signal: WeakRef<ListenerNode_t> | null,
    weakKey: WeakKey_t,
    once: boolean,
    next: ListenerNode_t | null,
    prev: ListenerNode_t | ListenerSentinel_t,
    handleEvent: FunctionListener<Event>
): WeakListenerNode_t;
export function create(
    listener: Listener<Event> | WeakRef<Listener<Event>>,
    sentinel: ListenerSentinel_t,
    flags: number,
    signal: WeakRef<ListenerNode_t> | null,
    weakKey: WeakKey_t | null,
    once: boolean,
    next: ListenerNode_t | null,
    prev: ListenerNode_t | ListenerSentinel_t,
    handleEvent: FunctionListener<Event>
): ListenerNode_t;
export function create(
    listener: Listener<Event> | WeakRef<Listener<Event>>,
    sentinel: ListenerSentinel_t,
    flags: number,
    signal: WeakRef<ListenerNode_t> | null,
    weakKey: WeakKey_t | null,
    once: boolean,
    next: ListenerNode_t | null,
    prev: ListenerNode_t | ListenerSentinel_t,
    handleEvent: FunctionListener<Event>
): ListenerNodeBase_t {
    return { listener, sentinel, flags, signal, weakKey, once, next, prev, handleEvent };
}