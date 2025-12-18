import type { Event } from "#internal/Event.js"; 
import type { ListenerSentinel_t } from "#internal/ListenerSentinel.js"
import type { Listener_t, FunctionListener_t } from "#internal/Listener.js";
import type { WeakKey_t } from "#internal/WeakKey.js"; 

export const enum FLAGS {
    NONE     = 0x00,
    FUNCTION = 0x01,
    DEAD     = 0x02
}

interface ListenerNodeBase_t {
    listener: Listener_t<Event> | WeakRef<Listener_t<Event>>;
    sentinel: ListenerSentinel_t;
    
    flags: number;
    signal: WeakRef<ListenerNode_t> | null;
    weakKey: WeakKey_t | null;
    once: boolean;

    next: ListenerNode_t | null;
    prev: ListenerNode_t | ListenerSentinel_t;

    handleEvent: FunctionListener_t<Event>;
}

interface StrongListenerNode_t extends ListenerNodeBase_t {
    listener: Listener_t<Event>;
    weakKey: null;
}

interface WeakListenerNode_t extends ListenerNodeBase_t {
    listener: WeakRef<Listener_t<Event>>;
    weakKey: WeakKey_t;
}

export type ListenerNode_t =
    | StrongListenerNode_t
    | WeakListenerNode_t;
    
export function create(
    listener: Listener_t<Event>,
    sentinel: ListenerSentinel_t,
    flags: number,
    signal: WeakRef<ListenerNode_t> | null,
    weakKey: null,
    once: boolean,
    next: ListenerNode_t | null,
    prev: ListenerNode_t | ListenerSentinel_t,
    handleEvent: FunctionListener_t<Event>
): StrongListenerNode_t;
export function create(
    listener: WeakRef<Listener_t<Event>>,
    sentinel: ListenerSentinel_t,
    flags: number,
    signal: WeakRef<ListenerNode_t> | null,
    weakKey: WeakKey_t,
    once: boolean,
    next: ListenerNode_t | null,
    prev: ListenerNode_t | ListenerSentinel_t,
    handleEvent: FunctionListener_t<Event>
): WeakListenerNode_t;
export function create(
    listener: Listener_t<Event> | WeakRef<Listener_t<Event>>,
    sentinel: ListenerSentinel_t,
    flags: number,
    signal: WeakRef<ListenerNode_t> | null,
    weakKey: WeakKey_t | null,
    once: boolean,
    next: ListenerNode_t | null,
    prev: ListenerNode_t | ListenerSentinel_t,
    handleEvent: FunctionListener_t<Event>
): ListenerNode_t;
export function create(
    listener: Listener_t<Event> | WeakRef<Listener_t<Event>>,
    sentinel: ListenerSentinel_t,
    flags: number,
    signal: WeakRef<ListenerNode_t> | null,
    weakKey: WeakKey_t | null,
    once: boolean,
    next: ListenerNode_t | null,
    prev: ListenerNode_t | ListenerSentinel_t,
    handleEvent: FunctionListener_t<Event>
): ListenerNodeBase_t {
    return { listener, sentinel, flags, signal, weakKey, once, next, prev, handleEvent };
}