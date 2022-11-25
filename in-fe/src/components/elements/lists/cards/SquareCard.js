import React, { useState } from "react";
import "./SquareCard.css";

const SquareCard = ({ id, status, name, description, onClick, icon }) => {
  const statusClass = (status) => {
    return status
      ? "pb-3 m-3 border-b-8 border-success-border"
      : "pb-3 m-3 border-b-8 border-danger-border";
  };
  const [display, setDisplay] = useState(false);

  const handleHover = (value) => {
    setDisplay(value);
  };
  return (
    <div
      onClick={(ev) => {
        onClick(id);
      }}
      onMouseEnter={() => handleHover(true)}
      onMouseLeave={() => handleHover(false)}
      className="inline-flex items-center flex-col cursor-pointer w-[190px] min-h-[160px] my-2 p-4 rounded-lg border border-secondary-border bg-secondary-bg"
    >
      {display && description ? (
        <div className="text-center text-sm">{description}</div>
      ) : (
        <>
          <div className={statusClass(status)}>{icon}</div>
          <div className="text-center text-lg font-semibold mb-2">{name}</div>
        </>
      )}
    </div>
  );
};
export default React.memo(SquareCard);
