import React, { useLayoutEffect } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import AppBox from "./AppBox";
import { connect, useDispatch } from "react-redux";
import { hideAlert } from "../redux/reducers/alertSlice";
import Logout from "./authentication/Logout";
import PrivateRoute from "./authentication/PrivateRoute";
import "./App.scss";
import urlPrefix from "../misc/UrlPrefix";
import AlertTitle from "@mui/material/AlertTitle";
import FormDrawer from "./elements/drawers/FormDrawer";
import { close } from "../redux/reducers/newResource";
import ResourceForm from "./elements/forms/ResourceForm";
import { LogoutUser, signInViaToken } from "../redux/actions/auth";
import axios from "axios";

const App = ({ alert, resource, close }) => {
  const dispatch = useDispatch();

  const handleClose = () => {
    dispatch(hideAlert());
  };

  useLayoutEffect(() => {
    dispatch(signInViaToken());
  }, []);

  axios.interceptors.response.use(
    (response) =>
      new Promise((resolve, reject) => {
        if (window._kc) {
          if (!window._kc.authenticated) {
            dispatch(LogoutUser());
          }
        }
        resolve(response);
      }),
    (error) => {
      if (!error.response) {
        return new Promise((resolve, reject) => {
          reject(error);
        });
      }
      // if (error.response.status === 401) {
      //   dispatch(LogoutUser());
      // }
      else {
        return new Promise((resolve, reject) => {
          reject(error);
        });
      }
    }
  );

  const application = () => {
    return (
      <Router>
        <Switch>
          <PrivateRoute
            path={urlPrefix("")}
            roles={["super", "admin", "marketer", "developer"]}
          >
            <AppBox />
          </PrivateRoute>
        </Switch>
        <Snackbar
          open={alert.show}
          autoHideDuration={alert.hideAfter}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
        >
          <MuiAlert
            variant="filled"
            elevation={6}
            onClose={handleClose}
            severity={alert.type}
          >
            <AlertTitle style={{ textTransform: "uppercase" }}>
              {alert.type}
            </AlertTitle>
            <span style={{ fontWeight: 400 }}>{alert.message}</span>
          </MuiAlert>
        </Snackbar>
        <FormDrawer
          open={resource.show}
          onClose={() => {
            close();
          }}
          width={550}
        >
          <ResourceForm
            onClose={() => {
              close();
            }}
          />
        </FormDrawer>
      </Router>
    );
  };

  return application();
};

const mapState = (state) => {
  return {
    alert: state.alertReducer,
    resource: state.newResource,
  };
};
export default connect(mapState, { close })(App);
