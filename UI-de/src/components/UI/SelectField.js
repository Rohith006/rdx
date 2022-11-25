import React from "react";
import Select from "react-select";
import classNames from "classnames";
import { styles } from "./selectStyles";

export default ({ input, title, options, meta, isMulti, className }) => {
  const selectedValues = options.filter((item) => {
    const isMatched = input.value
      ? isMulti
        ? input.value.includes(item.value)
        : input.value === item.value
      : false;
    if (isMatched) return item;
  });
  return (
    <div
      className={classNames("form__text-field__wrapper", className, {
        " errored": meta && meta.touched && meta.error,
      })}
    >
      <span className="form__text-field__name">{title}</span>
      <div className="w100">
        <Select
          className="country-select"
          options={options}
          value={selectedValues}
          isMulti={isMulti}
          styles={styles}
          theme={(theme) => ({
            ...theme,
            colors: {
              ...theme.colors,
              primary: "#000000",
            },
          })}
          onChange={(item) => {
            const filtered = item
              ? isMulti
                ? item.map((i) => i.value)
                : item.value
              : null;
            input.onChange(filtered);
          }}
        />
        <div className="form__text-field__error">
          <span>{meta && meta.touched && meta.error}</span>
        </div>
      </div>
    </div>
  );
};
