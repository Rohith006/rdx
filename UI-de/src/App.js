"use strict";
import React, { Component, Fragment } from "react";
import { withRouter } from "react-router-dom";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { NotificationContainer } from "react-notifications";
import { Provider, ErrorBoundary } from "@rollbar/react";
import Header from "./components/common/Header";
import IndexRouter from "./routes";
import LoginRouter from "./routes/Login";
import { signInViaToken } from "./actions/auth";
import { getToken } from "./utils/cookiesUtils";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import Loader from "../assets/images/Loader.gif";
import rollbarConfig from "./errorHandler/rollbarConfig";

class App extends Component {
  componentWillMount() {
    this.props.actions.signInViaToken();
  }
  render() {
    const {
      auth: { isRequestPending, currentUser },
    } = this.props;
    const isAuthenticated = !!getToken();
    console.log("deecee current users value", currentUser);
    return (
      <Provider config={rollbarConfig}>
        <ErrorBoundary>
          {isRequestPending ? (
            <div className="loader-cover">
              {/* <Loader type="Bars" color="#f4263e" height={80} width={80}/> */}
              <img src={Loader} alt="Loading...." height={150} width={180} />
            </div>
          ) : !isAuthenticated ? (
            <div className="unauthorized">
              <NotificationContainer />
              <LoginRouter />
            </div>
          ) : (
            <Fragment>
              <NotificationContainer />
              <Header />
              <IndexRouter currentUser={currentUser} />
            </Fragment>
          )}
        </ErrorBoundary>
      </Provider>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
      signInViaToken,
    },
    dispatch
  ),
});

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));
