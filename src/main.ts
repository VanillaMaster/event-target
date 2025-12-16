import { EventTarget } from "./EventTarget.js";
import { Event } from "./Event.js";
import { push, shift, sentinel } from "./EventQueue.js";

for (let i = 1; i <= 10; i++) {
    push(new Event(i.toString()));
}

for (let i = 0; i < 20; i++) {
    console.log(shift());
}

debugger