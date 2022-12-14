export const columnsClicksTabPerformance = {
  ADMIN: [
    {
      headerName: 'Date',
      field: 'createdAt',
      headerClass: 'ag-grid-header-cell',
      cellRenderer: 'extendedDateCellRenderer',
      minWidth: 50,
      maxWidth: 380,
    },
    {
      headerName: 'Id',
      field: 'id',
      cellRenderer: 'clicksIdCellRenderer',
      headerClass: 'ag-grid-header-cell',
      minWidth: 50,
      maxWidth: 350,
    },
    {
      headerName: 'Impression',
      field: 'impId',
      cellRenderer: 'impressionIdCellRenderer',
      headerClass: 'ag-grid-header-cell',
      minWidth: 50,
      maxWidth: 350,
    },
    {
      headerName: 'Campaign',
      field: 'campaignName',
      headerClass: 'ag-grid-header-cell',
      minWidth: 50,
      maxWidth: 380,
    },
    {
      headerName: 'Advertiser',
      field: 'advertiserId',
      headerClass: 'ag-grid-header-cell',
      cellRenderer: 'advertiserCellRenderer',
      minWidth: 50,
      maxWidth: 380,
      pinnedRowCellRenderer: ({value}) => value,
    },
    {
      headerName: 'Publisher',
      field: 'publisherId',
      headerClass: 'ag-grid-header-cell',
      cellRenderer: 'publisherCellRenderer',
      minWidth: 50,
      maxWidth: 380,
    },
    {
      headerName: 'OS',
      field: 'os',
      headerClass: 'ag-grid-header-cell',
      minWidth: 50,
      maxWidth: 100,
    },
    {
      headerName: 'Country',
      field: 'geo',
      headerClass: 'ag-grid-header-cell',
      cellRenderer: 'countryCellRenderer', tooltip: (params) => params.data.countryCode,
      minWidth: 50,
      maxWidth: 380,
    },
    {
      headerName: 'Status',
      field: 'status',
      headerClass: 'ag-grid-header-cell',
      cellStyle: {textTransform: 'uppercase'},
      cellRenderer: 'conversionStatusCellRenderer',
      minWidth: 50,
      maxWidth: 380,
    },
  ],
  ACCOUNT_MANAGER: [
    {
      headerName: 'Date',
      field: 'createdAt',
      headerClass: 'ag-grid-header-cell',
      cellRenderer: 'extendedDateCellRenderer',
      minWidth: 50,
      maxWidth: 380,
    },
    {
      headerName: 'Id',
      field: 'id',
      cellRenderer: 'conversionIdRendererAdmin',
      headerClass: 'ag-grid-header-cell',
      minWidth: 50,
      maxWidth: 350,
    },
    {
      headerName: 'Campaign',
      field: 'campaignName',
      headerClass: 'ag-grid-header-cell',
      minWidth: 50,
      maxWidth: 380,
    },
    {
      headerName: 'Advertiser',
      field: 'advertiserId',
      headerClass: 'ag-grid-header-cell',
      cellRenderer: 'advertiserCellRenderer',
      minWidth: 50,
      maxWidth: 380,
      pinnedRowCellRenderer: ({value}) => value,
    },
    {
      headerName: 'Publisher',
      field: 'publisherId',
      headerClass: 'ag-grid-header-cell',
      cellRenderer: 'publisherCellRenderer',
      minWidth: 50,
      maxWidth: 380,
    },
    {
      headerName: 'OS',
      field: 'platform',
      headerClass: 'ag-grid-header-cell',
      minWidth: 50,
      maxWidth: 100,
    },
    {
      headerName: 'Device',
      field: 'device',
      headerClass: 'ag-grid-header-cell',
      minWidth: 50,
      maxWidth: 380,
    },
    {
      headerName: 'Geo',
      field: 'ip',
      headerClass: 'ag-grid-header-cell',
      cellRenderer: 'countryCellRenderer', tooltip: (params) => params.data.countryCode,
      minWidth: 50,
      maxWidth: 380,
    },
    {
      headerName: 'Status',
      field: 'status',
      headerClass: 'ag-grid-header-cell', cellStyle: {textTransform: 'uppercase',
      },
      cellRenderer: 'conversionStatusCellRenderer',
      minWidth: 50,
      maxWidth: 380,
    },
    /*    {
      headerName: 'Revenue ($)',
      field: 'payoutAdv',
      headerClass: 'ag-grid-header-cell',
      cellRenderer: 'amountCellRenderer',
      minWidth: 50,
      maxWidth: 380,
    },
    {
      headerName: 'Payout ($)',
      field: 'payoutPub',
      headerClass: 'ag-grid-header-cell',
      cellRenderer: 'amountCellRenderer',
      minWidth: 50,
      maxWidth: 380,
    },
    {
      headerName: 'Profit ($)',
      field: 'ownerEarnings',
      headerClass: 'ag-grid-header-cell',
      cellRenderer: 'amountCellRenderer',
      minWidth: 50,
      maxWidth: 380,
    },*/
  ],
  ADVERTISER: [
    {
      headerName: 'Date',
      field: 'createdAt',
      headerClass: 'ag-grid-header-cell',
      cellRenderer: 'extendedDateCellRenderer',
      minWidth: 50,
      maxWidth: 380,
    },
    {
      headerName: 'Id',
      field: 'id',
      cellRenderer: 'conversionIdRendererAdmin',
      headerClass: 'ag-grid-header-cell',
      minWidth: 50,
      maxWidth: 350,
    },
    {
      headerName: 'Campaign',
      field: 'campaignName',
      headerClass: 'ag-grid-header-cell',
      minWidth: 50,
      maxWidth: 380,
    },
    {
      headerName: 'Click id',
      field: 'clickId',
      headerClass: 'ag-grid-header-cell',
      minWidth: 50,
      maxWidth: 380,
    },
    {
      headerName: 'OS',
      field: 'platform',
      headerClass: 'ag-grid-header-cell',
      minWidth: 50,
      maxWidth: 100,
    },
    {
      headerName: 'Device',
      field: 'device',
      headerClass: 'ag-grid-header-cell',
      minWidth: 50,
      maxWidth: 380,
    },
    {
      headerName: 'Geo',
      field: 'ip',
      headerClass: 'ag-grid-header-cell',
      cellRenderer: 'countryCellRenderer', tooltip: (params) => params.data.countryCode,
      minWidth: 50,
      maxWidth: 380,
    },
    {
      headerName: 'Status',
      field: 'status',
      headerClass: 'ag-grid-header-cell', cellStyle: {textTransform: 'uppercase',
      },
      cellRenderer: 'conversionStatusCellRenderer',
      minWidth: 50,
      maxWidth: 380,
    },
    {
      headerName: 'Payout ($)',
      field: 'payoutAdv',
      headerClass: 'ag-grid-header-cell',
      cellRenderer: 'customToFixed',
      minWidth: 50,
      maxWidth: 380,
    },
  ],
  PUBLISHER: [
    {
      headerName: 'Date',
      field: 'createdAt',
      headerClass: 'ag-grid-header-cell',
      cellRenderer: 'extendedDateCellRenderer',
      minWidth: 50,
      maxWidth: 380,
    },
    {
      headerName: 'Id',
      field: 'id',
      cellRenderer: 'conversionIdRendererAdmin',
      headerClass: 'ag-grid-header-cell',
      minWidth: 50,
      maxWidth: 350,
    },
    {
      headerName: 'Campaign',
      field: 'campaignName',
      headerClass: 'ag-grid-header-cell',
      minWidth: 50,
      maxWidth: 380,
    },
    {
      headerName: 'Click id',
      field: 'clickId',
      headerClass: 'ag-grid-header-cell',
      minWidth: 50,
      maxWidth: 380,
    },
    {
      headerName: 'OS',
      field: 'platform',
      headerClass: 'ag-grid-header-cell',
      minWidth: 50,
      maxWidth: 100,
    },
    {
      headerName: 'Device',
      field: 'device',
      headerClass: 'ag-grid-header-cell',
      minWidth: 50,
      maxWidth: 380,
    },
    {
      headerName: 'Geo',
      field: 'ip',
      headerClass: 'ag-grid-header-cell',
      cellRenderer: 'countryCellRenderer', tooltip: (params) => params.data.countryCode,
      minWidth: 50,
      maxWidth: 380,
    },
    {
      headerName: 'Status',
      field: 'status',
      headerClass: 'ag-grid-header-cell', cellStyle: {textTransform: 'uppercase'},
      cellRenderer: 'conversionStatusCellRenderer',
      minWidth: 50,
      maxWidth: 380,
    },
    {
      headerName: 'Revenue ($)',
      field: 'payoutPub',
      headerClass: 'ag-grid-header-cell',
      cellRenderer: 'customToFixed',
      minWidth: 50,
      maxWidth: 380,
    },
  ],
};
