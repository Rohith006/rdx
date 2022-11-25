import React from 'react';
import { AgGridReact } from 'ag-grid-react';
import classNames from 'classnames';
import localization from '../../../localization';
import { ADVERTISER } from '../../../constants/user';
import download from '../../../../assets/images/icons/download-button.svg';

export default function BlackList(props) {
  const { list, columnDefs, listGridApi } = props;

  function onFilterListChange(e) {
    listGridApi.setQuickFilter(e.target.value);
  }

  async function deleteListItem() {
    const isRemoveAll = listGridApi.getSelectedRows().length === listGridApi.getDisplayedRowCount();
    const rows = listGridApi.getSelectedRows().map((item) => {
      return {
        id: item.id,
        publisherId: item.publisherId,
        demand: item.campaignId,
        value: item.value,
      };
    });
    const data = { rows, isRemoveAll };
    await props.deleteSubIdListItem(data);
  }

  return (
    <div>
        <div className="form-group_field">
          <div className='card_body settingsDivFlex filter'>
            <div className="input mb2 settingsFilter">
              <input
                type="text"
                placeholder={localization.forms.filter}
                onChange={onFilterListChange}
              />
            </div>
            <img src={download} className="line_download-list" onClick={props.exportDataAsCsv} />
          </div>
        </div>
      <hr className="settingsLine" />
        <div className="form-group_field card_body">
          <div
            className="ag-theme-balham settings"
            style={{
              maxHeight: '300px',
              width: '100%',
              overflowY: 'auto',
            }}
          >
            <div className={classNames('actions_cover', { 'active': props.showActionsList })}>
              <div className="actions_cover-item remove" onClick={() => deleteListItem()}>
                <span>Remove</span>
              </div>
            </div>
            <AgGridReact
              columnDefs={columnDefs}
              rowData={list ? list : []}
              gridOptions={props.listGridOptions}
              enableSorting
              enableFilter
              enableColResize
              pagination
              resizable
              animateRows
              isRowSelectable={props.auth.currentUser.role === ADVERTISER ? props.isRowSelectable : null}
            >
            </AgGridReact>
          </div>
        </div>
    </div>
  );
}
