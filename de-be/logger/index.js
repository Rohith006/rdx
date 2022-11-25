const rollbar = require("./rollbar");
const { logger, updateLevel } = require("./winston");

class Logger {
    debug(logmessage){
        logger.debug(logmessage)
        // rollbar.debug(logmessage)
    }
    info(logmessage){
        logger.info(logmessage)
        // rollbar.log(logmessage)
    }
    warn(logmessage){
        logger.warn(logmessage)
        rollbar.warn(logmessage)
    }
    error(logmessage){
        logger.error(logmessage)
        rollbar.error(logmessage)
    }
    updateLevel() {
        return updateLevel()
    }
}

const log = new Logger()

module.exports = log;