import React from "react";
import moment from "moment";
import { AgGridReact } from "ag-grid-react";

import localization from "../../localization";
import PendingContainer from "../UI/PendingContainer2";

const dataCellFormatter = ({ value }) => value || "-";

const dateCellFormatter = ({ value }) =>
  moment(value).format(`YYYY-MM-DD HH:mm:ss`);

export const UserActivityTable = ({
  userActivity,
  showLogDetails,
  isRequestPending,
}) => {
  const gridOptions = {
    pagination: true,
    rowHeight: 52,
    paginationPageSize: 10,
    paginationNumberFormatter: function (params) {
      return params.value.toLocaleString();
    },
    suppressRowClickSelection: false,
    domLayout: "autoHeight",
    onCellClicked: (params) => {
      if (params.colDef.field === "details") {
        showLogDetails(params.data.details,params.data.eventType);
      }
    },
    frameworkComponents: {
      detailsRenderer: (params) => {
        if (params.data.details.length !== 4) {
          return <span className="adv-pub-name">View details</span>
        }
        else {
          return <span>-</span>
        }
      }
    },
  };
  return (
    <PendingContainer isPending={isRequestPending}>
      <div
        className="ag-theme-balham logs"
        style={{
          boxSizing: "border-box",
          width: "100%",
          borderTop: "1px solid rgba(68, 68, 68, 0.3)",
        }}
      >
        <AgGridReact
          columnDefs={columnDefs}
          gridOptions={gridOptions}
          rowData={userActivity}
          enableColResize={true}
          resizable={true}
        />
        {/* <ShowLinesDropdown gridApi={gridApi}/>*/}
      </div>
    </PendingContainer>
  );
};

const columnDefs = [
  {
    headerName: localization.logs.table.user,
    field: "userName",
    headerClass: "ag-grid-header-cell",
    width: 160,
    maxWidth: 500,
  },
  {
    headerName: localization.logs.table.type,
    field: "eventType",
    headerClass: "ag-grid-header-cell",
    width: 185,
    maxWidth: 200,
  },
  {
    headerName: localization.logs.table.changedObject,
    valueFormatter: dataCellFormatter,
    field: "changedObject",
    headerClass: "ag-grid-header-cell",
    maxWidth: 500,
  },
  {
    headerName: localization.logs.table.details,
    valueFormatter: dataCellFormatter,
    field: "details",
    headerClass: "ag-grid-header-cell",
    cellRenderer: "detailsRenderer",
    width: 120,
    // maxWidth: 400,
  },
  {
    headerName: localization.logs.table.note,
    field: "note",
    headerClass: "ag-grid-header-cell",
    width: 420,
    maxWidth: 900,
    tooltipField: "note",
  },
  {
    headerName: localization.logs.table.date,
    valueFormatter: dateCellFormatter,
    field: "createdAt",
    headerClass: "ag-grid-header-cell",
    maxWidth: 550,
  },
];
