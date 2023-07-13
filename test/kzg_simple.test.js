const assert = require("assert");
const { getCurveFromName } = require("ffjavascript");
const { Polynomial } = require("../src/polynomial/polynomial.js");
const { getRandomPolynomial } = require("./test.utils.js");

const kzg_prove = require("../src/kzg_prove.js");

const Logger = require("logplease");
const logger = Logger.create("snarkJS", { showTimestamp: false });
Logger.setLogLevel("INFO");

describe("grand-sums-study: KZG simple test", function () {
  this.timeout(500000);

  let curve;

  before(async () => {
    curve = await getCurveFromName("bn128");
  });

  after(async () => {
    await curve.terminate();
  });

  it("should return the correct response", async () => {
    const pol = getRandomPolynomial(2, curve);
    const ret = await kzg_prove("xxx", { logger });
    assert.equal(0, ret);
  });
});
