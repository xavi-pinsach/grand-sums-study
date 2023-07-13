const yargs = require("yargs");

const kzg_prove = require("./src/kzg_prove.js");

const Logger = require("logplease");
const logger = Logger.create("snarkJS", { showTimestamp: false });
Logger.setLogLevel("INFO");

yargs
  .scriptName("kzg")
  .version("1.1.0")
  .usage("$0 <cmd> [args]")
  .command(
    "prove [name]",
    "generates a snark proof!",
    (yargs) => {
      yargs.positional("name", {
        type: "string",
        default: "Cambi",
        describe: "the name to say hello to",
      });
    },
    function (argv) {
      return _kzg_prove(argv.name);
    }
  )
  .help().argv;

async function _kzg_prove(name) {
  return await kzg_prove(name, { logger });
}
