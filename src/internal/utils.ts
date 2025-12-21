class AssertionError extends Error {
    static {
        Object.defineProperty(AssertionError.prototype, "name", {
            value: "AssertionError",
            enumerable: false
        });
    }
}

interface ErrorConstructor {
    new(message?: string): Error
}
/**
 * @__NO_SIDE_EFFECTS__
 */
export function assert(ok: boolean, message?: string, Error: ErrorConstructor = AssertionError): asserts ok {
    if (!ok) throw new Error(message);
}

/**
 * @__NO_SIDE_EFFECTS__
 */
export function static_cast<T>(value: unknown): asserts value is T {}


export function assertNotNull<T>(value: T | null, message?: string, Error: ErrorConstructor = AssertionError ): T {
    assert(value !== null, message, Error);
    return value;
}

export const enum MASK {
    BIT_32 = 0x80000000 | 0,
    BIT_31 = 0x40000000 | 0,
    BIT_30 = 0x20000000 | 0,
    BIT_29 = 0x10000000 | 0,
    BIT_28 = 0x08000000 | 0,
    BIT_27 = 0x04000000 | 0,
    BIT_26 = 0x02000000 | 0,
    BIT_25 = 0x01000000 | 0,
    BIT_24 = 0x00800000 | 0,
    BIT_23 = 0x00400000 | 0,
    BIT_22 = 0x00200000 | 0,
    BIT_21 = 0x00100000 | 0,
    BIT_20 = 0x00080000 | 0,
    BIT_19 = 0x00040000 | 0,
    BIT_18 = 0x00020000 | 0,
    BIT_17 = 0x00010000 | 0,
    BIT_16 = 0x00008000 | 0,
    BIT_15 = 0x00004000 | 0,
    BIT_14 = 0x00002000 | 0,
    BIT_13 = 0x00001000 | 0,
    BIT_12 = 0x00000800 | 0,
    BIT_11 = 0x00000400 | 0,
    BIT_10 = 0x00000200 | 0,
    BIT_09 = 0x00000100 | 0,
    BIT_08 = 0x00000080 | 0,
    BIT_07 = 0x00000040 | 0,
    BIT_06 = 0x00000020 | 0,
    BIT_05 = 0x00000010 | 0,
    BIT_04 = 0x00000008 | 0,
    BIT_03 = 0x00000004 | 0,
    BIT_02 = 0x00000002 | 0,
    BIT_01 = 0x00000001 | 0
}