import axios from 'axios';
import * as topCampaignsConstants from '../constants/topCampaigns';

export const loadTopCampaigns = () => async (dispatch) => {
  try {
    dispatch({
      type: topCampaignsConstants.TOP_CAMPAIGNS_REQUEST_PENDING,
    });

    const {data} = await axios.get('/database/load/top-campaigns');

    dispatch({
      type: topCampaignsConstants.LOAD_TOP_CAMPAIGNS,
      data,
    });
    dispatch({
      type: topCampaignsConstants.TOP_CAMPAIGNS_REQUEST_FULFILLED,
    });
  } catch (e) {
    dispatch({
      type: topCampaignsConstants.TOP_CAMPAIGNS_REQUEST_FULFILLED,
    });
    console.error(e);
  }
};
