import React from "react";
import {
  TuiForm,
  TuiFormGroup,
  TuiFormGroupContent,
  TuiFormGroupField,
  TuiFormGroupHeader,
} from "../elements/tui/TuiForm";
import AutoLoadLogList from "../elements/lists/AutoLoadLogList";

const Logs = () => {
  const onLoadRequest = {
    url: `/logs`,
    method: "GET",
  };

  const renderRowFunc = (row, index) => {
    return (
      <tr key={index} className="LogListRow">
        <td>{row.date}</td>
        <td>{row.level}</td>
        <td>{row.message}</td>
        <td>{row.file}</td>
        <td>{row.line}</td>
      </tr>
    );
  };

  return (
    <TuiForm
      style={{
        padding: 24,
      }}
    >
      <TuiFormGroup fitHeight={true}>
        <TuiFormGroupHeader
          header="Insights logs"
          description="List of logged operations."
        />
        <TuiFormGroupContent>
          <TuiFormGroupField>
            <div style={{ overflow: "auto", height: "inherit" }}>
              <AutoLoadLogList
                onLoadRequest={onLoadRequest}
                label="LOGS"
                renderRowFunc={renderRowFunc}
              />
            </div>
          </TuiFormGroupField>
        </TuiFormGroupContent>
      </TuiFormGroup>
    </TuiForm>
  );
};

export default Logs;
