import type { AbortSignal } from "./AbortSignal.js";
import { Event } from "./Event.js";
import { assert, assertNotNull } from "./utils.js";
import { enqueue, drain } from "./Dispatcher.js";
import { ListenerAddedEvent } from "./ListenerAddedEvent.js";
import { LISTENER_ADDED } from "./channels.js";
import { alloc, free } from "./WeakKey.js"


const OPT_EMPTY: AddEventListenerOptions = {};
const OPT_ONCE_WEAK: AddEventListenerOptions = { weak: true, once: true };

export interface FunctionListener<T extends Event> {
    (evt: T): void;
}

export interface ObjectListener<T extends Event> {
    handleEvent?: FunctionListener<T>;
}

export type Listener<T extends Event> =
    | FunctionListener<T>
    | ObjectListener<T>;

export interface AddEventListenerOptions {
    signal?: AbortSignal;
    weak?: boolean;
    once?: boolean;
}

interface ListenerSentinel {
    next: ListenerNode | null;
    length: number;
    event: string | symbol;
    container: Map<string | symbol, ListenerSentinel>;
    owner: WeakRef<EventTarget>;
}

function ListenerSentinel(
    next: ListenerNode | null,
    length: number,
    event: string | symbol,
    container: Map<string | symbol, ListenerSentinel>,
    owner: WeakRef<EventTarget>
): ListenerSentinel {
    return { next, length, event, container, owner };
}

export const enum LISTENER_FLAGS {
    NONE     = 0x00,
    FUNCTION = 0x01,
    DEAD     = 0x02
}

interface ListenerNodeBase {
    listener: Listener<Event> | WeakRef<Listener<Event>>;
    sentinel: ListenerSentinel;
    
    flags: number;
    signal: WeakRef<ListenerNode> | null;
    weak: boolean;
    once: boolean;

    next: ListenerNode | null;
    prev: ListenerNode | ListenerSentinel;

    handleEvent: FunctionListener<Event>;
}

interface StrongListenerNode extends ListenerNodeBase {
    listener: Listener<Event>;
    weak: false;
}

interface WeakListenerNode extends ListenerNodeBase {
    listener: WeakRef<Listener<Event>>;
    weak: true;
}

export type ListenerNode =
    | StrongListenerNode
    | WeakListenerNode;

function handleEvent(this: ListenerNode) {
    removeListener(this);
}
    
function ListenerNode(
    listener: Listener<Event>,
    sentinel: ListenerSentinel,
    flags: number,
    signal: WeakRef<ListenerNode> | null,
    weak: false,
    once: boolean,
    next: ListenerNode | null,
    prev: ListenerNode | ListenerSentinel
): StrongListenerNode;
function ListenerNode(
    listener: WeakRef<Listener<Event>>,
    sentinel: ListenerSentinel,
    flags: number,
    signal: WeakRef<ListenerNode> | null,
    weak: true,
    once: boolean,
    next: ListenerNode | null,
    prev: ListenerNode | ListenerSentinel
): WeakListenerNode;
function ListenerNode(
    listener: Listener<Event> | WeakRef<Listener<Event>>,
    sentinel: ListenerSentinel,
    flags: number,
    signal: WeakRef<ListenerNode> | null,
    weak: boolean,
    once: boolean,
    next: ListenerNode | null,
    prev: ListenerNode | ListenerSentinel
): ListenerNode;
function ListenerNode(
    listener: Listener<Event> | WeakRef<Listener<Event>>,
    sentinel: ListenerSentinel,
    flags: number,
    signal: WeakRef<ListenerNode> | null,
    weak: boolean,
    once: boolean,
    next: ListenerNode | null,
    prev: ListenerNode | ListenerSentinel
): ListenerNodeBase {
    return { listener, sentinel, flags, signal, weak, once, next, prev, handleEvent };
}

interface EventTargetInternals {
    listeners: Map<string | symbol, ListenerSentinel>;
    weakMask: number;
    weakKeys: Set<WeakKey> | null;
    parentRef: WeakRef<EventTargetInternals> | null;
    selfRef: WeakRef<EventTargetInternals> | null;
    flags: number;
}

function EventTargetInternals(): EventTargetInternals {
    return {
        listeners: new Map(),
        weakMask: 0xFFFFFFFF | 0,
        weakKeys: null,
        parentRef: null,
        selfRef: null,
        flags: EVENT_TARGET_FLAGS.NONE
    }
}

const enum EVENT_TARGET_FLAGS {
    NONE        = 0x00,
    TRACKED     = 0x01
}

const kListeners = Symbol("listeners");
const kRef = Symbol("ref");
const kFlags = Symbol("flags");
const kParent = Symbol("parent");

const kInternals = Symbol("internals");

const instances = new FinalizationRegistry(instanceCleanup);
const entries = new FinalizationRegistry(weakEntryCleanup);

function registerWeakNode(self: EventTarget, listener: Listener<Event>, node: ListenerNode) {
    assert(node.weak);
    if ((self[kFlags] & EVENT_TARGET_FLAGS.TRACKED) === 0) trackInstance(self);
    entries.register(listener, node, self[kListeners]);
}

function trackInstance(instance: EventTarget) {
    assert((instance[kFlags] & EVENT_TARGET_FLAGS.TRACKED) === 0)
    instances.register(instance, instance[kListeners]);
    instance[kFlags] |= EVENT_TARGET_FLAGS.TRACKED;
}

function instanceCleanup(id: Map<string | symbol, ListenerSentinel>) {
    entries.unregister(id);
}

function weakEntryCleanup(node: ListenerNode) {
    removeListenerWithSignal(node);
}

function removeListener(node: ListenerNode) {
    assert((node.flags & LISTENER_FLAGS.DEAD) === 0);
    const { sentinel, prev, next } = node;
    const { container, event } = sentinel;
    if (next !== null) next.prev = prev;
    prev.next = next;
    if (--sentinel.length === 0) container.delete(event);
    node.flags |= LISTENER_FLAGS.DEAD;
}

function removeListenerWithSignal(node: ListenerNode) {
    removeListener(node);
    const { signal: signalRef } = node;
    if (signalRef !== null) {
        const signal = signalRef.deref();
        if (signal !== undefined) removeListenerWithSignal(signal);
    }
}

function addListener(self: EventTarget, type: string | symbol, listener: Listener<Event>, options: AddEventListenerOptions): ListenerNode | null {    
    const { [kListeners]: listeners, [kRef]: selfRef } = self;
    const sentinel = listeners.get(type);

    if (sentinel === undefined) {
        let flags = LISTENER_FLAGS.NONE;
        if (typeof listener === "function") flags |= LISTENER_FLAGS.FUNCTION;
        const { once = false, weak = false, signal = null} = options;
        const sentinel = ListenerSentinel(null, 1, type, listeners, selfRef);
        let listenerRef: Listener<Event> | WeakRef<Listener<Event>> = listener;
        if (weak) listenerRef = new WeakRef(listener);
        const node = ListenerNode(listenerRef, sentinel, flags, null, weak, once, null, sentinel);
        sentinel.next = node;
        if (weak) registerWeakNode(self, listener, node);
        if (signal !== null) node.signal = new WeakRef(assertNotNull(addListener(signal, "abort", node, OPT_ONCE_WEAK)));
        listeners.set(type, sentinel);
        const event = new ListenerAddedEvent(LISTENER_ADDED, { newLength: 1, listenerType: type });
        enqueue(self, event);
        return node;
    }
    
    const { next } = sentinel;
    assert(next !== null);
    for (let node: ListenerNode | null = next; node !== null; node = node.next) {
        const listenerRef = node.weak ? node.listener.deref() : node.listener;
        if (listenerRef === listener) return null;
    }
    let flags = LISTENER_FLAGS.NONE;
    if (typeof listener === "function") flags |= LISTENER_FLAGS.FUNCTION;
    const { once = false, weak = false, signal = null} = options;
    let listenerRef: Listener<Event> | WeakRef<Listener<Event>> = listener;
    if (weak) listenerRef = new WeakRef(listener);
    const node = ListenerNode(listenerRef, sentinel, flags, null, weak, once, next, sentinel);
    next.prev = node;
    sentinel.next = node;
    sentinel.length++;
    if (weak) registerWeakNode(self, listener, node);
    if (signal !== null) node.signal = new WeakRef(assertNotNull(addListener(signal, "abort", node, OPT_ONCE_WEAK)));
    const event = new ListenerAddedEvent(LISTENER_ADDED, { newLength: sentinel.length, listenerType: type });
    enqueue(self, event);
    return node;
}

function dispatchEvent(self: EventTarget, event: Event): boolean {
    return false;
}

function removeEventListener(self: EventTarget, type: string | symbol, listener: Listener<Event>): boolean {
    const { [kListeners]: listeners } = self;
    const sentinel = listeners.get(type);
    if (sentinel === undefined) return false;
    assert(sentinel.next !== null);
    for (let node: ListenerNode | null = sentinel.next; node !== null; node = node.next) {
        const listenerRef = node.weak ? node.listener.deref() : node.listener;
        if (listenerRef === listener) {
            removeListenerWithSignal(node);
            return true;
        }
    }
    return false;
}

export class EventTarget {
    /**@internal */
    [kFlags] = EVENT_TARGET_FLAGS.NONE;
    /**@internal */
    [kRef] = new WeakRef(this);
    /**@internal */
    [kParent]: WeakRef<EventTarget> | null = null;
    /**@internal */
    [kListeners] = new Map<string | symbol, ListenerSentinel>();

    [kInternals] = EventTargetInternals();

    addEventListener(type: string | symbol, listener: Listener<Event>, options: AddEventListenerOptions = OPT_EMPTY): boolean {
        drain();
        const result = (addListener(this, type, listener, options) !== null);
        drain();
        return result;;
    }

    dispatchEvent(event: Event): boolean {
        enqueue(this, event);
        drain();
        return dispatchEvent(this, event);
    }

    removeEventListener(type: string | symbol, listener: Listener<Event>): boolean {
        return removeEventListener(this, type, listener);
    }
}

export function setParent(self: EventTarget, parent: EventTarget | null) {
    if (parent !== null) self[kParent] = parent[kRef];
    else self[kParent] = null;
}

export function getPath(self: EventTarget, out: EventTarget[]) {
    block: {
        const { [kParent]: parentRef } = self;
        if (parentRef === null) break block;
        const parent = parentRef.deref();
        if (parent === undefined) break block;
        getPath(parent, out);
    }
    out.push(self)
}

export function getListeners(self: EventTarget, type: string | symbol, out: ListenerNode[]) {
    const { [kListeners]: listeners } = self;
    const sentinel = listeners.get(type);
    if (sentinel !== undefined) {
        for (let node: ListenerNode | null = sentinel.next; node !== null; node = node.next) {
            out.push(node);
        }
    }
}