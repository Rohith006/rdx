import React from "react";
import RadioSelect from "../../../UI/RadioSelect";

export default function TuiSelectEventSourceType({
  value,
  onSetValue,
  errorMessage = "",
  values,
}) {
  return (
    <RadioSelect initValue={value} onSetValue={onSetValue} values={values} />
  );
}

export const TuiSelectEventSourceTypeMemo = React.memo(
  TuiSelectEventSourceType,
  (prev, next) => {
    return prev.value === next.value;
  }
);
