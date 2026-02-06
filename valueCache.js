/*
 * CACHING PRIMITIVES — STATIC TO DYNAMIC SPECTRUM
 * ================================================
 * 
 * STATIC ◄─────────────────────────────────────────────► DYNAMIC
 *   │                                                       │
 *   ▼                                                       ▼
 * memoizedFn ──► memoizedTTL ──► memoizedLRU ──► memoizedClear ──► computed
 * (forever)      (time-based)    (size-based)    (manual)         (auto deps)
 * 
 * ┌─────────────────┬───────────┬─────────────┬─────────────┬────────────┐
 * │                 │ memoizedFn│ memoizedTTL │ memoizedLRU │ computed   │
 * ├─────────────────┼───────────┼─────────────┼─────────────┼────────────┤
 * │ Cache result    │     ✓     │      ✓      │      ✓      │     ✓      │
 * │ Cycle detect    │     ✓     │      ✓      │      ✓      │     ✓      │
 * ├─────────────────┼───────────┼─────────────┼─────────────┼────────────┤
 * │ Invalidates     │   never   │  after TTL  │  on overflow│ on dep chg │
 * │ Memory bound    │    no     │     no      │     yes     │    no      │
 * │ Use case        │pure funcs │ external API│ limited mem │ reactive   │
 * └─────────────────┴───────────┴─────────────┴─────────────┴────────────┘
 * 
 * Common: all cache results, all detect cycles
 * Different: when/how cache invalidates
 */

// ============================================================================
// REACTIVE PRIMITIVES (DYNAMIC)
// ============================================================================

// val() - Mutable value wrapper
function val(v) {
	return {
		_v: v,
		get value() { return this._v },
		set value(v) { this._v = v }
	}
}

// computed() - Cached computation, recalculates when deps change
const computeStack = new Set()

function computed(deps, fn) {
	const node = {}
	let lastInputs = [], cached
	node.getValue = () => {
		if (computeStack.has(node)) throw new Error("Circular dependency")
		computeStack.add(node)
		try {
			const inputs = deps.map(d => d.value)
			const changed = inputs.some((v, i) => v !== lastInputs[i])
			if (changed) {
				cached = fn(...inputs)
				lastInputs = inputs
				console.log("  [recomputing]")
			}
			return cached
		} finally {
			computeStack.delete(node)
		}
	}
	return { get value() { return node.getValue() } }
}

// ============================================================================
// MEMOIZATION PRIMITIVES (STATIC → DYNAMIC)
// ============================================================================

const COMPUTING = Symbol('computing')

// memoizedFn() - Caches forever, detects same-args-in-flight cycles
function memoizedFn(fn) {
	const cache = new Map()

	return function memoized(...args) {
		const key = JSON.stringify(args)

		if (cache.has(key)) {
			const val = cache.get(key)
			if (val === COMPUTING) throw new Error(`Cycle at args: ${key}`)
			return val
		}

		cache.set(key, COMPUTING)
		const result = fn(...args)
		cache.set(key, result)
		return result
	}
}

// memoizedTTL() - Caches with expiration time
function memoizedTTL(fn, ttlMs = 5000) {
	const cache = new Map()

	return function (...args) {
		const key = JSON.stringify(args)
		const entry = cache.get(key)

		if (entry) {
			if (entry.value === COMPUTING) throw new Error(`Cycle at args: ${key}`)
			if (Date.now() < entry.expires) return entry.value
		}

		cache.set(key, { value: COMPUTING, expires: 0 })
		const result = fn(...args)
		cache.set(key, { value: result, expires: Date.now() + ttlMs })
		return result
	}
}

// memoizedLRU() - Caches with size limit, evicts oldest
function memoizedLRU(fn, maxSize = 100) {
	const cache = new Map()  // Map preserves insertion order

	return function (...args) {
		const key = JSON.stringify(args)

		if (cache.has(key)) {
			const val = cache.get(key)
			if (val === COMPUTING) throw new Error(`Cycle at args: ${key}`)
			cache.delete(key)      // remove
			cache.set(key, val)    // re-add as newest
			return val
		}

		cache.set(key, COMPUTING)
		const result = fn(...args)
		cache.set(key, result)

		if (cache.size > maxSize) {
			cache.delete(cache.keys().next().value)  // evict oldest
		}
		return result
	}
}

// memoizedClear() - Caches with manual invalidation
function memoizedClear(fn) {
	const cache = new Map()

	const memoized = (...args) => {
		const key = JSON.stringify(args)

		if (cache.has(key)) {
			const val = cache.get(key)
			if (val === COMPUTING) throw new Error(`Cycle at args: ${key}`)
			return val
		}

		cache.set(key, COMPUTING)
		const result = fn(...args)
		cache.set(key, result)
		return result
	}

	memoized.clear = () => cache.clear()
	memoized.invalidate = (...args) => cache.delete(JSON.stringify(args))

	return memoized
}

// ============================================================================
// DEMOS
// ============================================================================

console.log("=== computed() — reactive, invalidates on dep change ===")
let x = val(3)
let y = val(10)
let result = computed([x, y], (a, b) => a + b)
console.log("result.value:", result.value)   // computed, 13
console.log("result.value:", result.value)   // cached, 13
x.value = 5
console.log("x.value = 5")
console.log("result.value:", result.value)   // computed, 15
y.value = 20
console.log("y.value = 20")
console.log("result.value:", result.value)   // computed, 25
console.log("result.value:", result.value)   // cached, 25

console.log("\n=== memoizedFn() — static, caches forever ===")
const ack = memoizedFn((m, n) => {
	if (m === 0) return n + 1
	if (n === 0) return ack(m - 1, 1)
	return ack(m - 1, ack(m, n - 1))
})
console.log("ack(3,4) =", ack(3, 4))          // 125 (fast due to memoization)
console.log("ack(3,4) =", ack(3, 4))          // 125 (instant, cached)

console.log("\n=== memoizedClear() — manual invalidation ===")
const square = memoizedClear(x => { console.log("  [computing]"); return x * x })
console.log("square(5):", square(5))          // [computing], 25
console.log("square(5):", square(5))          // 25 (cached)
console.log("square.invalidate(5)")
square.invalidate(5)
console.log("square(5):", square(5))          // [computing], 25 (recomputed)