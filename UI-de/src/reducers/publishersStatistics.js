import * as publishersStatisticsConstants from '../constants/publishersStatistics';
import * as authConstants from '../constants/auth';

const initialState = {
  isRequestPending: false,
  publishersStatisticsList: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case publishersStatisticsConstants.PUBLISHERS_STATISTICS_REQUEST_PENDING:
      return {
        ...state,
        isRequestPending: true,
      };
    case publishersStatisticsConstants.PUBLISHERS_STATISTICS_REQUEST_FULFILLED:
      return {
        ...state,
        isRequestPending: false,
      };
    case publishersStatisticsConstants.LOAD_PUBLISHERS_STATISTICS:
      return {
        ...state,
        publishersStatisticsList: action.data.publishersStatisticsList,
      };
    case authConstants.RESET_REDUX_STATE:
      return initialState;
    default:
      return state;
  }
};
