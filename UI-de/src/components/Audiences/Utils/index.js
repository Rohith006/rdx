import React from 'react';
import moment from 'moment';
import {formValueSelector} from 'redux-form';
import {Link} from 'react-router-dom';
import customNumberFormat from '../../../utils/agGrid/renderers/customNumberFormat';
import statusRenderer from '../../../utils/agGrid/renderers/statusRenderer';
import {REMOVED} from '../../../constants/user';
import {ACTIVE, NEW, PAUSED} from '../../../constants/campaigns';

export function getValueSelector(state) {
  const valueSelector = formValueSelector('AudienceForm');

  // const audience = state.audience.currentAudience.audience;

  // if (!audience || !Object.values(audience).length) {
  //   return null;
  // }
  const user = state.auth.currentUser;
  return {
    id: valueSelector(state, 'id'),
    name: valueSelector(state, 'name'),
    advertiserId: valueSelector(state, 'advertiserId') || user.id,
    collectFromIds: valueSelector(state, 'collectFromIds'),
    peopleWith: valueSelector(state, 'peopleWith'),
    status: valueSelector(state, 'status'),
    ifas: [],
  };
}

export const takeCampaignsDropdowns = (state) => {
  return state.campaigns.campaignsList ?
      state.campaigns.campaignsList.filter((campaign) => campaign.status !== NEW && campaign.status !== REMOVED ).map(({campaignName, id}) => ({label: `(${id}) ${campaignName}`, value: id})) :
  [];
};

export const takeAdvertisersDropdowns = (state) => {
  if (state.auth.currentUser.role === 'ADVERTISER') {
    return null;
  }

  const options = state.users.advertisers.map((item) => {
    return {label: `(${item.id}) ${item.name}`, value: item.id};
  });

  return options.length ? [{label: '-', value: null}, ...options] : null;
};

export const peopleWithItems = [
  {name: 'Impressions', value: 'IMPRESSIONS', active: true},
  {name: 'Clicks', value: 'CLICKS', active: true},
  // {name: 'conversions', value: 'CONVERSIONS', active: true},
  // {name: 'installs', value: 'INSTALLS', active: true},
];

export const selectConfig = {
  status: [
    {value: null, label: '-'},
    {value: NEW, label: 'New'},
    {value: ACTIVE, label: 'Active'},
    {value: PAUSED, label: 'Paused'},
    {value: REMOVED, label: 'Removed'},
  ],
};

export const gridOptions = (setGridApi, onSelectionChanged) => ({
  showActions: false,
  pageCount: 1,
  gridOptions: {
    rowHeight: 52,
    paginationPageSize: 100,
    suppressRowClickSelection: false,
    domLayout: 'autoHeight',
    rowSelection: 'multiple',
    paginationNumberFormatter: (params) => params.value.toLocaleString(),
    onGridSizeChanged: (params) => {
      params.api.sizeColumnsToFit();
    },
    frameworkComponents: {
      statusRenderer: statusRenderer,
      dateCellRenderer: (params) => (
        <span>{moment(params.value).local().format('MM-DD-YYYY')}</span>
      ),
      campaignStatusRenderer: (params) => (
        <span className={`status ${params.value ? params.value.toLowerCase() : ''}`}>
          {params.value ? params.value.toLowerCase() : ''}
        </span>
      ),
      peopleWithRenderer: (params) => (
        params.value.map((item, index) => (
          <span key={index} className={`status active ${index > 0 ? 'ml2' : ''}`}>{item}</span>),
        )),
      customNumberFormat,
      campaignNumberRenderer: (params) => params.node.data.collectFromIds.length,
      audienceNameRenderer: (params) => <Link to={`/audiences/${params.node.data.id}/edit`}>{params.node.data.name}</Link>,
    },
    onSelectionChanged,
    onGridReady: (params) => setGridApi(params.api),
    suppressDragLeaveHidesColumns: true,
    overlayLoadingTemplate:" ",
  },
});

export const initialValues = {
  collectFromIds: [],
};

export const validate = ({startDate, endDate}) => {
  const errors = {};

  if (!startDate) {
    errors.startDate = 'Required';
  } else if (startDate && (endDate && +startDate > +endDate)) {
    errors.startDate = 'Invalid date';
  }
  if (!endDate) {
    errors.endDate = 'Required';
  }

  return errors;
};
