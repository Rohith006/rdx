import {CONVERSION_REQUEST_FULFILLED, CONVERSION_REQUEST_PENDING, LOAD_CONVERSION} from '../constants/conversion';

const initialState = {
  currentConversion: {},
};

export default (state = initialState, action) => {
  switch (action.type) {
    case CONVERSION_REQUEST_PENDING:
      return {
        ...state,
        isRequestPending: true,
      };
    case CONVERSION_REQUEST_FULFILLED:
      return {
        ...state,
        isRequestPending: false,
      };
    case LOAD_CONVERSION:
      return {
        ...state,
        currentConversion: action.data.conversion,
      };
    default:
      return state;
  }
};
