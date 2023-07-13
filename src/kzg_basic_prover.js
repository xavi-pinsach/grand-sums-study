
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

    if (logger) {
        logger.info("");
        logger.info("> KZG BASIC PROVER FINISHED");
      }
    
    return proof;
}