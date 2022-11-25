import React, { Fragment } from "react"
import localization from "../../../localization";

export default function New(props) {
  const { details, eventType } = props;
  return (
    <Fragment>
      <table className="table-fill">
        <thead>
          <tr className="table-row">
            <th className="table-header space">{localization.logs.modal.activity}</th>
            <th className="table-header">{localization.logs.modal.details}</th>
          </tr>
        </thead>
        <tbody>
          {details &&
            details.map((item, index) => {
              return (
                <Fragment key={index}>
                  <tr className="table-row">
                    <td className="table-common">{eventType}</td>
                    <td className="table-content">
                      <table className="table-fill">
                        <thead>
                          <tr className="table-row">
                            <th className="table-header">Name</th>
                            <th className="table-header">Email</th>
                            <th className="table-header">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="table-row">
                            <td className="table-content inner">{item.name}</td>
                            <td className="table-content inner">{item.email}</td>
                            <td className="table-content inner">{item.status}</td>
                          </tr>
                        </tbody>
                      </table>
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
