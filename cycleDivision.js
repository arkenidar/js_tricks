// Division with cycle detection for repeating decimals

function divide(numerator, denominator) {
    if (denominator === 0) throw new Error("Division by zero")

    const sign = (numerator < 0) !== (denominator < 0) ? "-" : ""
    numerator = Math.abs(numerator)
    denominator = Math.abs(denominator)

    const intPart = Math.floor(numerator / denominator)
    let remainder = numerator % denominator

    if (remainder === 0) return sign + intPart

    const seen = new Map()  // remainder → position (cycle detection)
    const decimals = []

    while (remainder !== 0) {
        if (seen.has(remainder)) {
            // Cycle detected! Same remainder = same future
            const cycleStart = seen.get(remainder)
            const nonRepeat = decimals.slice(0, cycleStart).join("")
            const repeat = decimals.slice(cycleStart).join("")
            return sign + intPart + "." + nonRepeat + "(" + repeat + ")"
        }

        seen.set(remainder, decimals.length)
        remainder *= 10
        decimals.push(Math.floor(remainder / denominator))
        remainder %= denominator
    }

    // Terminates (no cycle)
    return sign + intPart + "." + decimals.join("")
}

// Demo
console.log(divide(1, 3))    // 0.(3)
console.log(divide(1, 7))    // 0.(142857)
console.log(divide(1, 6))    // 0.1(6)
console.log(divide(22, 7))   // 3.(142857)
console.log(divide(1, 4))    // 0.25
console.log(divide(1, 81))   // 0.(012345679)
console.log(divide(-5, 3))   // -1.(6)
