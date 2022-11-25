import {USER_ACTIVITY_REQUEST_PENDING, LOAD_USER_ACTIVITY_REPORTS, USER_ACTIVITY_REQUEST_COMPLETED} from '../constants/reports';

const initialState = {
  isRequestPending: false,
  userActivityLogs: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case USER_ACTIVITY_REQUEST_PENDING:
      return {
        ...state,
        isRequestPending: true,
      };
    case USER_ACTIVITY_REQUEST_COMPLETED:
      return {
        ...state,
        isRequestPending: false,
      };
    case LOAD_USER_ACTIVITY_REPORTS:
      return {
        ...state,
        userActivityLogs: action.data.userActivityLogs,
      };
    default:
      return state;
  }
};
