import { assert, MASK } from "./utils.js";

export interface DispatchContext {
    readonly mask: number;
    flags: number;
}

function DispatchContext(mask: number): DispatchContext {
    return { flags: FLAGS.NONE, mask };
}

let mask = 0xFFFFFFFF | 0;

const pool: readonly DispatchContext[] = [
    DispatchContext(MASK.BIT_32), DispatchContext(MASK.BIT_31), DispatchContext(MASK.BIT_30), DispatchContext(MASK.BIT_29),
    DispatchContext(MASK.BIT_28), DispatchContext(MASK.BIT_27), DispatchContext(MASK.BIT_26), DispatchContext(MASK.BIT_25),
    DispatchContext(MASK.BIT_24), DispatchContext(MASK.BIT_23), DispatchContext(MASK.BIT_22), DispatchContext(MASK.BIT_21),
    DispatchContext(MASK.BIT_20), DispatchContext(MASK.BIT_19), DispatchContext(MASK.BIT_18), DispatchContext(MASK.BIT_17),
    DispatchContext(MASK.BIT_16), DispatchContext(MASK.BIT_15), DispatchContext(MASK.BIT_14), DispatchContext(MASK.BIT_13),
    DispatchContext(MASK.BIT_12), DispatchContext(MASK.BIT_11), DispatchContext(MASK.BIT_10), DispatchContext(MASK.BIT_09),
    DispatchContext(MASK.BIT_08), DispatchContext(MASK.BIT_07), DispatchContext(MASK.BIT_06), DispatchContext(MASK.BIT_05),
    DispatchContext(MASK.BIT_04), DispatchContext(MASK.BIT_03), DispatchContext(MASK.BIT_02), DispatchContext(MASK.BIT_01)
];

export function free(instance: DispatchContext) {
    mask |= instance.mask;
}

export function alloc(): DispatchContext {
    const i = Math.clz32(mask);
    if (i === 32) return DispatchContext(0);
    mask &= ~(0x80000000 >>> i);
    return pool[i];
}

export const enum FLAGS {
    NONE             = 0x00,
    STOP_PROPAGATION = 0x01,
    ADVANCE_TARGET   = 0x02,
    PREVENT_DEFAULT  = 0x04
}