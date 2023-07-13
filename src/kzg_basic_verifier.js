module.exports = async function kzg_basic_verifier(proof, options) {
  const logger = options.logger;

  if (logger) {
    logger.info("> KZG BASIC VERIFIER STARTED");
    logger.info("");
  }

  if (logger) {
    logger.info("-------------------------------");
    logger.info("  KZG BASIC VERIFIER SETTINGS");
    logger.info("-------------------------------");
  }

  let res = false;

  if (logger) {
    if(res) {
        logger.info("VERIFICATION OK");
    } else {
        logger.error("VERIFICATION FAILED");
    }
  }

  if (logger) {
    logger.info("");
    logger.info("> KZG BASIC VERIFIER FINISHED");
  }

  return res === false ? -1 : 0;
};
