var Rollbar = require("rollbar");

const config = require("../../../config");

var rollbar = new Rollbar({
  accessToken: config.rollbarAccessToken,
  captureUncaught: true,
  captureUnhandledRejections: true
});

module.exports=rollbar;