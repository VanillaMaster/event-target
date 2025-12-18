import type { Event } from "#internal/Event.js"; 

export interface FunctionListener_t<T extends Event> {
    (evt: T): void;
}

export interface ObjectListener_t<T extends Event> {
    handleEvent?: FunctionListener_t<T>;
}

export type Listener_t<T extends Event> =
    | FunctionListener_t<T>
    | ObjectListener_t<T>;