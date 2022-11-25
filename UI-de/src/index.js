import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { AbilityContext } from "./casl/ability-context";
import ability from "./casl/ability";
import store from "./store";
import App from "./App";

import "antd/es/table/style/index.css";
import "antd/es/spin/style/index.css";
import "../assets/styles/style.scss";

console.log("APP STARTED DEFINE: " + __INTERNAL_API_URL__);

ReactDOM.render(
  <AbilityContext.Provider value={ability}>
    <Provider store={store()}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </AbilityContext.Provider>,
  document.getElementById("root")
);
