import axios from 'axios';
import querystring from 'querystring';
import * as reportsConstants from '../constants/reports';
import {
  ADVERTISERS, APPS,
  CAMPAIGNS,
  CLICKS, COUNTRY,
  DAILY,
  ERRORS,
  HOURLY,
  IMPRESSIONS, PUBLISHER_ERRORS,
  PUBLISHERS, SITES, SUB_ID, OS, CREATIVES,
  PUBLISHER_ERRORS_XML, PUB_NO_MATCH_CAMPAIGN, SIZES,
} from '../constants/reports';
import {showSuccessNotification} from '../utils/common';

export const loadReports = (dataform, type, limit, offset, switcherStatus, version) => async (dispatch) => {
  const {
    keys,
    selectedAdvertiser,
    selectedPublisher,
    selectedCampaign,
    selectedAdType,
    selectedInventoryType,
    selectedProtocolType,
    selectedBidType,
  } = dataform;

  try {
    dispatch({
      type: reportsConstants.REPORTS_REQUEST_PENDING,
    });
    dataform.limit = limit || 10;
    dataform.offset = offset || 0;
    dataform.switcherStatus = switcherStatus.toUpperCase();
    dataform.reportsType = type;
    if (keys && keys.length) {
      dataform.keys = JSON.stringify(keys);
    }
    if (selectedAdvertiser && selectedAdvertiser.length) {
      dataform.selectedAdvertiser = JSON.stringify(selectedAdvertiser.map((el) => el.value));
    }
    if (selectedPublisher && selectedPublisher.length) {
      dataform.selectedPublisher = JSON.stringify(selectedPublisher.map((el) => el.value));
    }
    if (selectedCampaign && selectedCampaign.length) {
      dataform.selectedCampaign = JSON.stringify(selectedCampaign.map((el) => el.value));
    }
    if (selectedAdType && selectedAdType.length) {
      dataform.selectedAdType = JSON.stringify(selectedAdType.map((el) => el.value.toUpperCase()));
    }
    if (selectedInventoryType && selectedInventoryType.length) {
      const filtered = selectedInventoryType.filter((el) => el.value !== 'ALL').map((el) => el.value.toUpperCase());
      dataform.selectedInventoryType = filtered.length ? JSON.stringify(filtered) : null;
    }
    if (selectedProtocolType && selectedProtocolType.length) {
      dataform.selectedProtocolType = JSON.stringify(selectedProtocolType.map((el) => el.value.toUpperCase()));
    }
    if (selectedBidType && selectedBidType.length) {
      dataform.selectedBidType = JSON.stringify(selectedBidType.map((el) => el.value.toUpperCase()));
    }
    const params = querystring.stringify(dataform);
    let url = `/reports`;
    const route = version === 'V1' ? '/reports' : '/v2/reports';

    switch (type) {
      case DAILY: {
        url = `${route}/daily?${params}`;
        break;
      }
      case HOURLY: {
        dataform.date = dataform.startDate;
        url = `${route}/hourly?${querystring.stringify(dataform)}`;
        break;
      }
      case IMPRESSIONS: {
        url = `${route}/impressions?${params}`;
        break;
      }
      case CLICKS: {
        url = `${route}/clicks?${params}`;
        break;
      }
      case ADVERTISERS: {
        url = `${route}/advertisers?${params}`;
        break;
      }
      case PUBLISHERS: {
        url = `${route}/publishers?${params}`;
        break;
      }
      case CAMPAIGNS: {
        url = `${route}/campaigns?${params}`;
        break;
      }
      case PUBLISHER_ERRORS: {
        url = `${route}/publisher-errors?${params}`;
        break;
      }
      case PUBLISHER_ERRORS_XML: {
        url = `${route}/publisher-errors-xml?${params}`;
        break;
      }
      case PUB_NO_MATCH_CAMPAIGN: {
        url = `${route}/no-match-campaign?${params}`;
        break;
      }
      case SUB_ID: {
        url = `${route}/sub-id?${params}`;
        break;
      }
      case APPS: {
        url = `${route}/apps?${params}`;
        break;
      }
      case SITES: {
        url = `${route}/sites?${params}`;
        break;
      }
      case OS: {
        url = `${route}/os?${params}`;
        break;
      }
      case COUNTRY: {
        url = `${route}/country?${params}`;
        break;
      }
      case CREATIVES: {
        url = `${route}/creatives?${params}`;
        break;
      }
      case SIZES: {
        url = `${route}/sizes?${params}`;
        break;
      }
    }

    const data = await axios.get(url);

    dispatch({
      type: reportsConstants.LOAD_REPORTS,
      data: {reportsList: data.data.data},
    });

    dispatch({
      type: reportsConstants.REPORTS_COUNT_PAGINATION,
      data: {count: data.data.count ? data.data.count : 1},
    });

    dispatch({
      type: reportsConstants.REPORTS_REQUEST_FULFILLED,
    });
  } catch (e) {
    dispatch({
      type: reportsConstants.REPORTS_REQUEST_FULFILLED,
    });
    console.log(e);
  }
};

export const reportsSettings = (data) => (dispatch) => {
  if (data) {
    dispatch({
      type: reportsConstants.SET_SETTINGS, payload: data,
    });
  }

  return data;
};

export const filterReportCampaigns = (data) => (dispatch) => {
  dispatch({
    type: reportsConstants.GET_FILTERED_CAMPAIGNS, payload: data,
  });
};

export const dropDownData = (data) => (dispatch) => {
  dispatch({
    type: 'DROPDOWN', payload: data.payload,
  });
};


export const resetReportsState = () => (dispatch) => {
  dispatch({
    type: reportsConstants.RESET_REPORTS_STATE,
  });
};
