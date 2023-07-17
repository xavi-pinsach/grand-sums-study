const assert = require("assert");
const { getCurveFromName, BigBuffer } = require("ffjavascript");
const { getRandomValue, getRandomBuffer } = require("./test.utils.js");
const { Polynomial } = require("../src/polynomial/polynomial.js");
const path = require("path");

const kzg_grandproduct_prover = require("../src/kzg_grandproduct_prover.js");
const kzg_grandproduct_verifier = require("../src/kzg_grandproduct_verifier.js");

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

    it("should perform a Grand Product ZKG full proving & verifying process", async () => {
        const length =  getRandomValue(10);

        const evalsBufferF = getRandomBuffer(2 ** length, curve.Fr);
        const evalsBufferT = new Uint8Array(evalsBufferF.byteLength);
        evalsBufferT.set(evalsBufferF.slice(0, evalsBufferF.byteLength - curve.Fr.n8), curve.Fr.n8);
        evalsBufferT.set(evalsBufferF.slice(evalsBufferF.byteLength - curve.Fr.n8, evalsBufferF.byteLength), 0);

        const pTauFilename = path.join("tmp", "powersOfTau28_hez_final_15.ptau");
        const proof = await kzg_grandproduct_prover(evalsBufferF, evalsBufferT, pTauFilename, { logger });

        const isValid = await kzg_grandproduct_verifier(proof, pTauFilename, { logger });
        assert.ok(isValid);
    });
});
