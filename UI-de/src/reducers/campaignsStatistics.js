import * as campaignsStatisticsConstants from '../constants/campaignsStatistics';
import * as authConstants from '../constants/auth';
import {CREATE_CAMPAIGN, DELETE_CAMPAIGN, UPDATE_CAMPAIGN_STATUS} from '../constants/campaigns';

const initialState = {
  isRequestPending: false,
  campaignsStatisticsList: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case campaignsStatisticsConstants.CAMPAIGNS_STATISTICS_REQUEST_PENDING:
      return {
        ...state,
        isRequestPending: true,
      };
    case campaignsStatisticsConstants.CAMPAIGNS_STATISTICS_REQUEST_FULFILLED:
      return {
        ...state,
        isRequestPending: false,
      };
    case campaignsStatisticsConstants.LOAD_CAMPAIGNS_STATISTICS:
      const list = action.data.campaignsStatisticsList.map((item) => {
        if (item.clicksCount && item.impressionsCount) {
          item.ctr = (item.clicksCount / item.impressionsCount) * 100;
        } else {
          item.ctr = 0;
        }
        return item;
      });
      return {
        ...state,
        campaignsStatisticsList: list,
      };
    case campaignsStatisticsConstants.UPDATE_CAMPAIGN_STATISTIC:
      return {
        ...state,
        campaignsStatisticsList: state.campaignsStatisticsList.map((item) => item.campaign.id === action.data.campaign.id ? {...item, campaign: _.merge(item.campaign, action.data.campaign)} : item),
      };
    case UPDATE_CAMPAIGN_STATUS: {
      const cloneList = _.cloneDeep(state.campaignsStatisticsList);
      let newList = [];
      action.data.ids.forEach((id) => {
        newList = cloneList.map((item) => item.campaign.id === id ? {
          ...item,
          campaign: _.merge(item.campaign, action.data),
        } : item);
      });
      return {
        ...state,
        campaignsStatisticsList: newList,
      };
    }
    case CREATE_CAMPAIGN: {
      const cloneList = _.cloneDeep(state.campaignsStatisticsList);
      const newList = [{
        campaign: action.data.campaign,
        clicksCount: 0,
        conversionsCount: 0,
        cr: 0,
        ownerSpent: 0,
        relatedPublishersCount: 0,
        spentAdvertiser: 0,
      }, ...cloneList];
      return {
        ...state,
        campaignsStatisticsList: newList,
      };
    }
    case DELETE_CAMPAIGN:
      return {
        ...state,
        campaignsStatisticsList: state.campaignsStatisticsList.filter((item) => item.campaign.id !== action.data.ids[0]),
      };

    case authConstants.RESET_REDUX_STATE:
      return initialState;
    default:
      return state;
  }
};
