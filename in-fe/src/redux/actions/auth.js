import { loginUser } from "../../remote_api/user";
import { setRoles, setToken } from "../../components/authentication/login";
import AuthService from "../../services/authServices";
import auth from "./ActionType/auth";
import axios from "axios";
import { pending, fulfilled } from "../reducers/loadSlice";

export const signInViaToken = () => async (dispatch) => {
  let { keycloak, status } = await AuthService.initKeycloak();
  if (keycloak) {
    if (status === 0) {
      dispatch(pending());
      const token = keycloak.token;
      const email = keycloak.tokenParsed.email;
      const api = loginUser(email, token);
      api
        .then((response) => {
          setToken(response.data["access_token"]);
          setRoles(response.data["roles"]);
          dispatch(fulfilled());
        })
        .catch((e) => {
          let message = e.message;
          if (typeof e.response == "undefined") {
            message = "Api unavailable.";
          } else if (e.response.status === 422) {
            message = "Bag request. Fill all fields.";
          } else if (typeof e.response.data["detail"] == "string") {
            message = e.response.data["detail"];
          }
        });
    }
  }
};

export const checkAuthorisedUser = (status) => ({
  type: auth.CHECK_AUTHORISED_USER,
  status: status,
});

export const LogoutUser = (history) => {
  return async (dispatch) => {
    try {
      delete axios.defaults.headers.common["Authorization"];
      localStorage.removeItem("auth-token");
      AuthService.logout();
      dispatch({
        type: "Logout",
      });
    } catch (error) {
      console.log(error);
    }
  };
};
