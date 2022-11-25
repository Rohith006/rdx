import React from "react";

function Checkboxes({ title, items, values, change, name }) {
  const changeHandler = ({ target: { value } }) => {
    if (values.includes(value)) {
      change(
        name,
        values.filter((el) => el !== value)
      );
    } else {
      change(name, [...values, value]);
    }
  };
  return (
    <div className="integration_cover-item">
      <h3 className="form__text-field__name">{title}</h3>
      {items.map((item, index) => {
        return (
          <div className="checkbox-control" key={index}>
            <input
              type="checkbox"
              value={item.value}
              autoComplete="off"
              checked={values.includes(item.value)}
              onChange={(e) => changeHandler(e)}
            />
            <label>
              <div className="checkbox-control__indicator" />
              <span className="audience_label">{item.name}</span>
            </label>
          </div>
        );
      })}
    </div>
  );
}

export default Checkboxes;
