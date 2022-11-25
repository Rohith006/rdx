import React from "react";
import Select from "react-select";
import { styles } from "./selectStyles";

export const DropDownFilter = ({ onChange, options, placeholder, name, value }) => (
  <div className="form-control" style={{ width: "22%" }}>
    <Select
      className="filter-form__select filter-form__select--disabled"
      placeholder={placeholder}
      value = {value}
      options={options}
      onChange={(e) => onChange(e, name)}
      styles={styles}
      theme={(theme) => ({
        ...theme,
        colors: {
          ...theme.colors,
          primary: "#000000",
        },
      })}
    />
  </div>
);

export default DropDownFilter;
