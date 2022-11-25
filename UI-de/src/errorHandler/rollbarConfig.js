const rollbarConfig = {
  accessToken: __ROLLBAR_ACCESS_TOKEN__,
  captureUncaught: true,
    captureUnhandledRejections: true,
    payload: {
        environment: "production"
    }
}

export default rollbarConfig;
