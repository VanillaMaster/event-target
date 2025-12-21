import { EventTarget, setParent } from "#internal/EventTarget.js";
import { LISTENER_ADDED, LISTENER_REMOVED } from "#internal/channels.js"; 
import { AbortController } from "#internal/AbortController.js";
import { bitset as bitset0 } from "#internal/WeakKey.js";
import { bitset as bitset1 } from "#internal/DispatchContext.js";
import { Event } from "#internal/Event.js";

// const controller = new AbortController();
// const { signal } = controller;

const target = new EventTarget();
let gc = true;
const registry = new FinalizationRegistry(function() { debugger; gc = false; });
let wr;
void function(){
    function cb(...args) { console.log(args); }
    wr = new WeakRef(cb);
    target.addEventListener("foo", cb, { weak: true });
    registry.register(cb, 0);
}();

// target.dispatchEvent(new Event("foo"));

debugger;

globalThis.gc();

while (gc) {
    await new Promise(function(resolve) { setTimeout(resolve, 0) });
}

debugger;

console.log(bitset0, bitset1);

debugger;