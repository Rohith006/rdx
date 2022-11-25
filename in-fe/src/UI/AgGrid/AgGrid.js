import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { AgGridReact } from "ag-grid-react";
import js_type from "../../assets/images/icons/js_type.svg";
import api_type from "../../assets/images/icons/api_type.svg";
import editAg from "../../assets/images/icons/editAg.svg";
import deleteAg from "../../assets/images/icons/deleteAg.svg";
import { Link } from "react-router-dom";
import FlowNodeIcons from "../../components/flow/FlowNodeIcons";
import moment from "moment";

function AgGrid({ columnDefs, rowData, to, onDelete }) {
  const history = useHistory();

  const routechange = (id) => {
    history.push(`${to}${id}`);
  };

  const statusRenderer = (params) => {
    return (
      <span className={params.data.enabled ? "active_chip" : "inactive_chip"}>
        {params.data.enabled ? "Active" : "Inactive"}
      </span>
    );
  };

  const tagRenderer = (params) => {
    const tags = params.data?.tags;
    const tagLength = tags.length;
    return (
      <>
        {tagLength === 0 ? null : tagLength > 1 ? (
          <span className="chips no-mar">
            {tags[0]} +{tagLength - 1}
          </span>
        ) : (
          <span className="chips no-mar">{tags[0]}</span>
        )}
      </>
    );
  };

  const groupRenderer = (params) => {
    const groups = params.data?.groups;
    const grpLength = groups.length;
    return (
      <>
        {grpLength === 0 ? null : grpLength > 1 ? (
          <span className="chips no-mar">
            {groups[0]} +{grpLength - 1}
          </span>
        ) : (
          <span className="chips no-mar">{groups[0]}</span>
        )}
      </>
    );
  };

  const typeRenderer = (params) => {
    return (
      <div>
        {params.data.type.toLowerCase() === "javascript" ? (
          <div className="flex items-center">
            <img className="mr-1" src={js_type} alt="js" />
            <span>Javascript</span>
          </div>
        ) : params.data.type.toLowerCase() === "api-call" ? (
          <div className="flex items-center">
            <img className="mr-1" src={api_type} alt="js" />
            <span>Api call</span>
          </div>
        ) : (
          <div className="flex items-center">
            <span className="mr-1">
              <FlowNodeIcons icon={params.data?.icon} size={20} />
            </span>
            <span>{params.data?.type}</span>
          </div>
        )}
      </div>
    );
  };
  const nameRenderer = (params) => {
    return (
      <Link to={to + params.data.id} className="name_render">
        {params.data.name}
      </Link>
    );
  };

  const timeRenderer = (params) => {
    return (
      <span>
        {moment(params.data?.timestamp).format("dddd, MMMM ,YYYY, h:mm:ss a")}
      </span>
    );
  };

  const renderEditor = (params) => {
    return (
      <div className="flex items-center">
        <div
          onClick={() => routechange(params.data?.id)}
          className="cursor-pointer mr-6 flex flex-col items-center"
        >
          <img className="editor_img" src={editAg} alt="edit" />
          <span className="editor_text">Edit</span>
        </div>
        <div
          onClick={() => onDelete(params.data)}
          className="cursor-pointer flex flex-col items-center"
        >
          <img className="editor_img" src={deleteAg} alt="delete" />
          <span className="editor_text">Delete</span>
        </div>
      </div>
    );
  };

  const [gridOptions] = useState({
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
    frameworkComponents: {
      statusRenderer,
      typeRenderer,
      nameRenderer,
      tagRenderer,
      groupRenderer,
      renderEditor,
      timeRenderer,
    },
    // onSelectionChanged: this.onSelectionChanged.bind(this),
    onFirstDataRendered: (params) => {
      params.api.sizeColumnsToFit();
    },
    suppressDragLeaveHidesColumns: true,
  });
  return (
    <div className="ag-theme-balham">
      <AgGridReact
        columnDefs={columnDefs}
        rowData={rowData}
        gridOptions={gridOptions}
        enableSorting
        enableFilter
        enableColResize
        resizable
        animateRows
        pagination={true}
        // paginationNumberFormatter={this.state.paginationNumberFormatter}
      ></AgGridReact>
    </div>
  );
}

export default AgGrid;
