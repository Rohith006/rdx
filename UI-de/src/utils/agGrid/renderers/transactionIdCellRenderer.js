import React from 'react';

export const transactionIdCellRenderer = ({data, value}) => {
  return <a href={data.receipt_url} target="_blank" rel="noreferrer">{value}</a>;
};
