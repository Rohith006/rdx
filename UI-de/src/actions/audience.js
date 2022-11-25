import axios from 'axios';
import {NotificationManager} from 'react-notifications';
import querystring from 'querystring';
import {LOAD_AUDIENCE_COUNT, LOAD_AUDIENCE_LIST, LOAD_CURRENT_AUDIENCE} from '../constants/audiences';

export const createAudience = (audience, history) => async () => {
  try {
    await axios.post('/audience/create', audience);
    history.push(`/audiences`);
    NotificationManager.success(`Audience created!`);
  } catch (e) {
    console.error(e);
  }
};

export const updateAudience = (audience, history) => async (dispatch) => {
  try {
    const id = audience.id;
    const {data} = await axios.put(`/audience/edit/${id}`, audience);

    dispatch({
      type: LOAD_AUDIENCE_LIST,
      payload: data,
    });
    dispatch({
      type: LOAD_AUDIENCE_COUNT,
      payload: data,
    });
    history.push('/audiences');
    NotificationManager.success(`Audience ${id} updated!`);
  } catch (e) {
    console.error(e);
  }
};

export const loadAudiences = (params) => async (dispatch) => {
  try {
    const {data} = await axios.get(`/audience/load/list?${querystring.stringify(params)}`);
    dispatch({
      type: LOAD_AUDIENCE_LIST,
      payload: [],
    });
    dispatch({
      type: LOAD_AUDIENCE_LIST,
      payload: data,
    });
    dispatch({
      type: LOAD_AUDIENCE_COUNT,
      payload: data,
    });
  } catch (e) {
    console.error(e);
  }
};

export const loadAudience = (id) => async (dispatch) => {
  try {
    const {data} = await axios.get(`/audience/load/${id}`);
    dispatch({
      type: LOAD_CURRENT_AUDIENCE,
      payload: data,
    });
  } catch (e) {
    console.error(e);
  }
};

export const changeAudienceStatus = (status) => async (dispatch) => {
  try {
    const {data} = await axios.put('/audience/update/status', status);
    dispatch({
      type: LOAD_AUDIENCE_LIST,
      payload: [],
    });
    dispatch({
      type: LOAD_AUDIENCE_LIST,
      payload: {data: data.data},
    });
  } catch (e) {
    console.error(e);
  }
};
