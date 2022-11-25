import React from "react";
import MultiSelect from "../../../UI/MultiSelect/MultiSelect";

function TuiSelectResourceType({
  value,
  onSetValue,
  errorMessage = "",
  values,
  open,
  setOpen,
  setSelected,
}) {
  return (
    <MultiSelect
      initValue={value}
      onSetValue={onSetValue}
      data={values}
      open={open}
      setOpen={setOpen}
    />
  );
}

export default TuiSelectResourceType;
