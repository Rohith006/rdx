import React, { useState } from "react";
import Chip from "@mui/material/Chip";
import Autocomplete from "@mui/material/Autocomplete";
import makeStyles from "@mui/styles/makeStyles";
import TextField from "@mui/material/TextField";
import PropTypes from "prop-types";

const useStyles = makeStyles((theme) => ({
  root: {
    "& > * + *": {
      marginTop: theme.spacing(3),
    },
  },
}));

export default function TuiTagger({
  label,
  placeholder,
  tags,
  onChange,
  freeSolo = true,
  multiple = true,
}) {
  if (typeof tags === "undefined" || !tags) {
    tags = [];
  }

  const classes = useStyles();
  // eslint-disable-next-line
  const [defaultValues, setDefaultValues] = useState([...tags]);

  const handleChange = (ev, value, reason) => {
    if (onChange) {
      onChange(value, reason);
    }
  };

  return (
    <div className={classes.root}>
      <Autocomplete
        multiple={multiple}
        freeSolo={freeSolo}
        size="small"
        onChange={(ev, value, reason) => {
          handleChange(ev, value, reason);
        }}
        options={tags}
        defaultValue={defaultValues}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip size="small" label={option} {...getTagProps({ index })} />
          ))
        }
        renderInput={(params) => (
          <TextField
            className="w-2/5"
            {...params}
            variant="outlined"
            placeholder={placeholder}
          />
        )}
      />
    </div>
  );
}

TuiTagger.propTypes = {
  label: PropTypes.string,
  placeholder: PropTypes.string,
  onChange: PropTypes.func,
  tags: PropTypes.array,
  freeSolo: PropTypes.bool,
  multiple: PropTypes.bool,
};
