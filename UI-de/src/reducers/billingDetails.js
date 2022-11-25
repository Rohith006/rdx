import {BILLING_REQUEST_PENDING, BILLING_REQUEST_FULFILLED, LOAD_BILLING} from '../constants/billingDetails';
import {RESET_REDUX_STATE} from '../constants/auth';

const initialState = {
  isRequestPending: false,
  billingDetailsList: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case BILLING_REQUEST_PENDING:
      return {
        ...state,
        isRequestPending: true,
      };
    case BILLING_REQUEST_FULFILLED:
      return {
        ...state,
        isRequestPending: false,
      };
    case LOAD_BILLING:
      return {
        ...state,
        billingDetailsList: action.data.billingDetailsList,
      };
    case RESET_REDUX_STATE:
      return initialState;
    default:
      return state;
  }
};
