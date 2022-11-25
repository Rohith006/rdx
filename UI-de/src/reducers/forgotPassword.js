import {FORGOT_PASSWORD_REQUEST_PENDING, FORGOT_PASSWORD_REQUEST_FULFILLED, SHOW_FORGOT_PASSWORD_SUCCESS_MESSAGE, RESET_FORGOT_PASSWORD_STATE, SHOW_UPDATE_PASSWORD_SUCCESS_MESSAGE} from '../constants/forgotPassword';

const initialState = {
  isRequestPending: false,
  showForgotPasswordSuccessMessage: false,
  showUpdatePasswordSuccessMessage: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case FORGOT_PASSWORD_REQUEST_PENDING:
      return {
        ...state,
        isRequestPending: true,
      };
    case FORGOT_PASSWORD_REQUEST_FULFILLED:
      return {
        ...state,
        isRequestPending: false,
      };
    case SHOW_FORGOT_PASSWORD_SUCCESS_MESSAGE:
      return {
        ...state,
        showForgotPasswordSuccessMessage: true,
      };
    case SHOW_UPDATE_PASSWORD_SUCCESS_MESSAGE:
      return {
        ...state,
        showUpdatePasswordSuccessMessage: true,
      };
    case RESET_FORGOT_PASSWORD_STATE:
      return initialState;
    default:
      return state;
  }
};
