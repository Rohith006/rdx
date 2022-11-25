import React from "react";
import { Route, Redirect } from "react-router-dom";
import { getRoles, isAuth } from "./login";
import NotAllowed from "./NotAllowed";
import urlPrefix from "../../misc/UrlPrefix";
import AuthService from "../../services/authServices";
import { useSelector } from "react-redux";
import Loader from "../../UI/Loader";

export default function PrivateRoute({ children, location, roles, ...rest }) {
  const loading = useSelector((state) => state.loadSlice.loading);

  function intersect(a, b) {
    let setB = new Set(b);
    return [...new Set(a)].filter((x) => setB.has(x));
  }

  const isAllowed = () => {
    if (intersect(getRoles(), roles).length > 0) {
      return true;
    }
    return false;
  };

  return (
    <Route {...rest}>
      {loading !== null && !loading ? (
        isAuth() && isAuth() ? (
          isAllowed() ? (
            children
          ) : (
            <NotAllowed />
          )
        ) : null
      ) : (
        <Loader />
      )}
    </Route>
  );
}
