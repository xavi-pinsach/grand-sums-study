const { Polynomial } = require("../src/polynomial/polynomial.js");

function getRandomValue(higher = 10) {
    if(higher < 1) return 1;
    return Math.ceil(Math.random() * higher);
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

function getRandomPolynomialByLength(degree, Fr) {
    return new Polynomial(getRandomBuffer(2 ** degree, Fr), curve);
}

module.exports.getRandomValue = getRandomValue;
module.exports.getRandomArray = getRandomArray;
module.exports.getRandomBuffer = getRandomBuffer;
module.exports.getRandomPolynomialByLength = getRandomPolynomialByLength;
