const assert = require("assert");
const { getCurveFromName } = require("ffjavascript");
const { getRandomPolynomialByLength } = require("./test.utils.js");
const path = require("path");

const kzg_basic_prover = require("../src/kzg_basic_prover.js");
const kzg_basic_verifier = require("../src/kzg_basic_verifier.js");

const Logger = require("logplease");
const logger = Logger.create("", { showTimestamp: false });
Logger.setLogLevel("INFO");

describe("grand-sums-study: KZG basic (1 polynomial) test", function () {
    this.timeout(500000);

    let curve;

    before(async () => {
        curve = await getCurveFromName("bn128");
    });

    after(async () => {
        await curve.terminate();
    });

    it("should perform a ZKG full proving & verifying process with ONE polynomial", async () => {
        const pol = getRandomPolynomialByLength(2 ** 4, curve);

        const pTauFilename = path.join("tmp", "powersOfTau28_hez_final_15.ptau");
        const proof = await kzg_basic_prover(pol, pTauFilename, { logger });

        const verify = await kzg_basic_verifier(proof, pTauFilename, { logger });
        assert.equal(0, verify);
    });
});
