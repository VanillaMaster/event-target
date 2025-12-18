import { EventTarget, setParent } from "#internal/EventTarget.js";
import { LISTENER_ADDED, LISTENER_REMOVED } from "#internal/channels.js"; 
import { AbortController } from "#internal/AbortController.js";
import { bitset as bitset0 } from "#internal/WeakKey.js";
import { bitset as bitset1 } from "#internal/DispatchContext.js";
import { Event } from "#internal/Event.js";

debugger;

const child = new EventTarget();
const parent = new EventTarget();
setParent(child, parent);

parent.addEventListener("foo", function(e) {
    console.log(e);
    debugger;
});

child.addEventListener("foo", function(e) {
    console.log(e);
    e.stopPropagation();
    debugger;
})

debugger;

child.dispatchEvent(new Event("foo", { bubbles: true }));

debugger

console.log(bitset0, bitset1);

debugger;