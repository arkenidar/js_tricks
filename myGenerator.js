// Emulating a generator with closures

function createGenerator(array) {
    let index = 0;

    return {
        next: function () {
            if (index < array.length) {
                return { value: array[index++], done: false };
            }
            return { value: undefined, done: true };
        }
    };
}

// Usage example
const gen = createGenerator([1, 2, 3, 4, 5]);

console.log(gen.next()); // { value: 1, done: false }
console.log(gen.next()); // { value: 2, done: false }
console.log(gen.next()); // { value: 3, done: false }
console.log(gen.next()); // { value: 4, done: false }
console.log(gen.next()); // { value: 5, done: false }
console.log(gen.next()); // { value: undefined, done: true }

// Range generator using closures
function createRangeGenerator(start, end, step = 1) {
    let current = start;

    return {
        next: function () {
            if (current < end) {
                const value = current;
                current += step;
                return { value, done: false };
            }
            return { value: undefined, done: true };
        },
        // Make it iterable
        [Symbol.iterator]: function () {
            return this;
        }
    };
}

// Usage
const range = createRangeGenerator(0, 10, 2);
console.log('\nRange generator (0 to 10, step 2):');
for (const num of range) {
    console.log(num); // 0, 2, 4, 6, 8
}


/*
 * ============================================================================
 * DOCUMENTATION: Generator Emulation with Closures
 * ============================================================================
 *
 * WHAT IS A GENERATOR?
 * A generator is a function that can be paused and resumed, yielding multiple
 * values over time. In JavaScript, generators use the function* syntax and
 * the yield keyword.
 *
 * WHY EMULATE GENERATORS?
 * - To understand how generators maintain state between calls
 * - For environments that don't support generator syntax
 * - To create custom iteration behavior
 *
 * HOW IT WORKS:
 * Generators maintain internal state between calls to next(). We emulate this
 * by using closures to capture and preserve state variables.
 *
 * TECHNIQUES DEMONSTRATED:
 *
 * 1. ARRAY GENERATOR (createGenerator)
 *    - Captures `index` variable in a closure
 *    - Each call to next() increments index and returns next value
 *    - Returns { value, done } object matching Iterator protocol
 *
 *    Implementation:
 *    - Closure captures: array, index
 *    - next() checks bounds, returns value or done signal
 *
 * 2. RANGE GENERATOR (createRangeGenerator)
 *    - Generates numbers from start to end with configurable step
 *    - Implements [Symbol.iterator] for for...of compatibility
 *    - More flexible than array-based generator
 *
 *    Implementation:
 *    - Closure captures: current, end, step
 *    - next() increments current by step until >= end
 *
 * ITERATOR PROTOCOL:
 * Both generators return objects conforming to the Iterator protocol:
 *   { value: any, done: boolean }
 *
 * - done: false → more values available
 * - done: true  → iteration complete (value is undefined)
 *
 * MAKING IT ITERABLE:
 * By implementing [Symbol.iterator], the generator can be used in:
 * - for...of loops
 * - spread operator [...generator]
 * - Array.from(generator)
 *
 * COMPARISON WITH NATIVE GENERATORS:
 *
 *   // Native generator
 *   function* range(start, end, step = 1) {
 *     for (let i = start; i < end; i += step) {
 *       yield i;
 *     }
 *   }
 *
 *   // Our closure-based emulation achieves the same result
 *   // but with explicit state management
 *
 * USAGE:
 *   node myGenerator.js
 *
 * ============================================================================
 */
