import axios from 'axios';
import {NotificationManager} from 'react-notifications';
import {LOAD_USER_ACTIVATION_SETTINGS, UPDATE_USER_ACTIVATION_SETTINGS} from '../constants/platformSettings';

axios.defaults.baseURL = __INTERNAL_API_URL__;

export const loadUserActivationSettings = () => async (dispatch) => {
  try {
    const {data} = await axios.get(`/database/load/settings/user-activation`);
    dispatch({type: LOAD_USER_ACTIVATION_SETTINGS, payload: data});
  } catch (e) {
    console.error(e);
  }
};

export const updateUserActivationSettings = (data) => async (dispatch) => {
  try {
    await axios.put('/database/update/user-activation-settings', data);
    dispatch({
      type: UPDATE_USER_ACTIVATION_SETTINGS,
      data,
    });
    NotificationManager.success('Platform settings updated!');
  } catch (e) {
    console.error(e);
  }
};
