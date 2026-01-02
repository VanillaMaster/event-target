import type { FunctionListener, ObjectListener } from "#internal/Listener.js"
import { type EventTarget, getPath, getListeners, removeListenerWithSignal } from "#internal/EventTarget.js";
import { Event, kCurrentTarget, kContext, kPhase, kTarget } from "#internal/Event.js";
import { assert, static_cast } from "#internal/utils.js";
import { push, shift } from "#internal/EventQueue.js";
import { ErrorEvent } from "#internal/ErrorEvent.js";
import { LISTENER_ERROR } from "#internal/channels.js";
import { ListenerNode } from "#internal/ListenerNode.js"
import { DispatchContext } from "#internal/DispatchContext.js";

let event: Event | null = null;
const path: EventTarget[] = [];
const listeners: ListenerNode.Any[] = [];

export function enqueue(target: EventTarget, event: Event, context: DispatchContext | null): void {
    assert(event[kPhase] === Event.NONE);
    event[kContext] = context;
    event[kPhase] = Event.ENQUEUED;
    event[kTarget] = target;
    push(event);
}

function advance() {
    event = shift();
    if (event !== null) {
        const { [kTarget]: target } = event;
        assert(target !== null);
        event[kPhase] = Event.DISPATCHING;
        if (event[kContext] === null) {
            const context = DispatchContext.alloc();
            context.flags |= DispatchContext.INTERNAL;
            event[kContext] = context;
        }

        if (event.bubbles) getPath(target, path);
        else path.push(target);
    }
}

function checkStopListeners(context: DispatchContext) {
    const result = (context.flags & DispatchContext.STOP_LISTENERS) !== 0;
    if (result) listeners.length = 0;
    return result;
}

function cehckStopPropagation(context: DispatchContext) {
    const result = (context.flags & DispatchContext.STOP_PROPAGATION) !== 0;
    if (result) path.length = 0;
    return result;
}

export function drain() {
    if (event === null) advance();
    while (event !== null) {
        const context = event[kContext];
        assert(context !== null);
        if (listeners.length === 0 || checkStopListeners(context)) {
            if (path.length === 0 || cehckStopPropagation(context)) {                
                if ((context.flags & DispatchContext.INTERNAL) !== 0) DispatchContext.free(context);
                
                event[kPhase] = Event.NONE;
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
        }
        assert(event !== null);
        const { [kCurrentTarget]: target } = event;
        assert(target !== null);
        const node = listeners.pop();
        assert(node !== undefined);
        const listener = (node.weakKey !== null) ? node.listener.deref() : node.listener;
        if (listener !== undefined) {
            if (node.once) removeListenerWithSignal(node);

            if ((node.flags & ListenerNode.FUNCTION) !== 0) {
                static_cast<FunctionListener<Event>>(listener);
                try {
                    Reflect.apply(listener, target, [event]);
                } catch (error) {
                    const event = new ErrorEvent(LISTENER_ERROR, { error });
                    enqueue(target, event, null);
                }
            } else {
                static_cast<ObjectListener<Event>>(listener);
                try {
                    const { handleEvent } = listener;
                    if (typeof handleEvent === "function") Reflect.apply(handleEvent, listener, [event]);
                } catch (error) {
                    const event = new ErrorEvent(LISTENER_ERROR, { error });
                    enqueue(target, event, null);
                }
            }
        }
    }
}