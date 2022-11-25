import {
  NOTIFICATIONS_REQUEST_PENDING,
  NOTIFICATIONS_REQUEST_FULFILLED,
  LOAD_NOTIFICATIONS,
} from "../constants/notification";

const initialState = {
  isRequestPending: false,
  notificationData: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case NOTIFICATIONS_REQUEST_PENDING:
      return {
        ...state,
        isRequestPending: true,
      };
    case NOTIFICATIONS_REQUEST_FULFILLED:
      return {
        ...state,
        isRequestPending: false,
      };
    case LOAD_NOTIFICATIONS:
      return {
        ...state,
        notificationData: action.payload,
      };
    default:
      return state;
  }
};