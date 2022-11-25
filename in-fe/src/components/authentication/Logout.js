import React from "react";
import { Redirect } from "react-router-dom";
import urlPrefix from "../../misc/UrlPrefix";
import { useDispatch } from "react-redux";
import { LogoutUser } from "../../redux/actions/auth";

export default function Logout() {
  const dispath = useDispatch();
  dispath(LogoutUser());
  return null;
}
