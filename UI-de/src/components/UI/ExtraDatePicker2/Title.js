import React from 'react';
import moment from 'moment';

export default function Title(props) {
  const {startDate} = props;
  const newStartDate = typeof startDate !== 'string' ? moment(startDate).format('YYYY-MM-DD') : startDate;
  return (
    <div className="tags-list-title">
      {newStartDate}
    </div>
  );
}
