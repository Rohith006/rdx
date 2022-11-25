import React from 'react';
import classNames from 'classnames';

export default ({value, data}) => {
  value = value && value.toLowerCase();
  return (
    <div className="status-cover">
      <div className={classNames('status', {
        'approved': value && (value === 'approved' || value === 'accepted' || value === 'test'),
        'rejected': value && (value === 'rejected'),
        'invalid': value && (value === 'invalid'),
      })}>
        {value}
      </div>
      {/*      <div
        className={classNames('conversion-status-cell-renderer__reject-reason', {'hidden': value && value === 'approved' || value === 'test'})}>
        {data.rejectReason || data.reason}
      </div>*/}
    </div>
  );
};
