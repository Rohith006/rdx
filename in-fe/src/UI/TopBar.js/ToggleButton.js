import React from "react";
import { useState } from "react";

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
    <>
      {/* <>
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
      </> */}
      <>
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
      </>
    </>
  );
};

export default ToggleButton;
