import axios from 'axios';

import {USER_ACTIVITY_REQUEST_PENDING, LOAD_USER_ACTIVITY_REPORTS, USER_ACTIVITY_REQUEST_COMPLETED} from '../constants/reports';

export const loadUserActivityReports = (data) => async (dispatch) => {
  dispatch({
    type: USER_ACTIVITY_REQUEST_PENDING,
  });

  try {
    const {data: {userActivityLogs}} = await axios.post('/database/load/user-activity-logs', data);

    dispatch({
      type: LOAD_USER_ACTIVITY_REPORTS,
      data: {userActivityLogs},
    });
    dispatch({
      type: USER_ACTIVITY_REQUEST_COMPLETED,
    });
  } catch (err) {
    console.log(err);

    dispatch({
      type: USER_ACTIVITY_REQUEST_COMPLETED,
    });
  }
};

export const logActivity = (data) => async (dispatch) => {
  dispatch({
    type: USER_ACTIVITY_REQUEST_PENDING,
  });

  try {
    await axios.post('/api/log-activity', data);
  } catch (e) {
    console.log(e);
  }

  dispatch({
    type: USER_ACTIVITY_REQUEST_COMPLETED,
  });
};
