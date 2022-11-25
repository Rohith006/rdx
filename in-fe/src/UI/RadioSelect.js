import React, { useEffect, useState } from "react";

function RadioSelect({ initValue, onSetValue, values }) {
  const [radioValue, setValue] = useState(initValue);

  const handleChange = (value, label) => {
    const obj = { id: label, name: value?.name };
    setValue(obj);
    onSetValue(obj);
  };

  useEffect(() => {
    setValue(initValue);
  }, [initValue, values]);

  return (
    <div className="radio_btn-container">
      {Object.entries(values).map(([label, value]) => {
        return (
          <div
            className="radio_btn-items"
            onClick={() => handleChange(value, label)}
          >
            <input
              className="radio_btn-item"
              type="radio"
              name="radio"
              value={radioValue?.id}
              checked={radioValue?.id === label}
            />
            <label className="radio_btn-label" for={value?.name}>
              {value?.name}
            </label>
          </div>
        );
      })}
    </div>
  );
}

export default RadioSelect;
