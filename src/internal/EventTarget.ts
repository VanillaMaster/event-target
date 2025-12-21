import type { AbortSignal } from "#internal/AbortSignal.js";
import type { Event } from "#internal/Event.js";
import type { Listener } from "#internal/Listener.js";

import { drain, enqueue } from "#internal/Dispatcher.js";
import { ListenersChangeEvent } from "#internal/ListenersChangeEvent.js";
import { LISTENER_ADDED, LISTENER_REMOVED } from "#internal/channels.js";
import { assert, assertNotNull, MASK } from "#internal/utils.js";

import * as DispatchContext from "#internal/DispatchContext.js";

import type { ListenerSentinel_t } from "#internal/ListenerSentinel.js";
import * as ListenerSentinel from "#internal/ListenerSentinel.js";

import type { WeakKey_t } from "#internal/WeakKey.js";
import * as WeakKey from "#internal/WeakKey.js";

import type { ListenerNode_t } from "#internal/ListenerNode.js";
import * as ListenerNode from "#internal/ListenerNode.js";

import type { EventTargetInternals_t } from "#internal/EventTargetInternals.js";
import * as EventTargetInternals from "#internal/EventTargetInternals.js";

export interface AddEventListenerOptions {
    signal?: AbortSignal;
    weak?: boolean;
    once?: boolean;
}

const OPT_EMPTY: AddEventListenerOptions = {};
const OPT_ONCE_WEAK: AddEventListenerOptions = { weak: true, once: true };

export const kInternals = Symbol("EventTarget::internals");

const instances = new FinalizationRegistry(instanceCleanup);
const entries = new FinalizationRegistry(weakEntryCleanup);

function acquireWeakKey(internals: EventTargetInternals_t): WeakKey_t {
    const key = WeakKey.alloc();
    const { mask } = key;
    if (mask === 0) {
        let keys = internals.slowWeakKeys;
        if (keys === null) internals.slowWeakKeys = (keys = new Set());
        keys.add(key);
    } else internals.fastWeakKeys |= mask;
    return key;
}

function registerWeakNode(target: EventTarget, internals: EventTargetInternals_t, listener: Listener<Event>, key: WeakKey_t | null, node: ListenerNode_t) {
    assert(key !== null);
    if ((internals.flags & EventTargetInternals.FLAGS.TRACKED) === 0) trackInstance(target, internals);

    entries.register(listener, node, key);
}

function trackInstance(target: EventTarget, internals: EventTargetInternals_t) {
    assert((internals.flags & EventTargetInternals.FLAGS.TRACKED) === 0);
    internals.flags |= EventTargetInternals.FLAGS.TRACKED;
    instances.register(target, internals);
}

function instanceCleanup(internals: EventTargetInternals_t) {
    assert((internals.flags & EventTargetInternals.FLAGS.DEAD) === 0);
    internals.flags |= EventTargetInternals.FLAGS.DEAD;

    let bitset = internals.fastWeakKeys;
    for (let i = Math.clz32(bitset); i < 32; i = Math.clz32(bitset)) {
        const mask = (MASK.BIT_32 >>> i) | 0;
        bitset &= ~mask;
        entries.unregister(WeakKey.get(i));
        WeakKey.free(mask);
    }

    const keys = internals.slowWeakKeys;
    if (keys !== null) for (const key of keys) {
        entries.unregister(key);
    }
}

function weakEntryCleanup(node: ListenerNode_t) {
    removeListenerWithSignal(node);
    drain();
}

function signalCleanup(this: ListenerNode_t, _event: Event) {
    removeListener(this);
    drain();
}

export function removeListener(node: ListenerNode_t) {
    assert((node.flags & ListenerNode.FLAGS.DEAD) === 0);
    node.flags |= ListenerNode.FLAGS.DEAD;

    const { sentinel, prev, next, weakKey } = node;
    const { internals, event: type } = sentinel;
    const { listeners, targetRef } = internals;

    if (next !== null) next.prev = prev;
    prev.next = next;

    if (weakKey !== null) {
        const { mask } = weakKey;
        if (mask !== 0) {
            internals.fastWeakKeys &= ~mask;
            entries.unregister(weakKey);
            WeakKey.free(mask);
        } else {
            const { slowWeakKeys } = internals
            assert(slowWeakKeys !== null);
            const result = slowWeakKeys.delete(weakKey);
            assert(result);
        }
    }

    if ((--sentinel.length === 0) && (sentinel.lock === 0)) listeners.delete(type);

    const target = targetRef.deref();
    if (target !== undefined) {
        const event = new ListenersChangeEvent(LISTENER_REMOVED, { newLength: sentinel.length, listenerType: type });
        enqueue(target, event, null);
    }
}

export function removeListenerWithSignal(node: ListenerNode_t) {
    const { signal: signalRef } = node;
    if (signalRef !== null) {
        const signal = signalRef.deref();
        if (signal !== undefined) removeListenerWithSignal(signal);
    }
    removeListener(node);
}

function getSentinel(internals: EventTargetInternals_t, listeners: Map<string | symbol, ListenerSentinel_t>, type: string | symbol) {
    let sentinel = listeners.get(type);
    if (sentinel === undefined) {
        sentinel = ListenerSentinel.create(null, 0, type, internals, internals.targetRef, 0);
        listeners.set(type, sentinel);
    }
    return sentinel;
}

function addListener(target: EventTarget, type: string | symbol, listener: Listener<Event>, options: AddEventListenerOptions): ListenerNode_t | null {    
    const { [kInternals]: internals } = target;
    const { listeners } = internals;

    const sentinel = getSentinel(internals, listeners, type);
    sentinel.lock++;
    
    for (let node: ListenerNode_t | null = sentinel.next; node !== null; node = node.next) {
        const listenerRef = (node.weakKey !== null) ? node.listener.deref() : node.listener;
        if (listenerRef === listener) return null;
    }

    let flags = ListenerNode.FLAGS.NONE;
    if (typeof listener === "function") flags |= ListenerNode.FLAGS.FUNCTION;
    const { once = false, weak = false, signal = null } = options;
    
    let listenerRef: Listener<Event> | WeakRef<Listener<Event>> = listener;
    let key: WeakKey_t | null = null;

    if (weak) {
        listenerRef = new WeakRef(listener);
        key = acquireWeakKey(internals);
    }

    const node = ListenerNode.create(listenerRef, sentinel, flags, null, key, once, null, sentinel, signalCleanup);
    
    if (weak) registerWeakNode(target, internals, listener, key, node);
    
    if (signal !== null) node.signal = new WeakRef(assertNotNull(addListener(signal, "abort", node, OPT_ONCE_WEAK)));
    
    const { next } = sentinel;
    if (next !== null) next.prev = node;
    sentinel.next = node;
    sentinel.length++;
    
    sentinel.lock--;
    

    const event = new ListenersChangeEvent(LISTENER_ADDED, { newLength: sentinel.length, listenerType: type });
    enqueue(target, event, null);

    return node;
}

function removeEventListener(target: EventTarget, type: string | symbol, listener: Listener<Event>): boolean {
    const { [kInternals]: internals } = target;
    const { listeners } = internals;

    const sentinel = listeners.get(type);
    if (sentinel === undefined) return false;

    for (let node: ListenerNode_t | null = sentinel.next; node !== null; node = node.next) {
        const listenerRef = node.weakKey ? node.listener.deref() : node.listener;
        if (listenerRef === listener) {
            removeListenerWithSignal(node);
            return true;
        }
    }

    return false;
}

export class EventTarget {

    readonly [kInternals] = EventTargetInternals.create(this);

    addEventListener(type: string | symbol, listener: Listener<Event>, options: AddEventListenerOptions = OPT_EMPTY): boolean {
        drain();
        const node = addListener(this, type, listener, options);
        drain();
        return node !== null;
    }

    dispatchEvent(event: Event): boolean {
        const context = DispatchContext.alloc();
        enqueue(this, event, context);
        drain();
        const { flags } = context;
        DispatchContext.free(context);
        return ((flags & DispatchContext.FLAGS.PREVENT_DEFAULT) === 0);
    }

    removeEventListener(type: string | symbol, listener: Listener<Event>): boolean {
        const result = removeEventListener(this, type, listener);
        drain();
        return result;
    }
}

export function setParent(target: EventTarget, parent: EventTarget) {
    const { [kInternals]: targetInternals } = target;
    const { [kInternals]: patentInternals } = parent;
    targetInternals.parentRef = patentInternals.targetRef;
}
export function clearParent(target: EventTarget) {
    const { [kInternals]: internals } = target;
    internals.parentRef = null;
}

export function getPath(target: EventTarget, out: EventTarget[]) {
    // biome-ignore lint: noConfusingLabels
    block: {
        const { [kInternals]: { parentRef } } = target;
        if (parentRef === null) break block;
        const parent = parentRef.deref();
        if (parent === undefined) break block;
        getPath(parent, out);
    }
    out.push(target);
}

export function getListeners(target: EventTarget, type: string | symbol, out: ListenerNode_t[]) {
    const { [kInternals]: { listeners } } = target;
    const sentinel = listeners.get(type);
    if (sentinel !== undefined) {
        for (let node: ListenerNode_t | null = sentinel.next; node !== null; node = node.next) {
            out.push(node);
        }
    }
}