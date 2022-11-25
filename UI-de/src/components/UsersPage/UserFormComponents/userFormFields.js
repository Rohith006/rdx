import classNames from "classnames";
import { OWNER } from "../../../constants/user";
import { Field } from "redux-form";
import React from "react";

export const renderRadioField = ({ input, title, type, className }) => {
  return (
    <div className={`form__description__fields__radio-field mt2 ${className}`}>
      <input id={title} {...input} type={type} className="custom-radio" />
      <label htmlFor={title}>
        <span style={{ marginBottom: 3 }} />
        {title}
      </label>
    </div>
  );
};

export const Sector = ({ item, role }) => {
  const classSectorControl = classNames({
    "checkbox-control": true,
    disabled: role === OWNER,
    userDivCenter: true,
  });
  return (
    <div className={classSectorControl}>
      <Field
        name={item}
        id={item}
        component="input"
        type="checkbox"
        disabled={role === OWNER}
      />
      <label htmlFor={item}>
        <span
          className="checkbox-control__indicator userDivCenter "
          style={{ marginBottom: 3 }}
        />
        <span className="userRulesCheckbox">
          {item.replace("_", " ").toLowerCase()}
        </span>
      </label>
    </div>
  );
};
