import React from "react";
import Select from "react-select";
import { styles } from "../../UI/selectStyles";

const CustomSelect = (props) => (
  <div className="form__text-field">
    <div className="form__text-field__name">{props.label}</div>
    <div className="form-group_field">
      <div className="text-input">
        <Select
          autocomplete="off"
          name={props.name || ""}
          options={props.options}
          value={props.value}
          onChange={props.onChange}
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
    </div>
  </div>
);

export default CustomSelect;
