import axios from "axios";
import NotificationManager from "react-notifications/lib/NotificationManager";
import {
  LOAD_NOTIFICATIONS,
  NOTIFICATIONS_REQUEST_PENDING,
  NOTIFICATIONS_REQUEST_FULFILLED,
} from "../constants/notification";
import localization from "../localization";

export const loadNotification = (email) => async (dispatch) => {
  dispatch({
    type: NOTIFICATIONS_REQUEST_PENDING,
  });
  try {
    const { data, status } = await axios.get(
      `${__NOTIFICATION_API_URL__}/${email}`
    );
    dispatch({
      type: LOAD_NOTIFICATIONS,
      payload: data,
    });
    if (status === 200) {
      dispatch({
        type: NOTIFICATIONS_REQUEST_FULFILLED,
      });
    }
  } catch (e) {
    console.error(e);
  }
};

export const updateOne = (email, id) => async () => {
  try {
    const { status } = await axios.put(
      `${__NOTIFICATION_API_URL__}/${email}/mark-read/${id}`
    );
    return status
  } catch (e) {
    if(e.response.status!==200) {
      NotificationManager.error(localization.serverError.Notification.readNotificationFailed)
      return e.response.status
    }
  }
};

export const updateAll = (email) => async () => {
  try {
    const { status } = await axios.put(
      `${__NOTIFICATION_API_URL__}/${email}/mark-all-read/`
    );
    return status
  } catch (e) {
    if(e.response.status!==200) {
      NotificationManager.error(localization.serverError.Notification.readNotificationFailed)
      return e.response.status
    }
  }
};