import { EventTarget } from "#internal/EventTarget.js";
import { LISTENER_ADDED, LISTENER_REMOVED } from "#internal/channels.js"; 
import { AbortController } from "#internal/AbortController.js";
import { bitset as bitset0 } from "#internal/WeakKey.js";
import { bitset as bitset1 } from "#internal/DispatchContext.js";

debugger;

const target = new EventTarget();
const controller = new AbortController();

debugger;

target.addEventListener(LISTENER_REMOVED, function(event) {
    console.log(event);
    debugger;
});

target.addEventListener(LISTENER_ADDED, function(event) {
    console.log(event);
    debugger;
}, { signal: controller.signal });

debugger;

controller.abort();

debugger;

console.log(bitset0, bitset1);

debugger;