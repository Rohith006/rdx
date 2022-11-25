import React from "react";
import FrequencyCapView from "./View";

export default function FrequencyCap(props) {
  const {
    formData: {
      monetizationType,
      frequencyCapInterval,
      frequencyCapping,
      frequencyCapValue,
    },
  } = props;
  const mType = monetizationType;
  return mType ? (
    <FrequencyCapView
      frequencyCapping={frequencyCapping}
      frequencyCapInterval={frequencyCapInterval}
      frequencyCapValue={frequencyCapValue}
      type={1}
      change={props.change}
      mType={mType}
    />
  ) : null;
}
