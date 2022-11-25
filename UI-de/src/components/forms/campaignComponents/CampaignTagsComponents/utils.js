export const gridOptions = (setGridApi, onSelectionChanged) => ({
    showActions: false,
    pageCount: 1,
    gridOptions: {
      rowHeight: 52,
      paginationPageSize: 8,
      suppressRowClickSelection: false,
      domLayout: 'autoHeight',
      rowSelection: 'multiple',
      paginationNumberFormatter: (params) => params.value.toLocaleString(),
      onGridSizeChanged: (params) => {
        params.api.sizeColumnsToFit();
      },
    },
  });
  
  