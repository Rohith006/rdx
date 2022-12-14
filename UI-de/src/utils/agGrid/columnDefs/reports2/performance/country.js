export const columnsCountryTabPerformance = {
  ADMIN: [
    {
      headerName: 'Country',
      field: 'geo',
      headerClass: 'ag-grid-header-cell',
      cellRenderer: 'countryCellRenderer',
      tooltip: (params) => params.data.countryCode,
      minWidth: 25,
      maxWidth: 150,
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
      headerName: 'Bid rate (%)',
      field: 'bidRate',
      headerClass: 'ag-grid-header-cell',
      cellRenderer: 'customToFixed',
      minWidth: 50,
      maxWidth: 380,
    },
    {
      headerName: 'Impressions', children: [
        {
          headerName: 'Total',
          field: 'impressions',
          headerClass: 'ag-grid-header-cell',
          cellRenderer: 'customNumberFormat',
          minWidth: 50,
          maxWidth: 380,
        },
        {
          headerName: 'Rejected',
          field: 'rejectedImpressions',
          headerClass: 'ag-grid-header-cell',
          minWidth: 50,
          maxWidth: 380,
        },
      ],
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
      headerName: 'Total ($)',
      field: 'profit',
      headerClass: 'ag-grid-header-cell',
      cellRenderer: 'profitCellRenderer',
      minWidth: 50,
      maxWidth: 380,
    },
  ],
  ACCOUNT_MANAGER: [
    {
      headerName: 'Id',
      field: 'id',
      headerClass: 'ag-grid-header-cell',
      minWidth: 25,
      maxWidth: 150,
    },
    {
      headerName: 'Campaign',
      field: 'campaignId',
      headerClass: 'ag-grid-header-cell',
      cellRenderer: 'campaignCellRenderer',
      minWidth: 50,
      maxWidth: 480,
    },
    {
      headerName: 'Advertiser',
      field: 'advertiserId',
      headerClass: 'ag-grid-header-cell',
      cellRenderer: 'advertiserCellRenderer',
      minWidth: 50,
      maxWidth: 350,
      pinnedRowCellRenderer: ({value}) => value,
    },
    {
      headerName: 'Impressions',
      field: 'impressionsCount',
      headerClass: 'ag-grid-header-cell',
      minWidth: 50,
      maxWidth: 380,
      cellRenderer: 'customNumberFormat',
    },
    {
      headerName: 'Clicks',
      field: 'clicksCount',
      headerClass: 'ag-grid-header-cell',
      minWidth: 50,
      maxWidth: 380,
      cellRenderer: 'customNumberFormat',
    },
    {
      headerName: 'Conversions', children: [
        {
          headerName: 'Total',
          field: 'conversionsCount',
          headerClass: 'ag-grid-header-cell',
          cellRenderer: 'customToFixed',
          minWidth: 50,
          maxWidth: 380,
        },
        {
          headerName: 'Rejected',
          field: 'rejectedConversionsCount',
          headerClass: 'ag-grid-header-cell',
          cellRenderer: 'customToFixed',
          minWidth: 50,
          maxWidth: 380,
        },
        {
          headerName: 'Approved',
          field: 'approvedConversionsCount',
          headerClass: 'ag-grid-header-cell',
          cellRenderer: 'customToFixed',
          minWidth: 50,
          maxWidth: 380,
        },
      ],
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
      headerName: 'CR (%)',
      field: 'cr',
      headerClass: 'ag-grid-header-cell',
      cellRenderer: 'customToFixed',
      minWidth: 50,
      maxWidth: 380,
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
      headerName: 'Revenue ($)',
      field: 'spentAdvertiser',
      headerClass: 'ag-grid-header-cell',
      cellRenderer: 'amountCellRenderer',
      minWidth: 50,
      maxWidth: 380,
    },
  ],
  ADVERTISER: [
    {
      headerName: 'Country',
      field: 'geo',
      headerClass: 'ag-grid-header-cell',
      cellRenderer: 'countryCellRenderer',
      tooltip: (params) => params.data.countryCode,
      minWidth: 50,
      maxWidth: 150,
    },
    {
      headerName: 'Requests',
      field: 'requests',
      headerClass: 'ag-grid-header-cell',
      minWidth: 90,
      maxWidth: 380,
      cellRenderer: 'customNumberFormat',
    },
    {
      headerName: 'Responses',
      field: 'responses',
      headerClass: 'ag-grid-header-cell',
      minWidth: 125,
      maxWidth: 380,
      cellRenderer: 'customNumberFormat',
    },
    {
      headerName: 'Fill rate (%)',
      field: 'fillRate',
      headerClass: 'ag-grid-header-cell',
      cellRenderer: 'customToFixed',
      minWidth: 125,
      maxWidth: 380,
    },
    {
      headerName: 'Impressions', children: [
        {
          headerName: 'Total',
          field: 'impressions',
          headerClass: 'ag-grid-header-cell',
          cellRenderer: 'customNumberFormat',
          minWidth: 125,
          maxWidth: 380,
        },
        {
          headerName: 'Rejected',
          field: 'rejectedImpressions',
          headerClass: 'ag-grid-header-cell',
          minWidth: 125,
          maxWidth: 380,
        },
      ],
    },
    {
      headerName: 'Win rate (%)',
      field: 'winRate',
      headerClass: 'ag-grid-header-cell',
      cellRenderer: 'customToFixed',
      minWidth: 125,
      maxWidth: 380,
    },
    {
      headerName: 'Clicks',
      field: 'clicks',
      headerClass: 'ag-grid-header-cell',
      minWidth: 125,
      maxWidth: 380,
      cellRenderer: 'customNumberFormat',
    },
    {
      headerName: 'CTR (%)',
      field: 'ctr',
      headerClass: 'ag-grid-header-cell',
      minWidth: 125,
      maxWidth: 380,
      cellRenderer: 'customToFixed',
    },
    {
      headerName: 'Bid floor ($)',
      field: 'bidFloor',
      headerClass: 'ag-grid-header-cell',
      cellRenderer: 'amountCellRenderer',
      minWidth: 125,
      maxWidth: 380,
    },
    {
      headerName: 'eCPM ($)',
      field: 'eCPM',
      headerClass: 'eCPM',
      cellRenderer: 'amountCellRenderer',
      minWidth: 125,
      maxWidth: 380,
    },
    {
      headerName: 'Spend ($)',
      field: 'revenue',
      headerClass: 'ag-grid-header-cell',
      cellRenderer: 'amountCellRenderer',
      minWidth: 125,
      maxWidth: 380,
    },
  ],
  PUBLISHER: [
    {
      headerName: 'Country',
      field: 'geo',
      headerClass: 'ag-grid-header-cell',
      cellRenderer: 'countryCellRenderer',
      tooltip: (params) => params.data.countryCode,
      minWidth: 25,
      maxWidth: 150,
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
      headerName: 'Impressions', children: [
        {
          headerName: 'Total',
          field: 'impressions',
          headerClass: 'ag-grid-header-cell',
          cellRenderer: 'customNumberFormat',
          minWidth: 50,
          maxWidth: 380,
        },
        {
          headerName: 'Rejected',
          field: 'rejectedImpressions',
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
      field: 'payout',
      headerClass: 'ag-grid-header-cell',
      cellRenderer: 'amountCellRenderer',
      minWidth: 50,
      maxWidth: 380,
    },
  ],
};
