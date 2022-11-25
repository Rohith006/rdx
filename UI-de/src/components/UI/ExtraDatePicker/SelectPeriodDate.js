import React, { useState } from "react";
import DatePicker from "react-datepicker";
import moment from "moment";

export default function SelectPeriodDate(props) {
  const { startDate, endDate, names, onSelectTimeChange } = props;
  const [errorStartDate, setErrorStartDate] = useState(false);
  const [errorEndDate, setErrorEndDate] = useState(false);

  const firstFieldName = (names && names.start) || "startDate";
  const secondFieldName = (names && names.end) || "endDate";
  let date = [];

  function enumerateDaysBetweenDates(startDate, endDate) {
    while (moment(startDate) < moment(endDate)) {
      date.push(startDate);
      startDate = moment(startDate).add(1, "days");
    }
    return date;
  }

  let dateRange = enumerateDaysBetweenDates(startDate, endDate);

  function dateHandler(date, type) {
    if (endDate) {
      if (
        (type === firstFieldName && date.format("YYYY-MM-DD") === endDate) ||
        (type === secondFieldName && date.format("YYYY-MM-DD") === startDate)
      ) {
        onSelectTimeChange(date, type);
        return;
      }
      if (type === firstFieldName && +new Date(date) > +new Date(endDate)) {
        setErrorStartDate(true);
        setTimeout(() => setErrorStartDate(false), 400);
        return;
      }
      if (type === secondFieldName && +new Date(date) < +new Date(startDate)) {
        setErrorEndDate(true);
        setTimeout(() => setErrorEndDate(false), 400);
        return;
      }
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
          calendarClassName="date-picker-custom-class"
          selected={moment(startDate)}
          highlightDates={dateRange}
          minDate={props.minDate || moment().subtract(6, "month")}
          onChange={(date) => dateHandler(date, firstFieldName)}
          className="date-picker-custom"
          autoComplete="off"
          showYearDropdown
          showMonthDropdown
          minDate={moment().subtract(30, "years")}
          maxDate={moment().add(0, "years")}
        />
      </div>
      {endDate ? (
        <div className={`picker-wrapper ${errorEndDate ? "error" : ""}`}>
          <DatePicker
            inline
            selected={moment(endDate)}
            highlightDates={dateRange}
            calendarClassName="date-picker-custom-class"
            minDate={props.minDate || moment().subtract(6, "month")}
            onChange={(date) => dateHandler(date, secondFieldName)}
            className="date-picker-custom"
            autoComplete="off"
            showYearDropdown
            showMonthDropdown
            minDate={moment().subtract(30, "years")}
            maxDate={moment().add(0, "years")}
          />
        </div>
      ) : null}
    </div>
  );
}
