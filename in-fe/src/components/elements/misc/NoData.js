import { BsEyeSlash } from "react-icons/bs";
import React from "react";

export default function NoData({ icon, header, children }) {
  const Icon = () => {
    if (icon) {
      return icon;
    }
    return <BsEyeSlash size={50} style={{ color: "#666" }} />;
  };

  return (
    <div className="flex flex-col items-center p-5">
      <Icon />
      <h1 className="font-light">{header}</h1>
      {children}
    </div>
  );
}
