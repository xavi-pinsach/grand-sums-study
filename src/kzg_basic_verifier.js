const { readBinFile } = require("@iden3/binfileutils");
const { Keccak256Transcript } = require("./Keccak256Transcript");
const readPTauHeader = require("./ptau_utils");

module.exports = async function kzg_basic_verifier(
    proof,
    pTauFilename,
    options
) {
    const logger = options.logger;

    if (logger) {
        logger.info("> KZG BASIC VERIFIER STARTED");
        logger.info("");
    }

    const { fd: fdPTau, sections: pTauSections } = await readBinFile(
        pTauFilename,
        "ptau",
        1,
        1 << 22,
        1 << 24
    );
    const { curve } = await readPTauHeader(fdPTau, pTauSections);

    if (logger) {
        logger.info("-------------------------------");
        logger.info("  KZG BASIC VERIFIER SETTINGS");
        logger.info(`  Curve:         ${curve.name}`);
        logger.info("-------------------------------");
    }

    // STEP 1. Calculate challenge xi from transcript
    logger.info("> STEP 1. Compute challenge xi");
    const transcript = new Keccak256Transcript(curve);
    transcript.addPolCommitment(proof.commitP);
    const xi = transcript.getChallenge();
    logger.info("··· xi = ", curve.Fr.toString(xi));

    // STEP 2. Check the pairing equation e([q(s)]_1, [s-z]_2) = e(C-[y]_1, [1]_2)
    logger.info("> STEP 2. Check pairing");
    const A1 = proof.commitQ;

    const sG2 = curve.G2.F.n8 * 2;
    const S_2 = await fdPTau.read(sG2, pTauSections[3][0].p + sG2);
    const xi_2 = curve.G2.timesFr(curve.G2.one, xi);
    const A2 = curve.G2.sub(S_2, xi_2);

    const evalY_1 = curve.G1.timesFr(curve.G1.one, proof.evalY);
    const B1 = curve.G1.sub(proof.commitP, evalY_1);
    console.log(curve.G1.toString(proof.commitP));

    const B2 = curve.G2.one;

    const isValid = await curve.pairingEq(curve.G1.neg(A1), A2, B1, B2);

    if (logger) {
        if (isValid) {
            logger.info("> VERIFICATION OK");
        } else {
            logger.error("> VERIFICATION FAILED");
        }
    }

    if (logger) {
        logger.info("");
        logger.info("> KZG BASIC VERIFIER FINISHED");
    }

    await fdPTau.close();

    return isValid === false ? -1 : 0;
};
