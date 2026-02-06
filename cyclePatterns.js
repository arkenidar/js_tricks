/*
 * CYCLE DETECTION PATTERN
 * =======================
 * Same algorithm, three domains:
 * 
 *        track state → detect revisit
 *                 │
 *    ┌────────────┼────────────┐
 *    │            │            │
 *    ▼            ▼            ▼
 * Division    Computed     MemoizedFn
 * (remainder)  (node)     (node+args)
 *    │            │            │
 *    ▼            ▼            ▼
 *  0.(3)       throw        throw
 *  valid       error     (same args in-flight)
 * 
 * Division:   state = remainder   → cycle = repeating decimal (valid)
 * Computed:   state = node        → cycle = any re-entry (error)
 * MemoizedFn: state = node + args → cycle = same args in-flight (error)
 *                                   different args = allowed (recursion)
 */

// Generic cycle detection - same pattern, domain-specific response
function cycleDetector(onCycle = "throw") {
    const seen = new Map()
    let position = 0
    return {
        check(state) {
            if (seen.has(state)) {
                if (onCycle === "throw") throw new Error("Cycle detected")
                return { cycle: true, start: seen.get(state), end: position }
            }
            seen.set(state, position++)
            return { cycle: false }
        },
        clear() { seen.clear(); position = 0 }
    }
}

// === Division: cycle = repeating decimal → encode as (...) ===

function divide(numerator, denominator) {
    if (denominator === 0) throw new Error("Division by zero")

    const sign = (numerator < 0) !== (denominator < 0) ? "-" : ""
    numerator = Math.abs(numerator)
    denominator = Math.abs(denominator)

    const intPart = Math.floor(numerator / denominator)
    let remainder = numerator % denominator

    if (remainder === 0) return sign + intPart

    const detector = cycleDetector("return")
    const decimals = []

    while (remainder !== 0) {
        const result = detector.check(remainder)
        if (result.cycle) {
            const nonRepeat = decimals.slice(0, result.start).join("")
            const repeat = decimals.slice(result.start).join("")
            return sign + intPart + "." + nonRepeat + "(" + repeat + ")"
        }
        remainder *= 10
        decimals.push(Math.floor(remainder / denominator))
        remainder %= denominator
    }
    return sign + intPart + "." + decimals.join("")
}

// === Computed: cycle = infinite recursion → throw error ===

function val(v) {
    return { _v: v, get value() { return this._v }, set value(v) { this._v = v } }
}

const computeStack = cycleDetector("throw")

function computed(deps, fn) {
    const node = Symbol()  // unique identity
    let lastInputs = [], cached
    return {
        get value() {
            computeStack.check(node)
            try {
                const inputs = deps.map(d => d.value)
                const changed = inputs.some((v, i) => v !== lastInputs[i])
                if (changed) { cached = fn(...inputs); lastInputs = inputs }
                return cached
            } finally {
                computeStack.clear()  // reset for next computation chain
            }
        }
    }
}

// === MemoizedFn: cycle = same args in-flight → throw, different args = ok ===

const COMPUTING = Symbol('computing')

function memoizedFn(fn) {
    const cache = new Map()

    return function memoized(...args) {
        const key = JSON.stringify(args)

        if (cache.has(key)) {
            const val = cache.get(key)
            if (val === COMPUTING) throw new Error(`Cycle at args: ${key}`)
            return val  // cached result
        }

        cache.set(key, COMPUTING)    // mark "in progress"
        const result = fn(...args)
        cache.set(key, result)       // store result
        return result
    }
}

// === Demo: Division ===
console.log("Division:")
console.log(divide(1, 3))    // 0.(3)
console.log(divide(1, 7))    // 0.(142857)
console.log(divide(1, 6))    // 0.1(6)
console.log(divide(1, 4))    // 0.25

// === Demo: Computed ===
console.log("\nComputed:")
let x = val(3)
let y = val(10)
let result = computed([x, y], (a, b) => a + b)
console.log(result.value)    // 13
x.value = 5
console.log(result.value)    // 15

// === Demo: MemoizedFn (Ackermann) ===
console.log("\nAckermann:")
const ack = memoizedFn((m, n) => {
    if (m === 0) return n + 1
    if (n === 0) return ack(m - 1, 1)
    return ack(m - 1, ack(m, n - 1))
})
console.log("ack(3,4)  =", ack(3, 4))   // 125
console.log("ack(3,10) =", ack(3, 10))  // 8189 — fast with cache
