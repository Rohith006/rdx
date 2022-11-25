export default [
  {headerName: 'Transaction ID', field: 'orderID', cellRenderer: 'transactionIdCellRenderer', headerClass: 'ag-grid-header-cell'},
  {headerName: 'Date', field: 'createdAt', headerClass: 'ag-grid-header-cell', cellRenderer: 'dateCellRenderer'},
  {headerName: 'Name', field: 'name', headerClass: 'ag-grid-header-cell'},
  {headerName: 'Amount', field: 'amount', headerClass: 'ag-grid-header-cell'},
  {headerName: 'Currency', field: 'currency', headerClass: 'ag-grid-header-cell'},
  {headerName: 'Payment Type', field: 'paymentType', headerClass: 'ag-grid-header-cell'},
  {headerName: 'Status', field: 'status', cellRenderer: 'statusRenderer', headerClass: 'ag-grid-header-cell'},
];
