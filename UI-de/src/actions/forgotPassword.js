import axios from 'axios';
import {FORGOT_PASSWORD_REQUEST_PENDING, FORGOT_PASSWORD_REQUEST_FULFILLED, SHOW_FORGOT_PASSWORD_SUCCESS_MESSAGE, SHOW_UPDATE_PASSWORD_SUCCESS_MESSAGE, RESET_FORGOT_PASSWORD_STATE} from '../constants/forgotPassword';

export const restorePassword = (data) => (dispatch) => {
  dispatch({
    type: FORGOT_PASSWORD_REQUEST_PENDING,
  });

  return axios.post('/database/create/restore-password', data).then(() => {
    dispatch({
      type: FORGOT_PASSWORD_REQUEST_FULFILLED,
    });
    dispatch({
      type: SHOW_FORGOT_PASSWORD_SUCCESS_MESSAGE,
    });
  });
};

export const updatePassword = (data) => (dispatch) => {
  return axios.put('/database/update/update-password', data).then(() => {
    dispatch({
      type: SHOW_UPDATE_PASSWORD_SUCCESS_MESSAGE,
    });
  });
};

export const resetForgotPasswordState = () => (dispatch) => {
  dispatch({
    type: RESET_FORGOT_PASSWORD_STATE,
  });
};
