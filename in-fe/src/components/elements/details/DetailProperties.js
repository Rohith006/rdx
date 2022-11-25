import dot from "dot-object";
import DetailKeyValue from "./DetailKeyValue";
import React from "react";
import PropTypes from "prop-types";
import { isString } from "../../../misc/typeChecking";

export default function Properties({ properties, show }) {
  function empty(obj) {
    return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
  }

  const getValue = (value, label) => {
    if (label === "enabled") {
      if (value === true) {
        return <div className="active_chip">Active</div>;
      } else {
        return <div className="inactive_chip">Inactive</div>;
      }
    }
    if (label.split("[")[0] === "tags") {
      return <div className="chips mt-0 ml-0 px-2">{value}</div>;
    }
    if (label.split("[")[0] === "groups") {
      return <div className="chips mt-0 ml-0 px-2">{value}</div>;
    }
    if (typeof value === "undefined") {
      return "undefined";
    } else if (value === null) {
      return "null";
    } else if (empty(value)) {
      return "{}";
    }
    if (isString(value) && value === "") {
      return "-";
    } else if (Array.isArray(value) && value.length === 0) {
      return "[]";
    } else {
      return value.toString();
    }
  };

  const dotted =
    typeof properties !== "undefined" && properties !== null
      ? dot.dot(properties)
      : {};
  const keyValues = () =>
    Object.entries(dotted).map(([label, value]) => {
      if (show) {
        if (show.includes(label)) {
          return (
            <DetailKeyValue
              key={label}
              label={label}
              value={getValue(value, label)}
            />
          );
        } else {
          return "";
        }
      } else {
        return (
          <DetailKeyValue
            key={label}
            label={label}
            value={getValue(value, label)}
          />
        );
      }
    });
  return <>{keyValues()}</>;
}

Properties.propTypes = {
  properties: PropTypes.object,
  show: PropTypes.array,
};
