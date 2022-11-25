import {
  SET_COMMON_STATISTIC,
  SET_TRAFFIC_STATISTIC,
} from "../constants/reports";

const initialState = {
  isRequestPending: false,
  commonStatistic: {
    activePublishers: 0,
    pendingPublisher: 0,
    activeCampaigns: 0,
  },
  trafficStatistic: [],
};
export default (state = initialState, action) => {
  switch (action.type) {
    case SET_COMMON_STATISTIC:
      return {
        ...state,
        commonStatistic: action.data.statistics,
      };
    case SET_TRAFFIC_STATISTIC:
      return {
        ...state,
        trafficStatistic: action.data,
      };
    default:
      return state;
  }
};
