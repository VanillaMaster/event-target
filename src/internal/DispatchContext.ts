import { MASK } from "#internal/utils.js";

export interface DispatchContext_t {
    readonly mask: number;
    flags: number;
}

export const enum FLAGS {
    NONE             = 0x00,
    STOP_PROPAGATION = 0x01,
    ADVANCE_TARGET   = 0x02,
    PREVENT_DEFAULT  = 0x04,
    INTERNAL         = 0x08
}

export function create(mask: number): DispatchContext_t {
    return { flags: FLAGS.NONE, mask };
}

export let bitset = 0xFFFFFFFF | 0;

const pool: readonly DispatchContext_t[] = [
    create(MASK.BIT_32), create(MASK.BIT_31), create(MASK.BIT_30), create(MASK.BIT_29),
    create(MASK.BIT_28), create(MASK.BIT_27), create(MASK.BIT_26), create(MASK.BIT_25),
    create(MASK.BIT_24), create(MASK.BIT_23), create(MASK.BIT_22), create(MASK.BIT_21),
    create(MASK.BIT_20), create(MASK.BIT_19), create(MASK.BIT_18), create(MASK.BIT_17),
    create(MASK.BIT_16), create(MASK.BIT_15), create(MASK.BIT_14), create(MASK.BIT_13),
    create(MASK.BIT_12), create(MASK.BIT_11), create(MASK.BIT_10), create(MASK.BIT_09),
    create(MASK.BIT_08), create(MASK.BIT_07), create(MASK.BIT_06), create(MASK.BIT_05),
    create(MASK.BIT_04), create(MASK.BIT_03), create(MASK.BIT_02), create(MASK.BIT_01)
];

export function clear(instance: DispatchContext_t) {
    instance.flags = FLAGS.NONE;
}

export function free(instance: DispatchContext_t) {
    clear(instance);
    bitset |= instance.mask;
}

export function alloc(): DispatchContext_t {
    const i = Math.clz32(bitset);
    if (i === 32) return create(0);
    bitset &= ~(0x80000000 >>> i);
    return pool[i];
}