import * as topCountriesConstants from '../constants/topCountries';
import * as authConstants from '../constants/auth';

const initialState = {
  isRequestPending: false,
  topCountriesList: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case topCountriesConstants.TOP_COUNTRIES_REQUEST_PENDING:
      return {
        ...state,
        isRequestPending: true,
      };
    case topCountriesConstants.TOP_COUNTRIES_REQUEST_FULFILLED:
      return {
        ...state,
        isRequestPending: false,
      };
    case topCountriesConstants.LOAD_TOP_COUNTRIES:
      return {
        ...state,
        topCountriesList: action.data,
      };
    case authConstants.RESET_REDUX_STATE:
      return initialState;
    default:
      return state;
  }
};
