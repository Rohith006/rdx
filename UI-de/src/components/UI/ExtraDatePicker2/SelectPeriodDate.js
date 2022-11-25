import React, { useState } from "react";
import DatePicker from "react-datepicker";
import moment from "moment";
import { HOURLY } from "../../../constants/reports";

export default function SelectPeriodDate(props) {
  const { startDate, endDate, onSelectTimeChange, tableType } = props;
  const [errorStartDate, setErrorStartDate] = useState(false);
  const [errorEndDate, setErrorEndDate] = useState(false);

  function dateHandler(date, type) {
    if (
      (type === "startDate" && date.format("YYYY-MM-DD") === endDate) ||
      (type === "endDate" && date.format("YYYY-MM-DD") === startDate)
    ) {
      onSelectTimeChange(date, type);
      return;
    }
    if (type === "startDate" && +new Date(date) > +new Date(endDate)) {
      setErrorStartDate(true);
      setTimeout(() => setErrorStartDate(false), 400);
      return;
    }
    if (type === "endDate" && +new Date(date) < +new Date(startDate)) {
      setErrorEndDate(true);
      setTimeout(() => setErrorEndDate(false), 400);
      return;
    }
    props.setList(
      props.list.map((el) =>
        el.id === 7 ? { ...el, isActive: true } : { ...el, isActive: false }
      )
    );
    onSelectTimeChange(date, type);
  }

  return (
    <div className="date-pickers">
      <div
        style={{ marginRight: "10px" }}
        className={`picker-wrapper ${errorStartDate ? "error" : ""}`}
      >
        <DatePicker
          inline
          selected={moment(startDate)}
          maxDate={moment()}
          minDate={moment().subtract(6, "month")}
          onChange={(date) => dateHandler(date, "startDate")}
          className="date-picker-custom"
          autoComplete="off"
          showYearDropdown
          showMonthDropdown
          minDate={moment().subtract(30, "years")}
          maxDate={moment().add(0, "years")}
        />
      </div>
    </div>
  );
}
