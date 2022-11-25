import {CHECK_SEND_EMAIL_TEST, HIGHLIGHT_CLICK_TEST, CHECK_CLICK_TEST, HIGHLIGHT_INSTALL_TEST, CHECK_INSTALL_TEST, SET_EMAIL_ERROR, CLEAR_EMAIL_ERROR, RESET_TRACKING_STATE, EMAIL_REQUEST_PENDING, EMAIL_REQUEST_FULFILLED} from '../constants/trackingTest';
import {RESET_REDUX_STATE} from '../constants/auth';

const initialState = {
  isSendEmailTestChecked: false,
  isClickTestHighlighted: false,
  isClickTestChecked: false,
  isInstallTestHighlighted: false,
  isInstallTestChecked: false,
  emailError: false,
  isEmailRequestPending: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case EMAIL_REQUEST_PENDING:
      return {
        ...state,
        isEmailRequestPending: true,
      };
    case EMAIL_REQUEST_FULFILLED:
      return {
        ...state,
        isEmailRequestPending: false,
      };
    case CHECK_SEND_EMAIL_TEST:
      return {
        ...state,
        isSendEmailTestChecked: true,
      };
    case HIGHLIGHT_CLICK_TEST:
      return {
        ...state,
        isClickTestHighlighted: true,
      };
    case CHECK_CLICK_TEST:
      return {
        ...state,
        isClickTestChecked: true,
      };
    case HIGHLIGHT_INSTALL_TEST:
      return {
        ...state,
        isInstallTestHighlighted: true,
      };
    case CHECK_INSTALL_TEST:
      return {
        ...state,
        isInstallTestChecked: true,
      };
    case SET_EMAIL_ERROR:
      return {
        ...state,
        emailError: true,
      };
    case CLEAR_EMAIL_ERROR:
      return {
        ...state,
        emailError: false,
      };
    case RESET_TRACKING_STATE:
      return initialState;
    case RESET_REDUX_STATE:
      return initialState;
    default:
      return state;
  }
};
