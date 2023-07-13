const yargs = require("yargs");

const kzg_basic_prover = require("./src/kzg_basic_prover.js");
const kzg_basic_verifier = require("./src/kzg_basic_verifier.js");

const Logger = require("logplease");
const logger = Logger.create("snarkJS", { showTimestamp: false });
Logger.setLogLevel("INFO");

yargs
  .scriptName("kzg")
  .version("1.1.0")
  .usage("$0 <cmd> [args]")
  .command(
    "prove []",
    "generates snark proofs!",
    (yargs) => {
      yargs.positional("name", {
        type: "string",
        default: "Cambi",
        describe: "the name to say hello to",
      });
    },
    function (argv) {
      return _kzg_basic_prover(argv.name);
    }
  )
  .command(
    "verify []",
    "verifies snark proofs",
    (yargs) => {
      yargs.positional("name", {
        type: "string",
        default: "Cambi",
        describe: "the name to say hello to",
      });
    },
    function (argv) {
      return _kzg_basic_verifier(argv.name);
    }
  )
  .help().argv;

async function _kzg_basic_prover(name) {
  return await kzg_basic_prover(name, { logger });
}

async function _kzg_basic_verifier(proof) {
  return await kzg_basic_verifier(proof, { logger });
}
