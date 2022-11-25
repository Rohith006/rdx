import React from "react";
import AutoLoadObjectList from "../elements/lists/AutoLoadObjectList";
import {
  TuiForm,
  TuiFormGroup,
  TuiFormGroupContent,
  TuiFormGroupField,
  TuiFormGroupHeader,
} from "../elements/tui/TuiForm";

const Instances = () => {
  const onLoadRequest = {
    url: `/instances`,
    method: "GET",
  };

  return (
    <TuiForm
      style={{
        padding: 32,
      }}
    >
      <TuiFormGroup fitHeight={true}>
        <TuiFormGroupHeader
          header="Running instances of ReBid Insights"
          description="List of running workers of ReBid Insights API."
        />
        <TuiFormGroupContent>
          <TuiFormGroupField>
            <div style={{ overflow: "auto", height: "inherit" }}>
              <AutoLoadObjectList
                onLoadRequest={onLoadRequest}
                label="INSTANCES"
                timeField={(row) => [row.timestamp]}
                timeFieldLabel="Timestamp"
              />
            </div>
          </TuiFormGroupField>
        </TuiFormGroupContent>
      </TuiFormGroup>
    </TuiForm>
  );
};

export default Instances;
