import { MASK } from "./utils.js";

export interface WeakKey {
    mask: number;
}

export function WeakKey(mask: number): WeakKey {
    return { mask };
}

let mask = 0xFFFFFFFF | 0;

const pool: readonly WeakKey[] = [
    WeakKey(MASK.BIT_32), WeakKey(MASK.BIT_31), WeakKey(MASK.BIT_30), WeakKey(MASK.BIT_29),
    WeakKey(MASK.BIT_28), WeakKey(MASK.BIT_27), WeakKey(MASK.BIT_26), WeakKey(MASK.BIT_25),
    WeakKey(MASK.BIT_24), WeakKey(MASK.BIT_23), WeakKey(MASK.BIT_22), WeakKey(MASK.BIT_21),
    WeakKey(MASK.BIT_20), WeakKey(MASK.BIT_19), WeakKey(MASK.BIT_18), WeakKey(MASK.BIT_17),
    WeakKey(MASK.BIT_16), WeakKey(MASK.BIT_15), WeakKey(MASK.BIT_14), WeakKey(MASK.BIT_13),
    WeakKey(MASK.BIT_12), WeakKey(MASK.BIT_11), WeakKey(MASK.BIT_10), WeakKey(MASK.BIT_09),
    WeakKey(MASK.BIT_08), WeakKey(MASK.BIT_07), WeakKey(MASK.BIT_06), WeakKey(MASK.BIT_05),
    WeakKey(MASK.BIT_04), WeakKey(MASK.BIT_03), WeakKey(MASK.BIT_02), WeakKey(MASK.BIT_01)
];

export function alloc(): WeakKey {
    const i = Math.clz32(mask);
    if (i === 32) return WeakKey(0);
    mask &= ~(0x80000000 >>> i);
    return pool[i];
}

export function free(instance: WeakKey) {
    mask |= instance.mask;
}