import { assert } from "#internal/utils.js";

/**
 * @internal
 * Exposed for debug purpose only
 * 
 * ---
 * 
 * 2 most significant bits do not participate in bitset
 * to satisfy v8's smi range
 * 
 * 0b1 - free object
 * 0b0 - used object
 */
export let bitset = 0x3FFFFFFF;

export class WeakKey {

    /**
     * First 2 elements are `null` and considered "used"
     * to avoid substracting amount of omitted MSB in bitset
     * 
     * @see {@link bitset}
     */
    static readonly pool: ReadonlyArray<WeakKey | null> = [
        null /* 0x80000000 */, null /* 0x40000000 */,
        WeakKey.create(0x20000000), WeakKey.create(0x10000000),
        WeakKey.create(0x08000000), WeakKey.create(0x04000000),
        WeakKey.create(0x02000000), WeakKey.create(0x01000000),
        WeakKey.create(0x00800000), WeakKey.create(0x00400000),
        WeakKey.create(0x00200000), WeakKey.create(0x00100000),
        WeakKey.create(0x00080000), WeakKey.create(0x00040000),
        WeakKey.create(0x00020000), WeakKey.create(0x00010000),
        WeakKey.create(0x00008000), WeakKey.create(0x00004000),
        WeakKey.create(0x00002000), WeakKey.create(0x00001000),
        WeakKey.create(0x00000800), WeakKey.create(0x00000400),
        WeakKey.create(0x00000200), WeakKey.create(0x00000100),
        WeakKey.create(0x00000080), WeakKey.create(0x00000040),
        WeakKey.create(0x00000020), WeakKey.create(0x00000010),
        WeakKey.create(0x00000008), WeakKey.create(0x00000004),
        WeakKey.create(0x00000002), WeakKey.create(0x00000001)
    ];

    /**
     * @internal
     */
    static create(mask: number): WeakKey {
        return new WeakKey(mask);
    }

    /**
     * Draw key from pool
     * 
     * Can produce non-managed keys if pool exhausted
     */
    static alloc(): WeakKey {
        const i = Math.clz32(bitset);
        if (i === 32) return WeakKey.create(0);
        bitset &= ~(0x80000000 >>> i);
        const key = WeakKey.pool[i];
        assert(key !== null);
        return key;
    }

    /**
     * Mark coresponding to `mask` key as free
     * 
     * No-op for non-managed key's mask
     */
    static free(mask: number) {
        assert((mask & bitset) === 0);
        bitset |= mask;
    }

    /**
     * Get key from pool by its slot index
     * 
     * Slot index can be computed from mask using `Math.clz32`
     */
    static get(i: number): WeakKey {
        assert(i < WeakKey.pool.length);
        const key = WeakKey.pool[i];
        assert(key !== null);
        return key;
    }

    private constructor(mask: number) {
        this.mask = mask;
    }

    /**
     * Mask coresponding to the key slot in the pool
     * 
     * `0` for non-managed keys
     */
    readonly mask: number;
}