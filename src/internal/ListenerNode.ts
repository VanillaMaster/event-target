import type { Event } from "#internal/Event.js"; 
import type { ListenerSentinel } from "#internal/ListenerSentinel.js"
import type { Listener, FunctionListener } from "#internal/Listener.js";
import type { WeakKey } from "#internal/WeakKey.js"; 
import { assert } from "#internal/utils.js";

declare namespace Reference {

    const kBrand: unique symbol;
    const weak: unique symbol;
    const strong: unique symbol;

    interface Weak {
        [kBrand]: typeof weak; 
    }
    
    interface Strong {
        [kBrand]: typeof strong; 
    }
}

type Reference = Reference.Weak | Reference.Strong;

/**
 * [Variance Annotations](https://www.typescriptlang.org/docs/handbook/2/generics.html#variance-annotations)
 * based helper
 * 
 * Enforces
 * - `(A | B) extends (A) === false`
 * - `(A) extends (A | B) === true`
 * 
 * <!--
 * biome-ignore lint/suspicious/noEmptyInterface: See above
 * -->
 */
interface Super<out _T> {}

type Discriminated<T extends Reference, A, B> = Super<T> extends Super<Reference.Strong> ? A : Super<T> extends Super<Reference.Weak> ? B : A | B;

export declare namespace ListenerNode {
    type Strong = ListenerNode<Reference.Strong>;
    type Weak = ListenerNode<Reference.Weak>;
    type Any = Strong | Weak;
}

export class ListenerNode<T extends Reference> {

    static readonly NONE     = 0x00;
    static readonly FUNCTION = 0x01;
    static readonly DEAD     = 0x02;

    static create(
        listener: Listener<Event>,
        sentinel: ListenerSentinel,
        flags: number,
        signal: WeakRef<ListenerNode.Any> | null,
        weakKey: null,
        once: boolean,
        next: ListenerNode.Any | null,
        prev: ListenerNode.Any | ListenerSentinel,
        handleEvent: FunctionListener<Event>
    ): ListenerNode.Strong;
    static create(
        listener: WeakRef<Listener<Event>>,
        sentinel: ListenerSentinel,
        flags: number,
        signal: WeakRef<ListenerNode.Any> | null,
        weakKey: WeakKey,
        once: boolean,
        next: ListenerNode.Any | null,
        prev: ListenerNode.Any | ListenerSentinel,
        handleEvent: FunctionListener<Event>
    ): ListenerNode.Weak;
    static create(
        listener: Listener<Event> | WeakRef<Listener<Event>>,
        sentinel: ListenerSentinel,
        flags: number,
        signal: WeakRef<ListenerNode.Any> | null,
        weakKey: WeakKey | null,
        once: boolean,
        next: ListenerNode.Any | null,
        prev: ListenerNode.Any | ListenerSentinel,
        handleEvent: FunctionListener<Event>
    ): ListenerNode.Any;
    static create(
        listener: Listener<Event> | WeakRef<Listener<Event>>,
        sentinel: ListenerSentinel,
        flags: number,
        signal: WeakRef<ListenerNode.Any> | null,
        weakKey: WeakKey | null,
        once: boolean,
        next: ListenerNode.Any | null,
        prev: ListenerNode.Any | ListenerSentinel,
        handleEvent: FunctionListener<Event>
    ): ListenerNode<Reference.Strong | Reference.Weak> {
        assert((weakKey === null) !== (listener instanceof WeakRef));
        return new ListenerNode(listener, sentinel, flags, signal, weakKey, once, next, prev, handleEvent);
    }

    private constructor(
        listener: Discriminated<T, Listener<Event>, WeakRef<Listener<Event>>>,
        sentinel: ListenerSentinel,
        flags: number,
        signal: WeakRef<ListenerNode.Any> | null,
        weakKey: Discriminated<T, null, WeakKey>,
        once: boolean,
        next: ListenerNode.Any | null,
        prev: ListenerNode.Any | ListenerSentinel,
        handleEvent: FunctionListener<Event>
    ) {
        this.listener = listener;
        this.sentinel = sentinel;
        this.flags = flags;
        this.signal = signal;
        this.weakKey = weakKey;
        this.once = once;
        this.next = next;
        this.prev = prev;
        this.handleEvent = handleEvent;
    }

    listener: Discriminated<T, Listener<Event>, WeakRef<Listener<Event>>>;
    sentinel: ListenerSentinel;
    
    flags: number;
    signal: WeakRef<ListenerNode.Any> | null;
    weakKey: Discriminated<T, null, WeakKey>;
    once: boolean;

    next: ListenerNode.Any | null;
    prev: ListenerNode.Any | ListenerSentinel;

    handleEvent: FunctionListener<Event>;
}