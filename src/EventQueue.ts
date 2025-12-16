import type { Event } from "./Event.js";
import { assert, static_cast } from "./utils.js";

export const kNext = Symbol("next");
export const kPrev = Symbol("prev");

declare namespace internal {
    interface Sentinel<T> {
        [kNext]: Event | Sentinel<T> | T;
        [kPrev]: Event | Sentinel<T> | T;
    }
}

export type Sentinel = internal.Sentinel<never>;
export function Sentinel(): Sentinel {
    const sentinel: internal.Sentinel<null> = { [kNext]: null, [kPrev]: null };
    sentinel[kNext] = sentinel;
    sentinel[kPrev] = sentinel;
    static_cast<Sentinel>(sentinel);
    return sentinel;
}

export const sentinel = Sentinel();
export let length = 0;

export function push(event: Event) {
    assert(event[kNext] === null);
    assert(event[kPrev] === null);
    const { [kPrev]: prev } = sentinel;
    
    event[kPrev] = prev;
    event[kNext] = sentinel;
    sentinel[kPrev] = event;
    prev[kNext] = event;

    length++;
}

export function shift(): Event | null {
    const { [kNext]: node } = sentinel;
    if (node === sentinel) return null;
    static_cast<Event>(node);
    const { [kNext]: next } = node;
    assert(next !== null);
    
    next[kPrev] = sentinel;
    sentinel[kNext] = next;
    
    length--;

    return node;
}