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

export class DispatchContext {

    static readonly NONE             = 0x00;
    static readonly STOP_PROPAGATION = 0x01;
    static readonly STOP_LISTENERS   = 0x02;
    static readonly PREVENT_DEFAULT  = 0x04;
    static readonly INTERNAL         = 0x08;

    /**
     * First 2 elements are `null` and considered "used"
     * to avoid substracting amount of omitted MSB in bitset
     * 
     * @see {@link bitset}
     */
    static readonly pool: ReadonlyArray<DispatchContext | null> = [
        null /* 0x80000000 */, null /* 0x40000000 */,
        DispatchContext.create(0x20000000), DispatchContext.create(0x10000000),
        DispatchContext.create(0x08000000), DispatchContext.create(0x04000000),
        DispatchContext.create(0x02000000), DispatchContext.create(0x01000000),
        DispatchContext.create(0x00800000), DispatchContext.create(0x00400000),
        DispatchContext.create(0x00200000), DispatchContext.create(0x00100000),
        DispatchContext.create(0x00080000), DispatchContext.create(0x00040000),
        DispatchContext.create(0x00020000), DispatchContext.create(0x00010000),
        DispatchContext.create(0x00008000), DispatchContext.create(0x00004000),
        DispatchContext.create(0x00002000), DispatchContext.create(0x00001000),
        DispatchContext.create(0x00000800), DispatchContext.create(0x00000400),
        DispatchContext.create(0x00000200), DispatchContext.create(0x00000100),
        DispatchContext.create(0x00000080), DispatchContext.create(0x00000040),
        DispatchContext.create(0x00000020), DispatchContext.create(0x00000010),
        DispatchContext.create(0x00000008), DispatchContext.create(0x00000004),
        DispatchContext.create(0x00000002), DispatchContext.create(0x00000001)
    ];

    /**
     * @internal
     */
    static create(mask: number): DispatchContext {
        return new DispatchContext(mask);
    }

    static clear(instance: DispatchContext) {
        instance.flags = DispatchContext.NONE;
    }

    /**
     * Return instance into pool
     * 
     * No-op for non-managed instances
     */
    static free(instance: DispatchContext) {
        assert((instance.mask & bitset) === 0);
        DispatchContext.clear(instance);
        bitset |= instance.mask;
    }

    /**
     * Draw instance from pool
     * 
     * Can produce non-managed instance if pool exhausted
     */
    static alloc(): DispatchContext {
        const i = Math.clz32(bitset);
        if (i === 32) return DispatchContext.create(0);
        bitset &= ~(0x80000000 >>> i);
        const instance = DispatchContext.pool[i];
        assert(instance !== null);
        return instance;
    }

    private constructor(mask: number) {
        this.mask = mask;
    }

    /**
     * Mask coresponding to the instance slot in the pool
     * 
     * `0` for non-managed instances
     */
    private readonly mask: number;

    flags: number = DispatchContext.NONE;

}