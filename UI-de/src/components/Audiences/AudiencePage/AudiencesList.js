import React, { useState, useEffect, Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";
import classNames from "classnames";
import { AgGridReact, AgGridColumn } from "ag-grid-react";
import { gridOptions } from "../Utils";
import { AUDIENCE_COLUMN_DEFS } from "../../../utils/agGrid/columnDefs/audience";
import { ACTIVE, PAUSED, REMOVED } from "../../../constants/campaigns";
import { ADMIN , THIRD_PARTY_SEGEMENTS} from "../../../constants/app";
import { changeAudienceStatus } from "../../../actions/audience";
import PendingContainer2 from '../../UI/PendingContainer2'

function AudiencesList(props) {
  const [dummy,setDummy] = useState(0);
  const [gridApi, setGridApi] = useState({});
  const dispatch = useDispatch();
  const options = gridOptions(setGridApi, onSelectionChanged);
  const audiencesList = useSelector((state) => state.audience.audienceList);
  const isRequestPending = useSelector((state) => state.audience.isRequestPending);

  const [showActions, setShowActions] = useState(false);
  const { searchValue, rowData, partnerFilter, thirdPartyData } = props;

  useEffect(() => {
    gridApi.current ? gridApi.current.setQuickFilter(searchValue) : null;
  }, [searchValue]);


  function onSelectionChanged(e) {
    const rowCount = e.api.getSelectedNodes().length;
    setDummy(rowCount);
    setShowActions(rowCount !== 0);
  }

  async function updateAudienceStatus(status) {
    const ids = gridApi.current.getSelectedRows().map((el) => el.id);
    dispatch(changeAudienceStatus({ ids, status }));
    setShowActions(false);
  }

  const disableActionButtons=(status)=>{
    let statusArr = [];
    if(gridApi && gridApi.current){
        gridApi.current.getSelectedRows().forEach(item => {
          if(!statusArr.includes(item.status)){
            statusArr.push(item.status);
          }
        });
        if(statusArr.length > 1) return false;
        if(statusArr.includes(status)) return true;
    }
    return false;
  }
  return (
    <PendingContainer2 isPending={isRequestPending}>
    <div
      className="ag-theme-balham"
      style={{
        boxSizing: "border-box",
        width: "100%",
        borderTop: "1px solid rgba(68, 68, 68, 0.3)",
      }}
    >
      <div className={classNames("actions_cover", { active: showActions })}>
        <button
          disabled={disableActionButtons(ACTIVE)}
          className="actions_cover-item activate"
          onClick={() => updateAudienceStatus(ACTIVE)}
        >
          <span>Activate</span>
        </button>
        <button
          disabled={disableActionButtons(PAUSED)}
          className="actions_cover-item pause"
          onClick={() => updateAudienceStatus(PAUSED)}
        >
          <span>Pause</span>
        </button>
        <button
          className="actions_cover-item remove"
          onClick={() => updateAudienceStatus(REMOVED)}
        >
          <span>Remove</span>
        </button>
      </div>
      <AgGridReact
        columnDefs={AUDIENCE_COLUMN_DEFS[ADMIN]}
        rowData={audiencesList.data}
        gridOptions={options.gridOptions}
        onGridReady={(params) => setGridApi({...gridApi, current:params.api})}
        enableSorting
        enableFilter
        enableColResize
        resizable
        animateRows
        pagination={true}
        rowSelection='multiple'
      ></AgGridReact>
    </div>
    </PendingContainer2>
  );
}

export default AudiencesList;

