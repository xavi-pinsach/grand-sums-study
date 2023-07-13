const { readBinFile } = require("@iden3/binfileutils");
const { BigBuffer } = require("ffjavascript");
const { Keccak256Transcript } = require("./Keccak256Transcript");
const readPTauHeader = require("./ptau_utils");

module.exports = async function kzg_basic_prover(pol, pTauFilename, options) {
    const logger = options.logger;

    if (logger) {
        logger.info("> KZG BASIC PROVER STARTED");
        logger.info("");
    }

    let proof = {};

    // STEP 0. Get the settings and prepare the setup
    const nBits = Math.ceil(Math.log2(pol.length()));
    const domainSize = 2 ** nBits;

    // Ensure the polynomial has a length that is a power of two.
    if (pol.length() !== domainSize) {
        throw new Error("Polynomial length must be power of two.");
    }

    const { fd: fdPTau, sections: pTauSections } = await readBinFile(
        pTauFilename,
        "ptau",
        1,
        1 << 22,
        1 << 24
    );
    const { curve, power: nBitsPTau } = await readPTauHeader(
        fdPTau,
        pTauSections
    );

    // Ensure the powers of Tau file is sufficiently large
    if (nBitsPTau < nBits) {
        throw new Error(
            "Powers of Tau has not enough values for this polynomial"
        );
    }

    const sG1 = curve.G1.F.n8 * 2;

    const PTau = new BigBuffer(domainSize * sG1);
    await fdPTau.readToBuffer(PTau, 0, domainSize * sG1, pTauSections[2][0].p);

    if (logger) {
        logger.info("-----------------------------");
        logger.info("  KZG BASIC PROVER SETTINGS");
        logger.info(`  Curve:         ${curve.name}`);
        logger.info(`  Circuit power: ${nBits}`);
        logger.info(`  Domain size:   ${domainSize}`);
        logger.info("-----------------------------");
    }

    // STEP 1. Generate the polynomial commitment of p(X)
    logger.info("> STEP 1. Compute polynomial commitment");
    proof.commitP = await pol.multiExponentiation(PTau, "pol");
    logger.info("··· [p(X)]_1 = ", curve.G1.toString(proof.commitP));

    // STEP 2. Get challenge xi from transcript
    logger.info("> STEP 2. Get challenge xi");
    const transcript = new Keccak256Transcript(curve);
    transcript.addPolCommitment(proof.commitP);
    const xi = transcript.getChallenge();
    logger.info("··· xi = ", curve.Fr.toString(xi));

    // STEP 3. Calculate the opening p(xi) = y
    logger.info("> STEP 3. Calculate the opening p(xi) = y");
    proof.evalY = pol.evaluate(xi);
    logger.info("··· y = ", curve.Fr.toString(proof.y));

    // STEP 4. Calculate the polynomial q(X) = (p(X) - p(xi)) / (X - xi)
    logger.info(
        "> STEP 4. Calculate the polynomial q(X) = (p(X) - p(xi)) / (X - xi)"
    );
    pol.subScalar(proof.evalY);
    pol.divByXSubValue(xi);
    proof.commitQ = await pol.multiExponentiation(PTau, "pol");
    logger.info("··· [q(X)]_1 = ", curve.G1.toString(proof.commitQ));

    if (logger) {
        logger.info("");
        logger.info("> KZG BASIC PROVER FINISHED");
    }

    await fdPTau.close();

    return proof;
};
