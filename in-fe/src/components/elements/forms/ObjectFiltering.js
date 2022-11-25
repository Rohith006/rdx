import React, { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { resetPage } from "../../../redux/reducers/pagingSlice";
import TextField from "@mui/material/TextField";
// import Button from "./Button";
import Button from "../../../UI/Button";
import "./ObjectFiltering.css";
import { AiOutlineFilter } from "react-icons/ai";
import DataTimePicker from "../datepickers/DateTimePicker";
import MenuItem from "@mui/material/MenuItem";
import PropTypes from "prop-types";

export default function ObjectFiltering({
  type,
  initDate,
  onFilterClick,
  initRefresh,
  onRefreshChange,
}) {
  const [fromDate, setFromDate] = useState(initDate.minDate);
  const [toDate, setToDate] = useState(initDate.maxDate);
  const [query, setQuery] = useState(initDate.where);

  const dispatch = useDispatch();

  const external = (url, newWindow = false) => {
    if (newWindow === true) {
      return () =>
        window.open(url, "_blank", "location=yes,scrollbars=yes,status=yes");
    } else {
      return () => (window.location.href = url);
    }
  };

  const onSetDateFrom = useCallback(
    (date) => {
      localStorage.setItem(type + "DateFrom", JSON.stringify(date));
      setFromDate(date);
    },
    [type]
  );

  const onSetDateTo = useCallback(
    (date) => {
      localStorage.setItem(type + "DateTo", JSON.stringify(date));
      setToDate(date);
    },
    [type]
  );

  function setRefreshRate(rate) {
    onRefreshChange(rate);
  }

  function setQueryChange(ev) {
    setQuery(ev.target.value);
  }

  function onEnterPressed(ev) {
    if (ev.key === "Enter") {
      onReady();
    }
  }

  function onReady() {
    localStorage.setItem(type + "Query", query);
    dispatch(resetPage());
    onFilterClick({
      from: fromDate,
      to: toDate,
      where: query,
    });
  }

  return (
    <section className="flex justify-between">
      <div className="flex w-4/5 gap-4 items-center">
        <TextField
          select
          variant="outlined"
          size="small"
          value={initRefresh}
          onChange={(ev) => setRefreshRate(ev.target.value)}
        >
          <MenuItem value={0} selected>
            No refresh
          </MenuItem>
          <MenuItem value={5}>5 seconds</MenuItem>
          <MenuItem value={15}>15 seconds</MenuItem>
          <MenuItem value={30}>30 seconds</MenuItem>
          <MenuItem value={60}>1 minute</MenuItem>
        </TextField>
        <div className="flex-auto">
          <TextField
            id="search-input"
            label="Filter"
            value={query}
            onKeyPressCapture={onEnterPressed}
            onChange={setQueryChange}
            size="small"
            variant="outlined"
            fullWidth
          />
          {/* <div style={{ fontSize: 11 }}>
            Do not know how to filter. Click{" "}
            <a
              style={{ textDecoration: "underline", cursor: "pointer" }}
              onClick={external(
                "http://docs.Tracardi.com/running/filtering/",
                true
              )}
            >
              here
            </a>{" "}
            for information.
          </div> */}
        </div>
        <DataTimePicker
          type="FromDate"
          datetime={fromDate}
          onDatetimeSelect={onSetDateFrom}
        />
        <DataTimePicker
          type="ToDate"
          datetime={toDate}
          onDatetimeSelect={onSetDateTo}
        />
      </div>
      <Button
        className="h-10 bg-secondary-button font-semibold text-base uppercase rounded text-center text-primary-text px-4 flex items-center"
        text="Apply"
        onClick={onReady}
      />
      {/* <Button
        className="btn_apply"
        // label="Filter"
        label="Apply"
        onClick={onReady}
      /> */}
    </section>
  );
}

ObjectFiltering.propTypes = {
  type: PropTypes.string,
  initDate: PropTypes.object,
  onFilterClick: PropTypes.func,
  initRefresh: PropTypes.number,
  onRefreshChange: PropTypes.func,
};
