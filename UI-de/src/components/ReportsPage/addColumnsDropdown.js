import React, {useState, useEffect} from 'react';
import localization from '../../localization';
import classNames from 'classnames';
import ReportsModalForm from '../forms/reportsForms/ReportsModalForm';
import ModalData from './modalData';
import {DAILY} from '../../constants/reports';
import getReports2ColumnDefs from '../../utils/agGrid/columnDefs/reports2';

const AddColumnDropdown = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [columns, setColumns] = useState([]);

  function submitColumns(data) {
    const {settings} = props.reports;
    const newSetting = {...settings};
    const keys = [];
    for (const item in data) {
      if (data[item]) {
        keys.push(item);
      }
    }
    ModalData.setState = keys;
    newSetting.keys = keys;
    props.actions.loadReports(newSetting, newSetting.tableType, props.limit, props.offset, props.switcherStatus);
    let columnDefs = getReports2ColumnDefs(props, props);
    columnDefs = _.cloneDeep(columnDefs);
    const checkColumns = _.cloneDeep(columnDefs.map((el) => Object.values(el)).flat(2));
    let columns = ModalData.get.filter((el) => keys.includes(el.name));

    // Filter columns ag-grid
    keys.forEach((el) => {
      if (checkColumns.includes(el)) {
        columns = columns.map((col) => {
          if (col.name !== el) return col;
        });
        columns = columns.filter((el) => el);
      }
    });

    // Add columns to ag-grid
    columns.forEach((fieldConfig) => {
      if (keys.includes(fieldConfig.name)) {
        const field = {
          headerName: fieldConfig.title,
          field: fieldConfig.name,
          headerClass: 'ag-grid-header-cell',
          minWidth: 50,
          maxWidth: 380,
          cellRenderer: fieldConfig.cellRenderer,
        };
        columnDefs = columnDefs.map((el, ind) => ind === fieldConfig.after ? [el, field] : el).flat();
      }
      if ([DAILY].includes(props.tableType) && keys.includes('publisher')) {
        const fieldRemoteImpressions = {
          headerName: 'API', children: [
            {
              headerName: 'SSP',
              field: 'remoteImpressionsSsp',
              headerClass: 'ag-grid-header-cell',
              minWidth: 50,
              maxWidth: 380,
            },
            {
              headerName: '%',
              field: 'percentRemoteImpressionsSsp',
              headerClass: 'ag-grid-header-cell',
              minWidth: 50,
              maxWidth: 380,
            },
          ],
        };
        const columnImpressions = columnDefs.find((item) => item.headerName === 'Impressions Image');
        columnImpressions.children = columnImpressions.children.map((el, ind) => ind === 2 ? [el, fieldRemoteImpressions] : el).flat();

        const fieldRemoteRevenue = {
          headerName: 'Payout ($)', children: [
            {
              headerName: 'Total',
              field: 'payout',
              headerClass: 'ag-grid-header-cell',
              minWidth: 50,
              maxWidth: 380,
            },
            {
              headerName: 'SSP',
              field: 'remoteRevenueSsp',
              headerClass: 'ag-grid-header-cell',
              minWidth: 50,
              maxWidth: 380,
            },
            {
              headerName: '%',
              field: 'percentRemoteRevenueSsp',
              headerClass: 'ag-grid-header-cell',
              minWidth: 50,
              maxWidth: 380,
            },
          ],
        };
        const columnRevenueIndex = columnDefs.findIndex((item) => item.headerName === 'Payout ($)');
        columnDefs[columnRevenueIndex] = fieldRemoteRevenue;
      }
      if ([DAILY].includes(props.tableType)) {
        const fieldRemoteImpressions = {
          headerName: 'API', children: [
            {
              headerName: 'DSP',
              field: 'remoteImpressionsDsp',
              headerClass: 'ag-grid-header-cell',
              minWidth: 50,
              maxWidth: 380,
            },
            {
              headerName: '%',
              field: 'percentRemoteImpressionsDsp',
              headerClass: 'ag-grid-header-cell',
              minWidth: 50,
              maxWidth: 380,
            },
          ],
        };
        const columnImpressions = columnDefs.find((item) => item.headerName === 'Impressions Image');
        columnImpressions.children = columnImpressions.children.map((el, ind) => ind === 2 ? [el, fieldRemoteImpressions] : el).flat();

        const fieldRemoteRevenue = {
          headerName: 'Revenue ($)', children: [
            {
              headerName: 'Total',
              field: 'revenue',
              headerClass: 'ag-grid-header-cell',
              minWidth: 50,
              maxWidth: 380,
            },
            {
              headerName: 'DSP',
              field: 'remoteRevenueDsp',
              headerClass: 'ag-grid-header-cell',
              minWidth: 50,
              maxWidth: 380,
            },
            {
              headerName: '%',
              field: 'percentRemoteRevenueDsp',
              headerClass: 'ag-grid-header-cell',
              minWidth: 50,
              maxWidth: 380,
            },
          ],
        };
        const columnRevenueIndex = columnDefs.findIndex((item) => item.headerName === 'Revenue ($)');
        columnDefs[columnRevenueIndex] = fieldRemoteRevenue;
      }
    });

    // Remove columns from ag-grid
    ModalData.get.forEach((el) => {
      if (!keys.includes(el.name)) {
        columnDefs = columnDefs.filter((col) => col.field !== el.name);
      }
    });

    props.gridApi.setColumnDefs([]);
    props.gridApi.setColumnDefs(columnDefs);
    setIsOpen(false);
  }

  useEffect(() => {
    let additionalColumns = ModalData.get;

    const {role, permissions} = props.auth.currentUser;
    if (role === 'ACCOUNT_MANAGER') {
      additionalColumns = additionalColumns.filter((col) => {
        if (col.check !== role) return false;
        if (col.check === role && col.name === 'publisher' && !permissions.includes('PUBLISHERS')) return false;
        return true;
      });
    }
    setColumns(additionalColumns);
    setIsOpen(false);
  }, [props.tableType]);

  useEffect(() => {
    document.body.addEventListener('click', (e) => {
      if (e.target.classList.contains('val') || e.target.classList.contains('reports-modal-form')) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    });
  }, []);

  return (
    <div>
      {columns.length ? (
          <div className={`dropdown-cover`}>
            <span className='title'>{localization.reports.addCol}</span>
            <div className={classNames('dropdown columns bordered', {'opened': isOpen})}>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="dropdown__button"
                tabIndex="0" type="button">
                <span className="dropdown__button-value">
                  <span>{isOpen}</span>
                </span>
                <span className="dropdown__arrow"/>
              </button>
              <div className="dropdown__menu">
                <div className="dropdown__menu-scroll">
                  <ReportsModalForm
                    onSubmit={(e) => submitColumns(e)}
                    modalGroupBy={props.modalGroupBy}
                    tableType={props.tableType}
                    columns={columns}
                  />
                </div>
              </div>
            </div>
          </div>
      ) : null}
    </div>
  );
};

export default AddColumnDropdown;
