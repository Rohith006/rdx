import {TOP_EARNINGS_REQUEST_PENDING, TOP_EARNINGS_REQUEST_FULFILLED, LOAD_TOP_EARNINGS} from '../constants/topEarnings';

const initialState = {
  isRequestPending: false,
  topEarningsStatistic: {},
};
export default (state = initialState, action) => {
  switch (action.type) {
    case TOP_EARNINGS_REQUEST_PENDING:
      return {
        ...state,
        isRequestPending: true,
      };
    case TOP_EARNINGS_REQUEST_FULFILLED:
      return {
        ...state,
        isRequestPending: false,
      };
    case LOAD_TOP_EARNINGS:
      return {
        ...state,
        topEarningsStatistic: action.data.topEarningsStatistic,
      };
    default:
      return state;
  }
};
