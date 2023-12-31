const assert = require("assert");
const { getCurveFromName } = require("ffjavascript");
const { getRandomPolynomialByLength, getRandomValue } = require("./test.utils.js");
const path = require("path");

const kzg_basic_prover = require("../src/kzg_basic_prover.js");
const kzg_basic_verifier = require("../src/kzg_basic_verifier.js");

const Logger = require("logplease");
const logger = Logger.create("", { showTimestamp: false });
Logger.setLogLevel("INFO");

describe("grand-sums-study: KZG basic (1 polynomial) test", function () {
    this.timeout(1000000);

    let curve;

    before(async () => {
        curve = await getCurveFromName("bn128");
    });

    after(async () => {
        await curve.terminate();
    });

    it("should perform a ZKG full proving & verifying process with ONE polynomial", async () => {
        const degree =  getRandomValue(10);
        const pol = getRandomPolynomialByLength(degree, curve.Fr);

        const pTauFilename = path.join("tmp", "powersOfTau28_hez_final_15.ptau");
        const proof = await kzg_basic_prover([pol], pTauFilename, { logger });

        const isValid = await kzg_basic_verifier(proof, pTauFilename, { logger });
        assert.ok(isValid);
    });

    it("should perform a basic ZKG full proving & verifying process with multiple polynomials", async () => {
        // Get a random number of polynomials to be committed between 2 and 5
        const nPols = getRandomValue(10);
        const degree =  getRandomValue(10);

        const pols = []

        for (let i=0; i<nPols; i++) {
            pols[i] = getRandomPolynomialByLength(degree, curve.Fr);
        }

        const pTauFilename = path.join("tmp", "powersOfTau28_hez_final_15.ptau");
        const proof = await kzg_basic_prover(pols, pTauFilename, { logger });

        const isValid = await kzg_basic_verifier(proof, pTauFilename, { logger });
        assert.ok(isValid);
    });
});
