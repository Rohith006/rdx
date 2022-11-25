import * as topCampaignsConstants from '../constants/topCampaigns';
import * as authConstants from '../constants/auth';

const initialState = {
  isRequestPending: false,
  topCampaignsList: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case topCampaignsConstants.TOP_CAMPAIGNS_REQUEST_PENDING:
      return {
        ...state,
        isRequestPending: true,
      };
    case topCampaignsConstants.TOP_CAMPAIGNS_REQUEST_FULFILLED:
      return {
        ...state,
        isRequestPending: false,
      };
    case topCampaignsConstants.LOAD_TOP_CAMPAIGNS:
      return {
        ...state,
        topCampaignsList: action.data.topCampaignsList,
      };
    case authConstants.RESET_REDUX_STATE:
      return initialState;
    default:
      return state;
  }
};
