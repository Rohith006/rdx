export const DESTINATION_COLUMN_DEFS = [
  {
    headerClass: "ag-grid-header-cell",
    headerCheckboxSelection: true,
    headerCheckboxSelectionFilteredOnly: true,
    checkboxSelection: true,
    minWidth: 95,
    width: 95,
    maxWidth: 95,
  },
  {
    headerName: "Name",
    field: "name",
    headerClass: "ag-grid-header-cell",
    minWidth: 55,
    cellRenderer: "nameRenderer",
    width: 300,
    maxWidth: 300,
    tooltipField: "name",
  },
  {
    headerName: "Category",
    field: "category",
    headerClass: "ag-grid-header-cell",
    minWidth: 150,
    maxWidth: 350,
    tooltipField: "category",
  },
  {
    headerName: "Destination",
    field: "destination",
    headerClass: "ag-grid-header-cell",
    cellRenderer: "destinationRenderer",
    minWidth: 100,
    maxWidth: 350,
  },
  {
    headerName: "Description",
    field: "description",
    headerClass: "ag-grid-header-cell",
    minWidth: 200,
    maxWidth: 350,
    tooltipField: "description",
  },
  {
    headerName: "Label(s)",
    field: "tags",
    headerClass: "ag-grid-header-cell",
    cellRenderer: "tagRenderer",
    minWidth: 150,
    maxWidth: 350,
    tooltipField: "tags",
  },
  {
    headerName: "Condition",
    field: "condition",
    headerClass: "ag-grid-header-cell",
    minWidth: 120,
    maxWidth: 250,
    tooltipField: "condition",
  },
  {
    headerName: "Status",
    field: "enabled",
    cellRenderer: "statusRenderer",
    headerClass: "ag-grid-header-cell",
    minWidth: 80,
  },
  {
    headerName: "Mapping",
    field: "mapping",
    headerClass: "ag-grid-header-cell",
    minWidth: 100,
    maxWidth: 490,
    tooltipField: "mapping",
  },
  {
    headerName: "Action",
    cellRenderer: "renderEditor",
    width: 200,
  },
];