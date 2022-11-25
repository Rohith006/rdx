import * as summaryConstants from '../constants/summary';

const initialState = {
  isRequestPending: false,
  summary: {},
};

export default (state = initialState, action) => {
  switch (action.type) {
    case summaryConstants.SUMMARY_REQUEST_PENDING:
      return {
        ...state,
        isRequestPending: true,
      };
    case summaryConstants.SUMMARY_REQUEST_FULFILLED:
      return {
        ...state,
        isRequestPending: false,
      };
    case summaryConstants.LOAD_SUMMARY:
      return {
        ...state,
        summary: action.data.summary,
      };
    default:
      return state;
  }
};
