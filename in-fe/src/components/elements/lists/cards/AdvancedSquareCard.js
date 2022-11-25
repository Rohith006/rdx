import moment from "moment";
import React from "react";
import deleteIcon from "../../../../assets/images/icons/delete.svg";
import timeIcon from "../../../../assets/images/icons/clock.svg";

const AdvancedSquareCard = ({
  id,
  status,
  name,
  description,
  onClick,
  icon,
  onEdit,
  onDelete,
  typeOf,
  timestamp,
  tags,
  category,
  type,
}) => {
  const statusClass = (status) => {
    return status ? "active_chip" : "inactive_chip";
  };

  const handleDeleteClick = (e, id) => {
    e.stopPropagation();
    onDelete(id);
  };

  return (
    <div
      onClick={(ev) => {
        onClick(id);
      }}
      className="AdvancedSquareCard"
    >
      <div className="Details relative">
        {typeOf && (
          <div className="flex flex-col">
            <span className="AdvancedSquareCard_heading">{typeOf} name</span>
            <span>{name}</span>
          </div>
        )}
        {timestamp && (
          <div className="flex items-center">
            <img className="mr-2" src={timeIcon} alt="time" />
            <span>
              {moment(timestamp).format("dddd, MMMM ,YYYY, h:mm:ss a")}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="AdvancedSquareCard_icon"> {icon}</div>
          {type && (
            <div className="flex flex-col">
              <span className="AdvancedSquareCard_heading">{typeOf} type</span>
              <span>{type}</span>
            </div>
          )}
          {category && (
            <div className="flex flex-col">
              <span className="AdvancedSquareCard_heading">Category</span>
              <span>{category}</span>
            </div>
          )}
          {status && (
            <div className="flex flex-col">
              <span className="AdvancedSquareCard_heading">Status</span>
              <span className={statusClass(status)}>
                {status ? "Active" : "Inactive"}
              </span>
            </div>
          )}
        </div>
        {tags && (
          <div className="flex flex-col">
            <span className="AdvancedSquareCard_heading">Tag(s)</span>
            <span className="flex">
              {tags.map((item) => {
                return <div className="chips no-mar">{item}</div>;
              })}
            </span>
          </div>
        )}
        {description && (
          <div className="flex flex-col">
            <span className="AdvancedSquareCard_heading">Description</span>
            <span>{description}</span>
          </div>
        )}
        <div className="advanceCard_btns">
          <div className="btn_next advanceCard_btn" onClick={() => onEdit(id)}>
            Edit
          </div>
          <div
            className="btn_cancel advanceCard_btn"
            onClick={(e) => handleDeleteClick(e, id)}
          >
            <img src={deleteIcon} alt="delete" />
          </div>
        </div>
      </div>
    </div>
  );
};
export default React.memo(AdvancedSquareCard);
