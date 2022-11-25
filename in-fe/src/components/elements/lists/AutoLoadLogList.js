import React, { useState, useEffect, useCallback, useRef } from "react";
import { request } from "../../../remote_api/uql_api_endpoint";
import ErrorsBox from "../../errors/ErrorsBox";
import CenteredCircularProgress from "../progress/CenteredCircularProgress";
import InfiniteScroll from "react-infinite-scroll-component";
import CircularProgress from "@mui/material/CircularProgress";
import "./AutoLoadLogList.css";
import { AgGridReact } from "ag-grid-react";

import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-balham.css";

const AutoLoadLogList = ({
  label,
  onLoadRequest,
  renderRowFunc,
  requestParams = {},
}) => {
  const [page, setPage] = useState(0);
  const [hasMore, setHasMode] = useState(false);
  const [total, setTotal] = useState(0);
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(false);
  const [lastQuery, setLastQuery] = useState("");
  const [columnDefs, setColumnDefs] = useState([
    { headerName: "Email", field: "email" },
    { headerName: "Status", field: "successful" },
    { headerName: "Timestamp", field: "timestamp" },
  ]);

  const [gridApi] = useState({
    rowHeight: 52,
    paginationNumberFormatter: function (params) {
      return params.value.toLocaleString();
    },
    resizable: true,
    rowData: null,
    suppressRowClickSelection: false,
    domLayout: "autoHeight",
    onGridReady: (params) => {
      this.gridApi = params.api;
    },
    rowSelection: "multiple",
  });

  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  const loadData = useCallback(
    (fresh = false) => {
      let endpoint;

      if (onLoadRequest?.data?.where !== lastQuery) {
        // query changed, start search form beginning
        endpoint = {
          ...onLoadRequest,
          url:
            `${onLoadRequest.url}/page/0?` +
            Object.keys(requestParams)
              .map((key) => `${key}=${requestParams[key]}`)
              .join("&"),
        };
        setLastQuery(endpoint?.data?.where);
        setPage(0);
      } else {
        endpoint = {
          ...onLoadRequest,
          url:
            `${onLoadRequest.url}/page/${page}?` +
            Object.keys(requestParams)
              .map((key) => `${key}=${requestParams[key]}`)
              .join("&"),
        };
      }

      request(
        endpoint,
        () => {},
        (e) => {
          if (mounted.current === true) {
            setError(e);
          }
        },
        (response) => {
          if (response) {
            if (mounted.current === true) {
              setHasMode(response.data.result.length !== 0);
              setTotal(response.data.total);
              setRows(
                page === 0 || fresh === true
                  ? [...response.data.result]
                  : [...rows, ...response.data.result]
              );
            }
          }
        }
      );
    },
    [page, onLoadRequest]
  );

  useEffect(() => {
    loadData(false);
  }, [loadData]);

  const renderHeader = () => {
    if (Array.isArray(rows)) {
      const header = `Showing ${rows.length} ${label} of ${total} total records`;

      return <div className="Header">{header}</div>;
    }
  };

  const renderRows = (rows) => {
    if (Array.isArray(rows)) {
      return rows.map(renderRowFunc);
    }
  };

  if (rows === null) {
    return <CenteredCircularProgress />;
  }

  if (error) {
    return <ErrorsBox errorList={error} />;
  }

  return (
    <div className="ObjectList">
      {renderHeader()}
      {/* <div className="ag-theme-balham">
        <AgGridReact
          enableSorting
          enableFilter
          enableColResize
          gridOptions={gridApi}
          resizable
          animateRows
          pagination={true}
          columnDefs={columnDefs}
          rowData={rows}
        ></AgGridReact>
      </div> */}

      <InfiniteScroll
        dataLength={rows.length}
        next={() => {
          setPage(page + 1);
        }}
        inverse={false}
        hasMore={hasMore}
        style={{ overflow: "hidden" }}
        loader={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 4,
            }}
          >
            <CircularProgress size={20} />
          </div>
        }
        scrollableTarget="MainWindowScroll"
      >
        <table className="LogListTable">
          <tbody>{renderRows(rows)}</tbody>
        </table>
      </InfiniteScroll>
    </div>
  );
};

export default AutoLoadLogList;
