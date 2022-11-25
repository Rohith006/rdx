import React from "react";
import { useState } from "react";
import DisplayCheck from "../../../permissions";
import {
  ACCOUNT_MANAGER,
  ADMIN,
  ADVERTISER,
  OWNER,
  PUBLISHER,
} from "../../../constants/user";
import "./Toggle.css";
import { Fragment } from "react";

const ToggleButton = (props) => {
  const [toggle, setToggle] = useState(false);

  const setClassName = () => {
    return toggle ? "toggle_checked" : "toggle_unchecked";
  };

  const changeSelected = () => {
    props.handleToggle(toggle);
    setToggle(!toggle);
  };

  return (
    <Fragment>
      <DisplayCheck roles={[ADVERTISER]}>
        <span
          style={{ borderRadius: "4px 0px 0px 4px" }}
          onClick={changeSelected}
          className={!toggle ? "toggle_checked" : "toggle_unchecked"}
        >
          Spend
        </span>
        <span
          style={{ borderRadius: "0px 4px 4px 0px" }}
          onClick={changeSelected}
          className={`${setClassName()}`}
        >
          Balance
        </span>
      </DisplayCheck>
      <DisplayCheck roles={[ADMIN, ACCOUNT_MANAGER]} label={["SEE_PROFIT"]}>
        <span
          style={{ borderRadius: "4px 0px 0px 4px" }}
          onClick={changeSelected}
          className={!toggle ? "toggle_checked" : "toggle_unchecked"}
        >
          This month
        </span>
        <span
          style={{ borderRadius: "0px 4px 4px 0px" }}
          onClick={changeSelected}
          className={`${setClassName()}`}
        >
          Last month
        </span>
      </DisplayCheck>
    </Fragment>
  );
};

export default ToggleButton;
