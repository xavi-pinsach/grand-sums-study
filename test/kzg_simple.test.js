const assert = require("assert");
// import {getCurveFromName} from "../src/curves.js";
// import {Polynomial} from "../src/polynomial/polynomial.js";
// import {getRandomBuffer, getRandomValue} from "./test.utils.js";
const kzg_prove = require("../src/kzg_prove.js");

// function radomPolynomial(maxDegree, curve) {
//     const degree = getRandomValue(maxDegree);

//     return new Polynomial(getRandomBuffer(degree + 1, curve.Fr), curve);
// }

const Logger = require("logplease");
const logger = Logger.create("snarkJS", { showTimestamp: false });
Logger.setLogLevel("INFO");

describe("grand-sums-study: KZG simple test", function () {
  this.timeout(500000);

  // let curve;
  // let sFr;

  // before(async () => {
  //     curve = await getCurveFromName("bn128");
  //     sFr = curve.Fr.n8;
  // });

  // after(async () => {
  //     await curve.terminate();
  // });

  it("should return the correct response", async () => {
    const ret = await kzg_prove("xxx", { logger });
    assert.equal(0, ret);
  });
});
