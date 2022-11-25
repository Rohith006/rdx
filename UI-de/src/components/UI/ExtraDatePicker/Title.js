import React from 'react';
import moment from 'moment';

export default function Title({startDate, endDate}) {
  let title = moment(startDate).format('YYYY-MM-DD');
  if (endDate) {
    title += ` - ${moment(endDate).format('YYYY-MM-DD')}`;
  }
  return (
    <div className="tags-list-title">
      {title}
    </div>
  );
}
