import {
    type EventTarget,
    type ListenerNode,
    type FunctionListener,
    type ObjectListener,
    getPath,
    LISTENER_FLAGS,
    getListeners
} from "./EventTarget.js";
import { type Event, kCurrentTarget, kContext, kPhase, kTarget, PHASE } from "./Event.js";
import { assert, static_cast } from "./utils.js";
import { push, shift, length } from "./EventQueue.js";
import { ErrorEvent } from "./ErrorEvent.js";
import { LISTENER_ERROR } from "./channels.js";
import { alloc } from "./DispatchContext.js";

let event: Event | null = null;
const path: EventTarget[] = [];
const listeners: ListenerNode[] = [];

// export function dispatch(target: EventTarget, evt: Event) {
//     assert(evt[kPhase] === PHASE.NONE);
//     if (event === null) { // SUSPENDED
//         assert(length === 0);
//         evt[kPhase] = PHASE.DISPATCHING;
//         evt[kTarget] = target;
//         event = evt;
//         getPath(target, path);
//     } else { // RUNNING
//         enqueue(target, evt);
//     }
//     drain();
//     return (evt[kFlags] & FLAGS.PREVENT_DEFAULT) === 0;
// }

export function enqueue(target: EventTarget, event: Event) {
    assert(event[kPhase] === PHASE.NONE);
    const context = alloc();
    event[kContext] = context;
    event[kPhase] = PHASE.ENQUEUED;
    event[kTarget] = target;
    push(event);
    return context;
}

// export function resume() {
//     if (event === null) {
//         event = shift();
//         if (event !== null) {
//             const { [kTarget]: target } = event;
//             assert(target !== null);
//             event[kPhase] = PHASE.DISPATCHING;
//             getPath(target, path);
//         }
//     }
//     drain();
// }

function advance() {
    event = shift();
    if (event !== null) {
        const { [kTarget]: target } = event;
        assert(target !== null);
        event[kPhase] = PHASE.DISPATCHING;
        getPath(target, path);
    }
}

export function drain() {
    if (event === null) advance();
    while (event !== null) {
        if (listeners.length === 0) if (path.length === 0) {
            event[kPhase] = PHASE.NONE;
            event[kContext] = null;
            event[kTarget] = null;
            event[kCurrentTarget] = null;
            advance();
            continue;
        } else {
            assert(event !== null);
            const target = path.pop();
            assert(target !== undefined);
            event[kCurrentTarget] = target;
            getListeners(target, event.type, listeners);
            continue;
        }
        assert(event !== null);
        const { [kCurrentTarget]: target } = event;
        assert(target !== null);
        const node = listeners.pop();
        assert(node !== undefined);
        const listener = node.weak ? node.listener.deref() : node.listener;
        if (listener !== undefined) {
            if ((node.flags & LISTENER_FLAGS.FUNCTION) !== 0) {
                static_cast<FunctionListener<Event>>(listener);
                try {
                    Reflect.apply(listener, target, [event]);
                } catch (error) {
                    const event = new ErrorEvent(LISTENER_ERROR, { error });
                    enqueue(target, event);
                }
            } else {
                static_cast<ObjectListener<Event>>(listener);
                try {
                    const { handleEvent } = listener;
                    if (typeof handleEvent === "function") Reflect.apply(handleEvent, listener, [event]);
                } catch (error) {
                    const event = new ErrorEvent(LISTENER_ERROR, { error });
                    enqueue(target, event);
                }
            }
        }
    }
}