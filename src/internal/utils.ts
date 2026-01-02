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
export function assert(ok: boolean, message?: string, Constructor: ErrorConstructor = AssertionError): asserts ok {
    if (!ok) throw new Constructor(message);
}

/**
 * @__NO_SIDE_EFFECTS__
 */
export function static_cast<T>(_value: unknown): asserts _value is T {}


export function assertNotNull<T>(value: T | null, message?: string, Constructor: ErrorConstructor = AssertionError ): T {
    assert(value !== null, message, Constructor);
    return value;
}