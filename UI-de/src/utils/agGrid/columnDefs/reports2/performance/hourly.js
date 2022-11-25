export const columnsHourlyTabPerformance = {
  ADMIN: [
    {
      headerName: 'Date',
      field: 'h',
      headerClass: 'ag-grid-header-cell',
      minWidth: 50,
      maxWidth: 380,
      pinnedRowCellRenderer: ({value}) => value,
    },
    {
      headerName: 'Requests',
      field: 'requests',
      headerClass: 'ag-grid-header-cell',
      minWidth: 50,
      maxWidth: 380,
      cellRenderer: 'customNumberFormat',
    },
    {
      headerName: 'Responses',
      field: 'responses',
      headerClass: 'ag-grid-header-cell',
      minWidth: 50,
      maxWidth: 380,
      cellRenderer: 'customNumberFormat',
    },
    {
      headerName: 'Fill rate (%)',
      field: 'fillRate',
      headerClass: 'ag-grid-header-cell',
      cellRenderer: 'customToFixed',
      minWidth: 50,
      maxWidth: 380,
    },
    {
      headerName: 'Impressions',
      children: [
        {
          headerName: 'Total',
          field: 'impressions',
          headerClass: 'ag-grid-header-cell',
          cellRenderer: 'customNumberFormat',
          minWidth: 50,
          maxWidth: 380,
        },
        {
          headerName: 'Approved',
          field: 'approvedImpressions',
          headerClass: 'ag-grid-header-cell',
          minWidth: 50,
          maxWidth: 380,
        },
        {
          headerName: '%',
          field: 'percentApproved',
          headerClass: 'ag-grid-header-cell',
          minWidth: 50,
          maxWidth: 380,
        },
      ],
    },
    {
      headerName: 'Invalid Impressions', children: [
        {
          headerName: 'Total',
          field: 'rejectedImpressions',
          headerClass: 'ag-grid-header-cell',
          cellRenderer: 'customNumberFormat',
          minWidth: 50,
          maxWidth: 380,
        },
        {
          headerName: '%',
          field: 'percentRejectedImpressions',
          headerClass: 'ag-grid-header-cell',
          minWidth: 50,
          maxWidth: 380,
        },
        {
          headerName: 'Duplicate',
          field: 'duplicateImpressions',
          headerClass: 'ag-grid-header-cell',
          minWidth: 50,
          maxWidth: 380,
        },
        {
          headerName: '%',
          field: 'percentDuplicateImpressions',
          headerClass: 'ag-grid-header-cell',
          minWidth: 50,
          maxWidth: 380,
        },
        {
          headerName: 'Expired',
          field: 'expiredImpressions',
          headerClass: 'ag-grid-header-cell',
          minWidth: 50,
          maxWidth: 380,
        },
        {
          headerName: '%',
          field: 'percentExpiredImpressions',
          headerClass: 'ag-grid-header-cell',
          minWidth: 50,
          maxWidth: 380,
        },
        {
          headerName: 'Target Mismatch',
          field: 'mismatchImpressions',
          headerClass: 'ag-grid-header-cell',
          minWidth: 50,
          maxWidth: 380,
        },
        {
          headerName: '%',
          field: 'percentMismatchImpressions',
          headerClass: 'ag-grid-header-cell',
          minWidth: 50,
          maxWidth: 380,
        },
      ],
    },
    {
      headerName: 'Win rate (%)',
      field: 'winRate',
      headerClass: 'ag-grid-header-cell',
      cellRenderer: 'customToFixed',
      minWidth: 50,
      maxWidth: 380,
    },
    {
      headerName: 'Clicks',
      field: 'clicks',
      headerClass: 'ag-grid-header-cell',
      minWidth: 50,
      maxWidth: 380,
      cellRenderer: 'customNumberFormat',
    },
    {
      headerName: 'CTR (%)',
      field: 'ctr',
      headerClass: 'ag-grid-header-cell',
      minWidth: 50,
      maxWidth: 380,
      cellRenderer: 'customToFixed',
    },
    {
      headerName: 'Bid floor ($)',
      field: 'bidFloor',
      headerClass: 'ag-grid-header-cell',
      cellRenderer: 'amountCellRenderer',
      minWidth: 50,
      maxWidth: 380,
    },
    {
      headerName: 'eCPM ($)',
      field: 'eCPM',
      headerClass: 'eCPM',
      cellRenderer: 'amountCellRenderer',
      minWidth: 50,
      maxWidth: 380,
    },
    {
      headerName: 'Revenue ($)',
      field: 'revenue',
      headerClass: 'ag-grid-header-cell',
      cellRenderer: 'amountCellRenderer',
      minWidth: 50,
      maxWidth: 380,
    },
    {
      headerName: 'Payout ($)',
      field: 'payout',
      headerClass: 'ag-grid-header-cell',
      cellRenderer: 'amountCellRenderer',
      minWidth: 50,
      maxWidth: 380,
    },
    {
      headerName: 'Profit ($)',
      field: 'profit',
      headerClass: 'ag-grid-header-cell',
      cellRenderer: 'amountCellRenderer',
      minWidth: 50,
      maxWidth: 380,
    },
  ],
  ACCOUNT_MANAGER: [
    {
      headerName: 'Date',
      field: 'h',
      headerClass: 'ag-grid-header-cell',
      minWidth: 50,
      maxWidth: 380,
      pinnedRowCellRenderer: ({value}) => value,
    },
    {
      headerName: 'Requests',
      field: 'requests',
      headerClass: 'ag-grid-header-cell',
      minWidth: 50,
      maxWidth: 380,
      cellRenderer: 'customNumberFormat',
    },
    {
      headerName: 'Responses',
      field: 'responses',
      headerClass: 'ag-grid-header-cell',
      minWidth: 50,
      maxWidth: 380,
      cellRenderer: 'customNumberFormat',
    },
    {
      headerName: 'Fill rate (%)',
      field: 'fillRate',
      headerClass: 'ag-grid-header-cell',
      cellRenderer: 'customToFixed',
      minWidth: 50,
      maxWidth: 380,
    },
    {
      headerName: 'Impressions',
      children: [
        {
          headerName: 'Total',
          field: 'impressions',
          headerClass: 'ag-grid-header-cell',
          cellRenderer: 'customNumberFormat',
          minWidth: 50,
          maxWidth: 380,
        },
        {
          headerName: 'Approved',
          field: 'approvedImpressions',
          headerClass: 'ag-grid-header-cell',
          minWidth: 50,
          maxWidth: 380,
        },
        {
          headerName: '%',
          field: 'percentApproved',
          headerClass: 'ag-grid-header-cell',
          minWidth: 50,
          maxWidth: 380,
        },
      ],
    },
    {
      headerName: 'Invalid Impressions', children: [
        {
          headerName: 'Total',
          field: 'rejectedImpressions',
          headerClass: 'ag-grid-header-cell',
          cellRenderer: 'customNumberFormat',
          minWidth: 50,
          maxWidth: 380,
        },
        {
          headerName: '%',
          field: 'percentRejectedImpressions',
          headerClass: 'ag-grid-header-cell',
          minWidth: 50,
          maxWidth: 380,
        },
        {
          headerName: 'Duplicate',
          field: 'duplicateImpressions',
          headerClass: 'ag-grid-header-cell',
          minWidth: 50,
          maxWidth: 380,
        },
        {
          headerName: '%',
          field: 'percentDuplicateImpressions',
          headerClass: 'ag-grid-header-cell',
          minWidth: 50,
          maxWidth: 380,
        },
        {
          headerName: 'Expired',
          field: 'expiredImpressions',
          headerClass: 'ag-grid-header-cell',
          minWidth: 50,
          maxWidth: 380,
        },
        {
          headerName: '%',
          field: 'percentExpiredImpressions',
          headerClass: 'ag-grid-header-cell',
          minWidth: 50,
          maxWidth: 380,
        },
        {
          headerName: 'Target Mismatch',
          field: 'mismatchImpressions',
          headerClass: 'ag-grid-header-cell',
          minWidth: 50,
          maxWidth: 380,
        },
        {
          headerName: '%',
          field: 'percentMismatchImpressions',
          headerClass: 'ag-grid-header-cell',
          minWidth: 50,
          maxWidth: 380,
        },
      ],
    },
    {
      headerName: 'Win rate (%)',
      field: 'winRate',
      headerClass: 'ag-grid-header-cell',
      cellRenderer: 'customToFixed',
      minWidth: 50,
      maxWidth: 380,
    },
    {
      headerName: 'Clicks',
      field: 'clicks',
      headerClass: 'ag-grid-header-cell',
      minWidth: 50,
      maxWidth: 380,
      cellRenderer: 'customNumberFormat',
    },
    {
      headerName: 'CTR (%)',
      field: 'ctr',
      headerClass: 'ag-grid-header-cell',
      minWidth: 50,
      maxWidth: 380,
      cellRenderer: 'customToFixed',
    },
    {
      headerName: 'Bid floor ($)',
      field: 'bidFloor',
      headerClass: 'ag-grid-header-cell',
      cellRenderer: 'amountCellRenderer',
      minWidth: 50,
      maxWidth: 380,
    },
    {
      headerName: 'eCPM ($)',
      field: 'eCPM',
      headerClass: 'eCPM',
      cellRenderer: 'amountCellRenderer',
      minWidth: 50,
      maxWidth: 380,
    },
    {
      headerName: 'Revenue ($)',
      field: 'revenue',
      headerClass: 'ag-grid-header-cell',
      cellRenderer: 'amountCellRenderer',
      minWidth: 50,
      maxWidth: 380,
    },
    {
      headerName: 'Payout ($)',
      field: 'payout',
      headerClass: 'ag-grid-header-cell',
      cellRenderer: 'amountCellRenderer',
      minWidth: 50,
      maxWidth: 380,
    },
    {
      headerName: 'Profit ($)',
      field: 'profit',
      headerClass: 'ag-grid-header-cell',
      cellRenderer: 'amountCellRenderer',
      minWidth: 50,
      maxWidth: 380,
    },
  ],
};