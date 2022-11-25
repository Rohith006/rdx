import React, { useState } from "react";
import Tabs, { TabCase } from "../tabs/Tabs";
import "./DateTimePicker.css";
import Popover from "@mui/material/Popover";
import makeStyles from "@mui/styles/makeStyles";
import Button from "../forms/Button";
import CalendarPicker from "./CalendarPicker";
import RelativePicker from "./RelativePicker";
import { IoCalendarOutline } from "react-icons/io5";
import NowDateTime from "./NowDateTime";
import PropTypes from "prop-types";

export default function DataTimePicker({ type, datetime, onDatetimeSelect }) {
  const activeTab = (datetime) => {
    if (datetime?.delta === null && datetime.absolute === null) {
      return 2;
    }

    if (datetime?.delta?.value && datetime.delta.value != null) {
      return 1;
    }

    return 0;
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const [tab, setTab] = useState(activeTab(datetime));

  // const onDateTimeSet = (datetime) => {
  //     onDatetimeSelect(datetime);
  // }

  const handleDisplay = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "datetime-popover" : undefined;

  const useStyles = makeStyles((theme) => ({
    root: {
      marginTop: 5,
      transform: "none",
      transition: "none",
    },
  }));

  const classes = useStyles();

  const datetimeString = (datetime) => {
    if (
      datetime == null ||
      (datetime?.absolute === null && datetime?.delta === null)
    ) {
      return "now";
    }

    if (datetime?.delta?.value) {
      return (
        datetime.delta.type +
        " " +
        datetime.delta.value +
        " " +
        datetime.delta.entity
      );
    }

    if (datetime?.absolute) {
      return (
        datetime.absolute.year +
        "/" +
        datetime.absolute.month +
        "/" +
        datetime.absolute.date +
        " @ " +
        datetime.absolute.hour +
        ":" +
        datetime.absolute.minute +
        ":" +
        datetime.absolute.second +
        datetime.absolute.meridiem
      );
    }

    return "Error";
  };

  return (
    <>
      <Button
        icon={<IoCalendarOutline size={24} />}
        label={datetimeString(datetime)}
        onClick={handleDisplay}
      />
      
      <Popover
        id={id}
        className={classes.root}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <div className="DateTimePicker">
          <Tabs
            tabs={["Date & time", "Relative", "Now"]}
            defaultTab={tab}
            onTabSelect={setTab}
          >
            <TabCase id={0}>
              <CalendarPicker
                onDateSelect={onDatetimeSelect}
                datetime={datetime}
              />
            </TabCase>
            <TabCase id={1}>
              <RelativePicker
                type={type}
                onDateSelect={onDatetimeSelect}
                datetime={datetime}
              />
            </TabCase>
            <TabCase id={2}>
              <NowDateTime onDateSelect={onDatetimeSelect} />
            </TabCase>
          </Tabs>
        </div>
      </Popover>
    </>
  );
}

DataTimePicker.propTypes = {
  datetime: PropTypes.object,
  onDatetimeSelect: PropTypes.func,
  type: PropTypes.string,
};