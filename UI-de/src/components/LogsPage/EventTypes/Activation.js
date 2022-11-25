import React, { Fragment } from "react";
import localization from "../../../localization";

export default function Delete(props) {
  const { details, eventType } = props;
  const { oldValue, newValue } = details && details[0].status;
  return (
    <Fragment>
      <table className="table-fill">
        <thead>
          <tr className="table-row">
            <th className="table-header space">{localization.logs.modal.activity}</th>
            <th className="table-header center">{localization.logs.modal.oldValue}</th>
            <th className="table-header center">{localization.logs.modal.newValue}</th>
          </tr>
        </thead>
        <tbody>
          {details &&
            details.map((item, index) => {
              return (
                <Fragment key={index}>
                  <tr className="table-row">
                    {index === 0 ? <td className="table-common">{eventType}</td> : <td className="table-common center">"</td>}                    
                    <td className="table-content compare">
                      <table className="table-fill">
                        <thead>
                          <tr className="table-row">
                            <th className="table-header text-center">ID</th>
                            <th className="table-header text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="table-row">
                            <td className="table-content inner text-center">{item.id}</td>
                            <td className="table-content inner text-center">{oldValue}</td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                    <td className="table-content compare">
                      <table className="table-fill">
                        <thead>
                          <tr className="table-row">
                            <th className="table-header text-center">ID</th>
                            <th className="table-header text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="table-row">
                            <td className="table-content inner text-center">{item.id}</td>
                            <td className="table-content inner text-center">{newValue}</td>
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
