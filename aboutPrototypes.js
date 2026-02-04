// ============================================================================
// THE POWER OF PROTOTYPES IN JAVASCRIPT
// ============================================================================

// JavaScript is a prototype-based language. Unlike classical OOP languages
// (Java, C++), objects inherit directly from other objects.

// =============================================================================
// PART 1: PROTOTYPE FUNDAMENTALS
// =============================================================================

// Every object has an internal [[Prototype]] link to another object
const animal = {
    isAlive: true,
    breathe() {
        console.log('Breathing...');
    }
};

// Object.create() creates a new object with specified prototype
const dog = Object.create(animal);
dog.bark = function () {
    console.log('Woof!');
};

console.log('--- Prototype Fundamentals ---');
console.log(dog.isAlive);      // true (inherited from animal)
dog.breathe();                  // "Breathing..." (inherited)
dog.bark();                     // "Woof!" (own property)

// Check prototype chain
console.log(Object.getPrototypeOf(dog) === animal); // true


// =============================================================================
// PART 2: CONSTRUCTOR FUNCTIONS (Pre-ES6 Classes)
// =============================================================================

// Constructor functions create objects with shared prototypes
function Person(name, age) {
    // Instance properties (unique per instance)
    this.name = name;
    this.age = age;
}

// Prototype methods (shared across ALL instances - memory efficient!)
Person.prototype.greet = function () {
    console.log(`Hi, I'm ${this.name}`);
};

Person.prototype.birthday = function () {
    this.age++;
    console.log(`${this.name} is now ${this.age}`);
};

const alice = new Person('Alice', 30);
const bob = new Person('Bob', 25);

console.log('\n--- Constructor Functions ---');
alice.greet();  // "Hi, I'm Alice"
bob.greet();    // "Hi, I'm Bob"

// Both share the SAME function reference (memory efficient)
console.log(alice.greet === bob.greet); // true


// =============================================================================
// PART 3: PROTOTYPE CHAIN (Inheritance)
// =============================================================================

function Animal(name) {
    this.name = name;
}

Animal.prototype.speak = function () {
    console.log(`${this.name} makes a sound`);
};

function Dog(name, breed) {
    Animal.call(this, name);  // Call parent constructor
    this.breed = breed;
}

// Set up inheritance: Dog.prototype -> Animal.prototype
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;  // Fix constructor reference

// Override parent method
Dog.prototype.speak = function () {
    console.log(`${this.name} barks!`);
};

// Add new method
Dog.prototype.fetch = function () {
    console.log(`${this.name} fetches the ball`);
};

const rex = new Dog('Rex', 'German Shepherd');

console.log('\n--- Prototype Chain ---');
rex.speak();   // "Rex barks!" (overridden)
rex.fetch();   // "Rex fetches the ball"
console.log(rex instanceof Dog);    // true
console.log(rex instanceof Animal); // true


// =============================================================================
// PART 4: ES6 CLASSES (Syntactic Sugar over Prototypes!)
// =============================================================================

// ES6 classes are NOT real classes - they're prototype-based under the hood!

class Vehicle {
    constructor(brand) {
        this.brand = brand;  // Instance property
    }

    // This goes on Vehicle.prototype
    start() {
        console.log(`${this.brand} starting...`);
    }

    // Static method (on the class itself, not prototype)
    static compare(v1, v2) {
        return v1.brand === v2.brand;
    }
}

class Car extends Vehicle {
    constructor(brand, model) {
        super(brand);        // Call parent constructor
        this.model = model;
    }

    // Overrides Vehicle.prototype.start
    start() {
        super.start();       // Call parent method
        console.log(`${this.model} engine revving!`);
    }

    // New method on Car.prototype
    drive() {
        console.log(`Driving ${this.brand} ${this.model}`);
    }
}

const tesla = new Car('Tesla', 'Model S');

console.log('\n--- ES6 Classes (Still Prototypes!) ---');
tesla.start();  // "Tesla starting..." then "Model S engine revving!"
tesla.drive();  // "Driving Tesla Model S"

// PROOF: ES6 classes are prototype-based
console.log(typeof Car);                              // "function"
console.log(Car.prototype.drive === tesla.drive);     // true
console.log(Object.getPrototypeOf(tesla) === Car.prototype); // true


// =============================================================================
// PART 5: THE POWER OF PROTOTYPES
// =============================================================================

console.log('\n--- Power of Prototypes ---');

// POWER 1: Dynamic Method Addition (even after object creation!)
class User {
    constructor(name) {
        this.name = name;
    }
}

const user1 = new User('John');

// Add method AFTER object was created - it still works!
User.prototype.sayHello = function () {
    console.log(`Hello from ${this.name}`);
};

user1.sayHello();  // "Hello from John" - Works!

// POWER 2: Extend Built-in Objects (use with caution!)
Array.prototype.first = function () {
    return this[0];
};

Array.prototype.last = function () {
    return this[this.length - 1];
};

const nums = [1, 2, 3, 4, 5];
console.log(nums.first()); // 1
console.log(nums.last());  // 5

// POWER 3: Memory Efficiency
// 1000 instances share ONE prototype method, not 1000 copies
function createManyObjects() {
    const instances = [];
    for (let i = 0; i < 1000; i++) {
        instances.push(new Person(`Person${i}`, 20 + i));
    }
    return instances;
}

// All 1000 objects share the SAME greet function
const people = createManyObjects();
console.log(people[0].greet === people[999].greet); // true

// POWER 4: Mixins (Multiple Behavior Composition)
const canSwim = {
    swim() {
        console.log(`${this.name} is swimming`);
    }
};

const canFly = {
    fly() {
        console.log(`${this.name} is flying`);
    }
};

class Duck {
    constructor(name) {
        this.name = name;
    }
}

// Mix in multiple behaviors
Object.assign(Duck.prototype, canSwim, canFly);

const donald = new Duck('Donald');
donald.swim();  // "Donald is swimming"
donald.fly();   // "Donald is flying"


// =============================================================================
// PART 6: PROTOTYPE VS CLASS COMPARISON
// =============================================================================

console.log('\n--- Prototype vs Class Comparison ---');

// PROTOTYPE-BASED (Pre-ES6)
function ProtoAnimal(name) {
    this.name = name;
}
ProtoAnimal.prototype.speak = function () {
    return `${this.name} speaks`;
};

// ES6 CLASS (Same thing, nicer syntax)
class ClassAnimal {
    constructor(name) {
        this.name = name;
    }
    speak() {
        return `${this.name} speaks`;
    }
}

// They're functionally identical!
const proto = new ProtoAnimal('Proto');
const classy = new ClassAnimal('Classy');

console.log(proto.speak());   // "Proto speaks"
console.log(classy.speak());  // "Classy speaks"

// Both use prototypes
console.log(typeof ProtoAnimal.prototype.speak); // "function"
console.log(typeof ClassAnimal.prototype.speak); // "function"


// =============================================================================
// PART 7: ADVANCED - PROTOTYPE INSPECTION
// =============================================================================

console.log('\n--- Prototype Inspection ---');

// Get the prototype of an object
console.log(Object.getPrototypeOf(tesla));         // Car.prototype
console.log(Object.getPrototypeOf(Car.prototype)); // Vehicle.prototype

// Check prototype chain
console.log(tesla instanceof Car);      // true
console.log(tesla instanceof Vehicle);  // true
console.log(tesla instanceof Object);   // true

// Check own vs inherited properties
console.log(tesla.hasOwnProperty('brand')); // true (own)
console.log(tesla.hasOwnProperty('start')); // false (inherited)
console.log('start' in tesla);               // true (exists via prototype)

// List all properties (own + inherited)
for (let prop in tesla) {
    const own = tesla.hasOwnProperty(prop) ? '(own)' : '(inherited)';
    console.log(`  ${prop} ${own}`);
}


/*
 * ============================================================================
 * DOCUMENTATION: JavaScript Prototypes
 * ============================================================================
 *
 * WHAT ARE PROTOTYPES?
 * Every JavaScript object has a hidden [[Prototype]] link to another object.
 * When accessing a property, JS looks up the prototype chain until found.
 *
 * PROTOTYPE CHAIN:
 *   myDog -> Dog.prototype -> Animal.prototype -> Object.prototype -> null
 *
 * WHY PROTOTYPES ARE POWERFUL:
 *
 * 1. MEMORY EFFICIENCY
 *    - Methods defined on prototype are shared by ALL instances
 *    - 1000 objects = 1 function in memory, not 1000 copies
 *
 * 2. DYNAMIC MODIFICATION
 *    - Add methods to prototype anytime, even after object creation
 *    - All existing instances immediately gain the new method
 *
 * 3. INHERITANCE WITHOUT CLASSES
 *    - Objects inherit directly from objects
 *    - More flexible than classical inheritance
 *
 * 4. MIXINS & COMPOSITION
 *    - Easily combine behaviors from multiple sources
 *    - More flexible than single inheritance
 *
 * ES6 CLASSES:
 * - Syntactic sugar over prototypes (NOT real classes!)
 * - `class` keyword compiles to constructor functions
 * - `extends` sets up prototype chain
 * - `super` calls parent constructor/methods
 * - Methods still go on .prototype
 *
 * BEST PRACTICES:
 * - Use ES6 classes for cleaner syntax
 * - Understand prototypes for debugging
 * - Don't extend built-in prototypes in libraries
 * - Prefer composition (mixins) over deep inheritance
 *
 * COMMON PATTERNS:
 *
 *   // Check prototype
 *   Object.getPrototypeOf(obj)
 *
 *   // Set prototype
 *   Object.setPrototypeOf(obj, proto)  // Slow, avoid
 *   Object.create(proto)               // Preferred
 *
 *   // Check inheritance
 *   obj instanceof Constructor
 *   Constructor.prototype.isPrototypeOf(obj)
 *
 *   // Own vs inherited
 *   obj.hasOwnProperty('prop')
 *   'prop' in obj  // includes inherited
 *
 * USAGE:
 *   node aboutPrototypes.js
 *
 * ============================================================================
 */
