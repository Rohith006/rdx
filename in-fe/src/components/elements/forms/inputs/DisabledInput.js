import TextField from "@mui/material/TextField";
import React, { useState } from "react";
import Button from "../Button";
import edit from "../../../../assets/images/icons/edit.svg";
import CopyToClipboard from "../../../../UI/CopyToClipboard";

export default function DisabledInput({ value, label, onChange }) {
  const [inputValue, setInputValue] = useState(value);
  const [disabled, setDisabled] = useState(true);

  const handleChange = (value) => {
    setInputValue(value);
    if (onChange) {
      onChange(value);
    }
  };

  return (
    <div className="flex items-center">
      <div className="flex relative items-center justify-center gap-4 w-2/5">
        <TextField
          value={inputValue}
          onChange={(ev) => {
            handleChange(ev.target.value);
          }}
          size="small"
          disabled={disabled}
          variant="outlined"
          fullWidth
        />
        {/* <Button
        className="absolute right-0 flex items-center cursor-pointer"
        label="Edit"
        onClick={() => setDisabled(!disabled)}
        style={{ padding: "6px 10px" }}
        icon={<img src={edit} alt="edit" />}
      /> */}
      </div>
      <div className="ml-4">
        <CopyToClipboard value={inputValue} />
      </div>
    </div>
  );
}
