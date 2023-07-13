const { Polynomial } = require("../src/polynomial/polynomial.js");

function getRandomValue(higher = 10) {
    return Math.floor(Math.random() * higher + 1);
}

function getRandomArray(length, Fr) {
    let buffer = [];
    for (let i = 0; i < length; i++) {
        buffer[i] = Fr.random();
    }
    return buffer;
}

function getRandomBuffer(length, Fr) {
    let buffer = new Uint8Array(length * Fr.n8);
    for (let i = 0; i < length; i++) {
        buffer.set(Fr.random(), i * Fr.n8);
    }
    return buffer;
}

function getRandomPolynomialByLength(length, curve) {
    return new Polynomial(getRandomBuffer(length, curve.Fr), curve);
}

module.exports.getRandomValue = getRandomValue;
module.exports.getRandomArray = getRandomArray;
module.exports.getRandomBuffer = getRandomBuffer;
module.exports.getRandomPolynomialByLength = getRandomPolynomialByLength;
