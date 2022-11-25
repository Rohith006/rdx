import AuthService from "../../services/authServices";
import axios from "axios";

export function isAuth() {
  return AuthService.authenticated;
}

export function setToken(token) {
  localStorage.setItem("auth-token", token);
}

export function setRoles(roles) {
  localStorage.setItem("auth-roles", JSON.stringify(roles));
}

export function getRoles() {
  return JSON.parse(localStorage.getItem("auth-roles"));
}

export function getToken() {
  return localStorage.getItem("auth-token");
}
