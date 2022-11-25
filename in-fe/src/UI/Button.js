import React from "react";

const Button = ({ onClick, text, className, icon, disabled }) => (
  <span onClick={onClick} className={`${className} cursor-pointer`}>
    {icon && <img className="w-6 pr-2" src={icon} alt="add" />}
    {text}
  </span>
);

export default Button;
