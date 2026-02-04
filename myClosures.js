// Emulating closures using objects (for languages without native closures)

// In JavaScript, closures are native. But we can emulate them with objects
// to understand how they work under the hood.

// A closure is essentially: a function + its captured environment

// --- Closure emulation using an object ---

function createClosureEmulation() {
    // The "environment" object holds captured variables
    const environment = {
        counter: 0
    };

    // The "function" that uses the environment
    return {
        env: environment,
        increment: function () {
            this.env.counter++;
            return this.env.counter;
        },
        decrement: function () {
            this.env.counter--;
            return this.env.counter;
        },
        getValue: function () {
            return this.env.counter;
        }
    };
}

const closure1 = createClosureEmulation();
const closure2 = createClosureEmulation();

console.log('Closure emulation with objects:');
console.log(closure1.increment()); // 1
console.log(closure1.increment()); // 2
console.log(closure2.increment()); // 1 (separate environment)
console.log(closure1.getValue()); // 2


// --- Compare with real closure ---

function createRealClosure() {
    let counter = 0; // This is captured in the closure

    return {
        increment: () => ++counter,
        decrement: () => --counter,
        getValue: () => counter
    };
}

const realClosure = createRealClosure();
console.log('\nReal closure:');
console.log(realClosure.increment()); // 1
console.log(realClosure.increment()); // 2


// --- Class-based closure emulation ---

class ClosureEmulator {
    #privateState; // Private field acts like closed-over variable

    constructor(initialValue = 0) {
        this.#privateState = initialValue;
    }

    createClosure() {
        // Return functions that access the private state
        const self = this;
        return {
            get: () => self.#privateState,
            set: (val) => { self.#privateState = val; },
            modify: (fn) => { self.#privateState = fn(self.#privateState); }
        };
    }
}

const emulator = new ClosureEmulator(10);
const closureLike = emulator.createClosure();

console.log('\nClass-based closure emulation:');
console.log(closureLike.get()); // 10
closureLike.set(42);
console.log(closureLike.get()); // 42
closureLike.modify(x => x * 2);
console.log(closureLike.get()); // 84


// --- Manual closure using function + state binding ---

function manualClosure(fn, capturedVars) {
    return function (...args) {
        return fn.call(capturedVars, ...args);
    };
}

const addToCounter = manualClosure(
    function (amount) {
        this.count += amount;
        return this.count;
    },
    { count: 0 }
);

console.log('\nManual closure with binding:');
console.log(addToCounter(5));  // 5
console.log(addToCounter(3));  // 8
console.log(addToCounter(2));  // 10


/*
 * ============================================================================
 * DOCUMENTATION: Closure Emulation Techniques
 * ============================================================================
 *
 * WHAT IS A CLOSURE?
 * A closure is a function bundled together with references to its surrounding
 * state (the lexical environment). It gives the function access to variables
 * from an outer scope even after that scope has finished executing.
 *
 * WHY EMULATE CLOSURES?
 * - To understand how closures work internally
 * - For languages that don't support closures natively
 * - To create explicit, inspectable state management
 *
 * TECHNIQUES DEMONSTRATED:
 *
 * 1. OBJECT-BASED EMULATION (createClosureEmulation)
 *    - Creates an explicit "environment" object to hold state
 *    - Returns an object with methods that reference this environment
 *    - Pros: State is inspectable, easy to understand
 *    - Cons: More verbose, `this` binding required
 *
 * 2. REAL CLOSURE COMPARISON (createRealClosure)
 *    - Native JavaScript closure for comparison
 *    - Variable `counter` is captured in the closure automatically
 *    - Pros: Concise, idiomatic
 *    - Cons: State is hidden, harder to debug
 *
 * 3. CLASS-BASED EMULATION (ClosureEmulator)
 *    - Uses private fields (#privateState) as closed-over variables
 *    - Methods provide controlled access to private state
 *    - Pros: Encapsulation, familiar OOP pattern
 *    - Cons: Requires ES2022+ for private fields
 *
 * 4. MANUAL BINDING (manualClosure)
 *    - Binds a state object to a function using .call()
 *    - State accessed via `this` inside the function
 *    - Pros: Flexible, works with any function
 *    - Cons: Requires understanding of `this` binding
 *
 * KEY INSIGHT:
 * Closure = Function + Environment
 * All emulation techniques follow this pattern by explicitly managing
 * the "environment" that would normally be captured implicitly.
 *
 * USAGE:
 *   node myClosures.js
 *
 * ============================================================================
 */
