export const AUDIENCE_COLUMN_DEFS = {
  ADMIN: [
    {
      headerClass: 'ag-grid-header-cell',
      headerCheckboxSelection: true,
      headerCheckboxSelectionFilteredOnly: true,
      checkboxSelection: true,
      minWidth: 63,
      width: 63,
      maxWidth: 80,
    },
    {
      headerName: 'Id',
      field: 'id',
      headerClass: 'ag-grid-header-cell',
      minWidth: 40,
      width: 80,
    },
    {
      headerName: 'Name',
      field: 'name',
      headerClass: 'ag-grid-header-cell',
      cellRenderer: 'audienceNameRenderer',
      minWidth: 90,
      maxWidth: 350,
    },
    {
      headerName: 'Advertiser',
      field: 'advertiser.name',
      headerClass: 'ag-grid-header-cell',
      minWidth: 90,
      maxWidth: 350,
    },
    {
      headerName: 'People with',
      field: 'peopleWith',
      headerClass: 'ag-grid-header-cell',
      cellRenderer: 'peopleWithRenderer',
    },
    {
      headerName: 'Status',
      field: 'status',
      headerClass: 'ag-grid-header-cell',
      cellRenderer: 'campaignStatusRenderer',
      maxWidth: 100,
    },
    {
      headerName: 'Campaigns',
      field: 'collectFromIds',
      headerClass: 'ag-grid-header-cell',
      cellRenderer: 'campaignNumberRenderer',
      minWidth:120,
      maxWidth: 120,
    },
    {
      headerName: 'Date',
      field: 'createdAt',
      headerClass: 'ag-grid-header-cell',
      cellRenderer: 'dateCellRenderer',
      tooltipField: 'createdAt',
      maxWidth: 250,
    },
  ],
  ADVERTISER: [
    {
      headerClass: 'ag-grid-header-cell',
      headerCheckboxSelection: true,
      headerCheckboxSelectionFilteredOnly: true,
      checkboxSelection: true,
    },
    {
      headerName: 'Id',
      field: 'id',
      headerClass: 'ag-grid-header-cell',
    },
    {
      headerName: 'Name',
      field: 'name',
      headerClass: 'ag-grid-header-cell',
      cellRenderer: 'audienceNameRenderer',
      minWidth: 90,
      maxWidth: 350,
    },
    {
      headerName: 'People with',
      field: 'peopleWith',
      headerClass: 'ag-grid-header-cell',
      cellRenderer: 'peopleWithRenderer',
    },
    {
      headerName: 'Status',
      field: 'status',
      headerClass: 'ag-grid-header-cell',
      cellRenderer: 'campaignStatusRenderer',
      maxWidth: 100,
    },
    {
      headerName: 'Campaigns',
      field: 'collectFromIds',
      headerClass: 'ag-grid-header-cell',
      cellRenderer: 'campaignNumberRenderer',
      maxWidth: 100,
    },
    {
      headerName: 'Date',
      field: 'createdAt',
      headerClass: 'ag-grid-header-cell',
      cellRenderer: 'dateCellRenderer',
      tooltipField: 'createdAt',
      maxWidth: 250,
    },
  ],
};