import React from "react";
import "./Button.css";
import IconCircularProgress from "../progress/IconCircularProgress";
import { AiOutlineCheckCircle } from "react-icons/ai";
import PropTypes from "prop-types";

export default function Button({
  label,
  onClick,
  className,
  style,
  icon,
  disabled,
  selected = false,
  progress = false,
  confirmed = false,
  error = false,
}) {
  let visuals = selected ? "ButtonSelected Button" : "Button";
  visuals = className ? className : visuals;
  if (progress === true) {
    visuals += " DisabledButton";
  } else if (typeof disabled === "undefined" || disabled !== true) {
    if (confirmed) {
      visuals += " ConfirmedButton";
    } else if (error) {
      visuals += " ErrorButton";
    } else {
      visuals += " EnabledButton";
    }
  } else {
    visuals += " DisabledButton";
  }
  const iconEl = icon ? icon : <AiOutlineCheckCircle size={20} />;

  const onButtonClick = (ev) => {
    if (!disabled && !progress) {
      ev.preventDefault();
      if (
        typeof onClick !== "undefined" &&
        (typeof disabled === "undefined" || disabled !== true)
      ) {
        onClick(ev);
      }
    }
  };

  const RenderContent = ({ processing }) => {
    if (processing) {
      return (
        <>
          <span style={{ minWidth: 24, display: "flex" }}>
            <IconCircularProgress />
          </span>
          {label}
        </>
      );
    }
    return (
      <>
        <span className="label" style={{ minWidth: 24, display: "flex" }}>
          {iconEl}
        </span>
        {label}
      </>
    );
  };

  return (
    <span onClickCapture={onButtonClick} className={visuals} style={style}>
      <RenderContent processing={progress} />
    </span>
  );
}

Button.propTypes = {
  label: PropTypes.string,
  onClick: PropTypes.func,
  className: PropTypes.object,
  style: PropTypes.object,
  icon: PropTypes.element,
  disabled: PropTypes.bool,
  selected: PropTypes.bool,
  progress: PropTypes.bool,
};
