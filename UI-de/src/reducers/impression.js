import {IMPRESSION_REQUEST_FULFILLED, IMPRESSION_REQUEST_PENDING, LOAD_IMPRESSION} from '../constants/impression';

const initialState = {
  currentImpression: {},
};

export default (state = initialState, action) => {
  switch (action.type) {
    case IMPRESSION_REQUEST_PENDING:
      return {
        ...state,
        isRequestPending: true,
      };
    case IMPRESSION_REQUEST_FULFILLED:
      return {
        ...state,
        isRequestPending: false,
      };
    case LOAD_IMPRESSION:
      return {
        ...state,
        currentImpression: action.data.impression,
      };
    default:
      return state;
  }
};
