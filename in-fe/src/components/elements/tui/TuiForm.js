import React from "react";
import { isEmptyObjectOrNull } from "../../../misc/typeChecking";
import info from "../../../assets/images/icons/tooltip.svg";

export const TuiForm = ({ children, className, style }) => {
  let baseClassName = ["TuiForm"];

  if (className) {
    baseClassName.push(className);
  }
  return (
    <form className={baseClassName.join(" ")} style={style}>
      {children}
    </form>
  );
};

export const TuiFormGroup = ({ children, style, fitHeight = false }) => {
  if (fitHeight === true) {
    if (isEmptyObjectOrNull(style)) {
      style = {};
    }
    style["height"] = "100%";
  }

  return <div>{children}</div>;
};

export const TuiFormGroupHeader = ({ header, description = null }) => {
  return (
    <div className="card-header">
      {header && (
        <div className="form_heading">
          <h3 className="font-semibold">{header}</h3>
          {description && (
            <div className="tooltip">
              <img className="tooltip_icon" src={info} alt="tooltip" />
              <p className="my-2 tooltip_text">{description}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const TuiFormGroupContent = ({
  children,
  className,
  style,
  overflow,
}) => {
  let baseClassName = ["TuiFormGroupContent"];
  let baseStyle = { overflowY: overflow ? "none" : "auto" };

  if (className) {
    baseClassName.push(className);
  }

  if (style) {
    baseStyle = { ...baseStyle, ...style };
  }

  return (
    <section className={baseClassName.join(" ")} style={baseStyle}>
      {children}
    </section>
  );
};

export const TuiFormGroupField = ({
  children,
  header = null,
  description = null,
  margin,
}) => {
  return (
    <div className={margin ? "" : "m-8"}>
      {header && (
        <div className="form_heading flex-1">
          <h3 className="font-semibold">{header}</h3>
          {description && (
            <div className="tooltip">
              <img className="tooltip_icon" src={info} alt="tooltip" />
              <p className="my-2 tooltip_text">{description}</p>
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
};
