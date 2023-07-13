
module.exports = async function fflonkSetup(name, options) {
    const logger = options.logger;

    if(logger) logger.info(name);

    return -1;
}