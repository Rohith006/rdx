import {TOP_SPENT_REQUEST_PENDING, TOP_SPENT_REQUEST_FULFILLED, LOAD_TOP_SPENT} from '../constants/topSpent';

const initialState = {
  isRequestPending: false,
  topSpentStatistic: {},
};
export default (state = initialState, action) => {
  switch (action.type) {
    case TOP_SPENT_REQUEST_PENDING:
      return {
        ...state,
        isRequestPending: true,
      };
    case TOP_SPENT_REQUEST_FULFILLED:
      return {
        ...state,
        isRequestPending: false,
      };
    case LOAD_TOP_SPENT:
      return {
        ...state,
        topSpentStatistic: action.data.topSpentStatistic,
      };
    default:
      return state;
  }
};
