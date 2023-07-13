const assert = require("assert");
const { getCurveFromName } = require("ffjavascript");
const { Polynomial } = require("../src/polynomial/polynomial.js");
const { getRandomPolynomialByLength } = require("./test.utils.js");

const kzg_basic_prover = require("../src/kzg_basic_prover.js");
const kzg_basic_verifier = require("../src/kzg_basic_verifier.js");

const Logger = require("logplease");
const logger = Logger.create("", { showTimestamp: false });
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

    it("should perform a basic ZKG full proving & verifying process", async () => {
        const pol = getRandomPolynomialByLength(2 ** 4, curve);
        const proof = await kzg_basic_prover({ logger });

        const verify = await kzg_basic_verifier(proof, { logger });
        assert.equal(0, verify);
    });
});
