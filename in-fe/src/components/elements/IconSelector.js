import FlowNodeIcons, { icons } from "../flow/FlowNodeIcons";
import React, { useState } from "react";
import "./IconSelector.css";
import { TextField, Popover } from "@mui/material";
import Button from "./forms/Button";

const IconSelector = ({ value = "", onChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [iconName, setIconName] = useState(value);

  const handleChange = (iconName) => {
    setIconName(iconName);
    if (onChange) {
      onChange(iconName);
    }
  };

  const handlePopover = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const Icon = ({ icon, size, onClick }) => {
    return (
      <span className="Icon" onClick={onClick}>
        {icon(size)}
      </span>
    );
  };

  return (
    <div className="flex flex-row m-3 items-center">
      <span className="mr-3">
        <FlowNodeIcons icon={iconName} size={30} />
      </span>

      <TextField
        style={{
          width: "150px",
        }}
        value={iconName}
        variant="outlined"
        size="small"
        label="Icon"
      />

      <Button
        style={{
          marginLeft: "10px",
        }}
        onClick={handlePopover}
        label="Select icon"
      />

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <div className="IconList">
          {Object.values(icons).map((item, index) => (
            <Icon
              key={index}
              icon={item}
              size={20}
              onClick={() => {
                handleChange(Object.keys(icons)[index]);
              }}
            />
          ))}
        </div>
      </Popover>
    </div>
  );
};

export default IconSelector;
