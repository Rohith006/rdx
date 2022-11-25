import * as authConstants from '../constants/auth';
import * as reportsConstants from '../constants/reports';
const initialState = {
  isRequestPending: false,
  reportsList: [],
  reportCopy: [],
  countReports: 0,
  settings: {},
  dropdownData: [],
};
export default (state = initialState, action) => {
  switch (action.type) {
    case reportsConstants.REPORTS_REQUEST_PENDING:
      return {
        ...state,
        isRequestPending: true,
      };
    case 'DROPDOWN':
      return {
        ...state,
        dropdownData: action,
      };
    case reportsConstants.SET_SETTINGS:
      return {
        ...state,
        settings: {...action.payload},
      };
    case reportsConstants.REPORTS_REQUEST_FULFILLED:
      return {
        ...state,
        isRequestPending: false,
      };
    case reportsConstants.LOAD_REPORTS:
      return {
        ...state,
        reportsList: action.data.reportsList,
        reportCopy: action.data.reportsList,
      };
    case reportsConstants.REPORTS_COUNT_PAGINATION:
      return {
        ...state,
        countReports: action.data.count,
      };
    case reportsConstants.GET_FILTERED_CAMPAIGNS:
      if (action.payload || typeof action.payload === 'string') {
        return {
          ...state,
          reportsList: state.reportsList.filter((el) => !(el.clicksCount === 0)),
        };
      } else {
        return {
          ...state,
          reportsList: state.reportCopy,
        };
      }
    case reportsConstants.RESET_REPORTS_STATE:
      return initialState;
    case authConstants.RESET_REDUX_STATE:
      return initialState;
    default:
      return state;
  }
};