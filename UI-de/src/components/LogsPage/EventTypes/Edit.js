import React, { Fragment } from "react";
import localization from "../../../localization";

export default function Edit(props) {
  const { details, eventType } = props;
  const value = details[0];
  return (
    <Fragment>
      <table className="table-fill">
        <thead>
          <tr>
            <th className="table-header space">{localization.logs.modal.activity}</th>
            <th className="table-header">{localization.logs.modal.changedField}</th>
            <th className="table-header">{localization.logs.modal.oldValue}</th>
            <th className="table-header">{localization.logs.modal.newValue}</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(value).map((row, index) => {
            const changedObject = value[row];
            if (
              !(
                (Array.isArray(changedObject.oldValue) &&
                changedObject.oldValue[0] === null &&
                changedObject.newValue === "null") ||
                (!Array.isArray(changedObject.oldValue) &&
                changedObject.oldValue === null &&
                changedObject.newValue === "")
              )
            )
              return (
                <Fragment key={index}>
                  <tr className="table-row">
                    {index === 0 ? (
                      <td className="table-common">{eventType}</td>
                    ) : (
                      <td className="table-common center">"</td>
                    )}
                    <td className="table-content">
                      {row
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, function (str) {
                          return str.toUpperCase();
                        })}
                    </td>
                    <td className="table-content inner">
                      {typeof changedObject.oldValue === "string" &&
                        changedObject.oldValue}
                      {typeof changedObject.newValue === "number" &&
                        changedObject.oldValue}
                      {typeof changedObject.oldValue === "boolean" &&
                      changedObject.oldValue === true
                        ? "True"
                        : changedObject.oldValue === false && "False"}
                      {(changedObject.oldValue === null ||
                        (Array.isArray(changedObject.oldValue) &&
                          changedObject.oldValue.length === 0)) &&
                        "-"}
                      {Array.isArray(changedObject.oldValue) &&
                        changedObject.oldValue.map((item) => {
                          return <div className="table-inner">{item}</div>;
                        })}
                      {changedObject.oldValue !== null &&
                        !Array.isArray(changedObject.oldValue) &&
                        Object.entries(changedObject.oldValue).map(
                          ([k, v], index) => {
                            if (v === true) {
                              return (
                                <div key={index} className="table-inner">
                                  {k}
                                </div>
                              );
                            }
                          }
                        )}
                    </td>
                    <td className="table-content inner">
                      {typeof changedObject.newValue === "boolean" &&
                      changedObject.newValue === true
                        ? "True"
                        : changedObject.newValue === false && "False"}
                      {typeof changedObject.newValue === "number" &&
                        changedObject.newValue}
                      {changedObject.newValue !== null &&
                        Array.isArray(changedObject.newValue) &&
                        <div className="table-content">
                          {changedObject.newValue.map((item, index) => {
                            return (
                              <div key={index} className="table-content">
                                {item}
                              </div>
                            );
                          })}
                        </div>
                        }
                      {changedObject.newValue !== null &&
                        !Array.isArray(changedObject.newValue) &&
                        Object.entries(changedObject.newValue).map(
                          ([k, v], index) => {
                            if (v === true) {
                              return (
                                <div key={index} className="table-content">
                                  {k}
                                </div>
                              );
                            }
                            if (Array.isArray(v)) {
                              return (
                                <div key={index}className="table-content">{`${k}: ${v}`}</div>
                              );
                            }
                          }
                        )}
                      {typeof changedObject.newValue === "string" &&
                        changedObject.newValue}
                    </td>
                  </tr>
                </Fragment>
              );
          })}
        </tbody>
      </table>
    </Fragment>
  );
}
