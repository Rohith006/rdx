import React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import ReactDOM from "react-dom";
import "./assets/styles/styles.scss";
import "./styles.scss";
import reportWebVitals from "./reportWebVitals";
import store from "./redux/store";
import { Provider } from "react-redux";
import App from "./components/App";
import { mainTheme } from "./themes";
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import { ConfirmProvider } from "material-ui-confirm";
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";

Sentry.init({
  dsn: "https://2721a09bf1144c10930117609a67f4d5@o1093519.ingest.sentry.io/6112822",
  integrations: [new Integrations.BrowserTracing()],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={mainTheme}>
          <CssBaseline />
          <ConfirmProvider>
            <App />
          </ConfirmProvider>
        </ThemeProvider>
      </StyledEngineProvider>
    </Provider>
  </React.StrictMode>,
  document.querySelector("#root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
