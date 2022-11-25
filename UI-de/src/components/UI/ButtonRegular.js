import React from "react";

const ButtonRegular = ({
  type,
  children,
  color,
  width,
  height,
  disabled,
  onClick,
  margin,
}) => (
  <button
    disabled={disabled}
    onClick={onClick}
    type={type}
    style={{ width, margin, height,borderRadius:'4px' }}
    className={"btn " + color}
  >
    {children}
  </button>
);
export default ButtonRegular;
