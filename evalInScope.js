// evalInScope.js

// Source - https://stackoverflow.com/a/25859853
// Posted by Campbeln, modified by community. See post 'Timeline' for change history
// Retrieved 2026-01-17, License - CC BY-SA 4.0

function evalInScope(js, contextAsScope) {
    //# Return the results of the in-line anonymous function we .call with the passed context
    ///return function () { with (this) { return eval(js); }; }.call(contextAsScope);
    const keys = Object.keys(contextAsScope);
    const values = Object.values(contextAsScope);
    const func = new Function(...keys, `return (${js});`);
    return func(...values);
}

console.log(evalInScope('a + b', { a: 2, b: 3 })); // Outputs: 5
console.log(evalInScope('Math.max(x, y)', { x: 10, y: 20 })); // Outputs: 20