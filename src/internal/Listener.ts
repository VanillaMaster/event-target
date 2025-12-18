import type { Event } from "#internal/Event.js"; 

export interface FunctionListener<T extends Event> {
    (evt: T): void;
}

export interface ObjectListener<T extends Event> {
    handleEvent?: FunctionListener<T>;
}

export type Listener<T extends Event> =
    | FunctionListener<T>
    | ObjectListener<T>;