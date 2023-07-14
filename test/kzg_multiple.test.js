const assert = require("assert");
const { getCurveFromName } = require("ffjavascript");
const { getRandomPolynomialByLength, getRandomValue } = require("./test.utils.js");
const path = require("path");

const kzg_multiple_prover = require("../src/kzg_multiple_prover.js");
const kzg_multiple_verifier = require("../src/kzg_multiple_verifier.js");

const Logger = require("logplease");
const logger = Logger.create("", { showTimestamp: false });
Logger.setLogLevel("INFO");

describe("grand-sums-study: KZG multiple (n polynomials) test", function () {
    this.timeout(500000);

    let curve;

    before(async () => {
        curve = await getCurveFromName("bn128");
    });

    after(async () => {
        await curve.terminate();
    });

    it("should perform a basic ZKG full proving & verifying process", async () => {
        // Get a random number of polynomials to be committed between 2 and 5
        const nPols = getRandomValue(10) + 1;
        const pols = []

        for (let i=0; i<nPols; i++) {
            pols[i] = getRandomPolynomialByLength(2 ** 4, curve);
        }

        const pTauFilename = path.join("tmp", "powersOfTau28_hez_final_15.ptau");
        const proof = await kzg_multiple_prover(pols, pTauFilename, { logger });

        const verify = await kzg_multiple_verifier(proof, pTauFilename, { logger });
        assert.equal(0, verify);
    });
});
