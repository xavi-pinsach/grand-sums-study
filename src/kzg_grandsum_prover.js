const { readBinFile } = require("@iden3/binfileutils");
const { BigBuffer } = require("ffjavascript");
const { Keccak256Transcript } = require("./Keccak256Transcript");
const { Polynomial } = require("./polynomial/polynomial");
const { Evaluations } = require("./polynomial/evaluations");
const buildZGrandSum = require("./grandsum");
const readPTauHeader = require("./ptau_utils");

module.exports = async function kzg_GP_prover(pols, pTauFilename, options) {
    const logger = options.logger;

    if (logger) {
        logger.info("> KZG GRAND PRODUCT PROVER STARTED");
        logger.info("");
    }

    // STEP 0. Get the settings and prepare the setup
    // Ensure all polynomials have the same length
    const polLen = pols[0].length();
    for (let i = 1; i < pols.length; i++) {
        if (polLen !== pols[i].length()) {
            throw new Error("All polynomials must have the same length.");
        }
    }
    
    const nBits = Math.ceil(Math.log2(polLen));
    const domainSize = 2 ** nBits;

    // Ensure the polynomial has a length that is a power of two.
    if (polLen !== domainSize) {
        throw new Error("Polynomial length must be power of two.");
    }

    const { fd: fdPTau, sections: pTauSections } = await readBinFile(pTauFilename, "ptau", 1, 1 << 22, 1 << 24);
    const { curve, power: nBitsPTau } = await readPTauHeader(fdPTau, pTauSections);

    // Ensure the powers of Tau file is sufficiently large
    if (nBitsPTau < nBits) {
        throw new Error("Powers of Tau has not enough values for this polynomial");
    }

    const sG1 = curve.G1.F.n8 * 2;

    const PTau = new BigBuffer(domainSize * sG1);
    await fdPTau.readToBuffer(PTau, 0, domainSize * sG1, pTauSections[2][0].p);

    if (logger) {
        logger.info("-------------------------------------");
        logger.info("  KZG GRAND PRODUCT PROVER SETTINGS");
        logger.info(`  Curve:        ${curve.name}`);
        logger.info(`  #polynomials: ${pols.length}`);
        logger.info("-------------------------------------");
    }

    let proof = {};
    let challenges = {};

    const transcript = new Keccak256Transcript(curve);

    // STEP 1. Generate the polynomial commitments of all polynomials
    logger.info("> STEP 1. Compute polynomial commitments");
    proof.commitments = [];
    for(let i=0; i<pols.length; i++) {
        pols[i].coef = await curve.Fr.batchToMontgomery(pols[i].coef.slice(0, pols[i].coef.byteLength));
        proof.commitments[i] = await pols[i].multiExponentiation(PTau, `pol${i}`);
        logger.info(`··· [p${i}(X)]_1 = `, curve.G1.toString(proof.commitments[i]));
    }

    // STEP 2. Generate the Z polynomial
    logger.info("> STEP 2. Compute the Z polynomial");
    for(let i=0; i<pols.length; i++) {
        transcript.addPolCommitment(proof.commitments[i]);
    }
    challenges.alpha = transcript.getChallenge();
    logger.info("··· alpha = ", curve.Fr.toString(challenges.alpha));

    let polsZ = [];
    let evaluations = {};
    evaluations.F = await Evaluations.fromPolynomial(pols[0], 1, curve, logger);
    evaluations.T = await Evaluations.fromPolynomial(pols[0], 1, curve, logger);

    // Permute one element of the evaluations of T
    const evaluation0 = evaluations.T.eval.slice(0, curve.Fr.n8);
    const evaluation1 = evaluations.T.eval.slice(curve.Fr.n8, curve.Fr.n8 * 2);
    evaluations.T.eval.set(evaluation1, 0);
    evaluations.T.eval.set(evaluation0, curve.Fr.n8);

    polsZ[0] = await buildZGrandSum(evaluations.F, evaluations.T, challenges.alpha, curve, { logger });

    proof.commitmentsZ = [];
    proof.commitmentsZ[0] = await polsZ[0].multiExponentiation(PTau, `polZ0`);
    logger.info(`··· [Z0(X)]_1 = `, curve.G1.toString(proof.commitmentsZ[0]));

    // STEP 3. Get challenge xi from transcript
    logger.info("> STEP 3. Get challenge xi");
    transcript.reset();
    for(let i=0; i<polsZ.length; i++) {
        transcript.addPolCommitment(proof.commitmentsZ[i]);
    }
    challenges.xi = transcript.getChallenge();
    logger.info("··· xi = ", curve.Fr.toString(challenges.xi));

    // STEP 3. Calculate the evaluations p(xi) = y for all polynomials
    logger.info("> STEP 3. Calculate the opening p(xi) = y");
    proof.evaluations = [];
    for(let i=0; i<pols.length; i++) {
        proof.evaluations[i] = pols[i].evaluate(challenges.xi);
        logger.info(`··· y${i} = `, curve.Fr.toString(proof.evaluations[i]));
    }

    // STEP 4. Get challenge alpha from transcript
    logger.info("> STEP 4. Get challenge alpha");
    transcript.reset();
    for(let i=0; i<pols.length; i++) {
        transcript.addEvaluation(proof.evaluations[i]);
    }
    challenges.alpha = transcript.getChallenge();
    logger.info("··· alpha = ", curve.Fr.toString(challenges.alpha));

    // STEP 5. Calculate the polynomial q(X)
    logger.info("> STEP 5. Calculate the polynomial q(X)");
    let polQ = new Polynomial(new Uint8Array(curve.Fr.n8 * polLen), curve, logger);

    let currentAlpha = curve.Fr.one;
    for(let i=0; i<pols.length; i++) {
        pols[i].subScalar(proof.evaluations[i]);
        pols[i].divByXSubValue(challenges.xi);
        pols[i].mulScalar(currentAlpha);

        polQ.add(pols[i]);
        currentAlpha = curve.Fr.mul(currentAlpha, challenges.alpha);
    }

    proof.commitQ = await polQ.multiExponentiation(PTau, "Q");
    logger.info("··· [q(X)]_1 = ", curve.G1.toString(proof.commitQ));

    if (logger) {
        logger.info("");
        logger.info("> KZG GRAND PRODUCT PROVER FINISHED");
    }

    await fdPTau.close();

    return proof;
};
