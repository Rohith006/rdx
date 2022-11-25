import { Route, Redirect, Switch } from "react-router-dom";
import React from "react";
import AuthRouter from "./Auth";
import Sidebar from "../components/common/Sidebar";
import Footer from "../components/common/Footer";
import "./scss/login.scss";
const Login = (props) => (
  <div className="container_login">
    <Sidebar />
    <div className="container_body">
      <main className="cover custom-cover">
        <Switch>
          {props.isAuthenticated ? (
            <Redirect from="/*" to="/dashboard" />
          ) : null}
          <Route path="/" component={AuthRouter} />
        </Switch>
      </main>
      <Footer />
    </div>
  </div>
);

export default Login;
