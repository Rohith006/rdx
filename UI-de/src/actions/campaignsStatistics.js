import axios from 'axios';
import querystring from 'querystring';
import {NotificationManager} from 'react-notifications';

import * as campaignsStatisticsConstants from '../constants/campaignsStatistics';
import localization from '../localization';
import {LOAD_CAMPAIGNS_DROPDOWN_LIST} from '../constants/campaigns';

export const loadCampaignsStatistics = (options) => async (dispatch) => {
  dispatch({type: campaignsStatisticsConstants.CAMPAIGNS_STATISTICS_REQUEST_PENDING});

  !options.offset && (options.offset = 0);

  try {
    const {data} = await axios.get(`/campaigns/campaigns-statistics?${querystring.stringify(options)}`);

    dispatch({
      type: campaignsStatisticsConstants.LOAD_CAMPAIGNS_STATISTICS,
      data,
    });
  } catch (e) {
    NotificationManager.error(localization.serverError.campaigns.loadCampaignsFailed);
  } finally {
    dispatch({
      type: campaignsStatisticsConstants.CAMPAIGNS_STATISTICS_REQUEST_FULFILLED,
    });
  }
};

export const loadCampaignDropdownList = () => async (dispatch) => {
  try {
    const {data} = await axios.get(`/campaigns/campaign-list-dropdown`);

    dispatch({
      type: LOAD_CAMPAIGNS_DROPDOWN_LIST,
      payload: data.data,
    });
  } catch (e) {
    NotificationManager.error(localization.serverError.campaigns.loadCampaignsFailed);
  }
};
