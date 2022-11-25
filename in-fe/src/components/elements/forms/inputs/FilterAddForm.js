import React from "react";
import "./FilterAddForm.css";
import FilterTextField from "./FilterTextField";
// import Button from "../Button";
import Button from "../../../../UI/Button";
import PropTypes from "prop-types";

export default function FilterAddForm({
  textFieldLabel,
  buttonLabel,
  buttonIcon,
  onFilter,
  onAdd,
  style,
  icon,
}) {
  return (
    <div className="flex gap-4">
      <FilterTextField label={textFieldLabel} onSubmit={onFilter} />
      {buttonLabel && (
        <Button
          text={buttonLabel}
          onClick={onAdd}
          className="bg-primary-button cursor-pointer flex items-center px-4 text-white font-semibold rounded-lg"
          icon={icon}
        />
        // <Button label={buttonLabel} onClick={onAdd} icon={buttonIcon} />
      )}
    </div>
  );
}

FilterAddForm.propTypes = {
  textFieldLabel: PropTypes.string,
  buttonIcon: PropTypes.element,
  buttonLabel: PropTypes.string,
  onFilter: PropTypes.func,
  onAdd: PropTypes.func,
};
