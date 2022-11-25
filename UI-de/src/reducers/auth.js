'use strict';

import {
  AUTH_REQUEST_PENDING,
  AUTH_REQUEST_FULFILLED,
  SIGN_IN,
  SIGN_IN_AS,
  SIGN_UP,
  LOG_OUT,
  SIGN_IN_VIA_TOKEN,
  ACCEPT_AGREEMENT,
  CREATE_BILLING_DETAILS,
  GENERATE_PUBLISHER_KEY, AUTH_REQUEST_FULFILLED_ERROR,
} from '../constants/auth';

const defaultState = {
  isRequestPending: false,
  currentUser: {},
  isAuthenticated: false,
  billingDetails: {},
  loginAs: false,
  isRequestError: false,
};

const auth = (state = defaultState, action) => {
  switch (action.type) {
    case AUTH_REQUEST_PENDING:
      return {
        ...state,
        isRequestPending: true,
      };
    case AUTH_REQUEST_FULFILLED:
      return {
        ...state,
        isRequestPending: false,
      };
    case AUTH_REQUEST_FULFILLED_ERROR:
      return {
        ...state,
        isRequestPending: false,
        isRequestError: true,
      };
    case SIGN_UP:
      return {
        ...state,
        currentUser: action.data.user,
        billingDetails: action.data.billingDetails,
        isAuthenticated: true,
      };
    case SIGN_IN:
      window.localStorage.role = action.data.user.role;
      return {
        ...state,
        currentUser: action.data.user,
        billingDetails: action.data.billingDetails,
        isAuthenticated: true,
        loginAs: false,
      };
    case SIGN_IN_AS:
      window.localStorage.role = action.data.user.role;
      return {
        ...state,
        currentUser: action.data.user,
        billingDetails: action.data.billingDetails,
        isAuthenticated: true,
        loginAs: true,
      };
    case SIGN_IN_VIA_TOKEN:
      return {
        ...state,
        currentUser: action.data.user,
        billingDetails: action.data.billingDetails,
        loginAs: action.data.loginAs,
        isAuthenticated: true,
      };
    case LOG_OUT:
      return defaultState;
    case ACCEPT_AGREEMENT:
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          isAcceptedAgreement: true,
        },
      };
    case CREATE_BILLING_DETAILS:
      return {
        ...state,
        billingDetails: action.data.billingDetails,
      };
    case GENERATE_PUBLISHER_KEY:
      return {
        ...state,
        currentUser: {...state.currentUser, apiKey: action.data.apiKey},
      };
    default:
      return state;
  }
};

export default auth;
