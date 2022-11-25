import React from "react";

const AppendMacros2 = (props) => {
  return (
    <div className="macros-group">
      <span>Required Macros:</span>
      <span
        onClick={() => props.appendMacros(props.fieldName, "{START_DATE}")}
        type="button"
        className="macros link"
        style={{ marginLeft: "10px", borderRadius: "4px" }}
      >
        START_DATE
      </span>
      <span
        onClick={() => props.appendMacros(props.fieldName, "{END_DATE}")}
        type="button"
        className="macros link"
        style={{ marginLeft: "10px", borderRadius: "4px" }}
      >
        END_DATE
      </span>
    </div>
  );
};

export default AppendMacros2;
