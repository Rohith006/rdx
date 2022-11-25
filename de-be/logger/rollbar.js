const Rollbar = require("rollbar");

const config = require("../config");

const rollbar = new Rollbar({
  accessToken: config.rollbarAccessToken,
  captureUncaught: true,
  captureUnhandledRejections: true
});

module.exports = rollbar;