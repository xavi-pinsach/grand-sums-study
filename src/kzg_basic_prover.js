module.exports = async function kzg_basic_prover(options) {
    const logger = options.logger;

    if (logger) {
        logger.info("> KZG BASIC PROVER STARTED");
        logger.info("");
    }

    if (logger) {
        logger.info("-----------------------------");
        logger.info("  KZG BASIC PROVER SETTINGS");
        logger.info("-----------------------------");
    }

    let proof = {};

    // STEP 0. Get the settings and prepare the setup

    // STEP 1. Generate the commitment of the polynomial p(X)

    // STEP 2. Get challenge xi from transcript

    // STEP 3. Calculate the opening p(xi) = y

    // STEP 4. Calculate the polynomial q(X) = (p(X) - p(xi)) / (X - xi)

    // STEP 5. Generate the proof = [q(s)]_1

    if (logger) {
        logger.info("");
        logger.info("> KZG BASIC PROVER FINISHED");
    }

    return proof;
};
