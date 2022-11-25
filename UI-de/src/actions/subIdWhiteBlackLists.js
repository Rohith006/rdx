import axios from 'axios';
import {NotificationManager} from 'react-notifications';
import * as subIdWhiteBlackListsConstants from '../constants/subIdWhiteBlackLists';

const TRAFFIC_FILTERS_API_ROOT = `${__INTERNAL_API_URL__}/v1/traffic-optimization`;

export const addSubIdsToList = (data) => (dispatch) => {
  const apiUrl = `${TRAFFIC_FILTERS_API_ROOT}/campaigns/add/sub-ids`;

  dispatch(requestPending());

  return axios.post(apiUrl, data).then((response) => {
    dispatch({
      type: subIdWhiteBlackListsConstants.CREATE_SUBID_WHITE_LIST_ITEM,
      data: response.data,
    });

    NotificationManager.success(`${data.type} values successfully added to ${data.list}`);
  });
};

export const deleteSubIdsFromList = (data) => async (dispatch) => {
  const apiUrl = `${TRAFFIC_FILTERS_API_ROOT}/campaigns/delete/sub-ids`;

  try {
    await axios.delete(apiUrl, {data});

    dispatch({
      type: subIdWhiteBlackListsConstants.DELETE_SUBID_WHITE_LIST_ITEM,
      data,
    });
  } catch (e) {
    console.error(e);
  }
};

export const deleteSubIdWhiteListItem = (data) => async (dispatch) => {
  try {
    await axios.delete('/database/delete/subid-white-list-item', {data});
  } catch (e) {
    console.error(e);
  }
};

export const deleteSubIdBlackListItem = (data) => async (dispatch) => {
  try {
    await axios.delete('/database/delete/subid-black-list-item', {data});
    dispatch({
      type: subIdWhiteBlackListsConstants.DELETE_SUBID_BLACK_LIST_ITEM,
      data,
    });
  } catch (e) {
    console.error(e);
  }
};

export const loadSubIds = (params) => async (dispatch) => {
  const apiUrl = `${TRAFFIC_FILTERS_API_ROOT}/campaigns/sub-ids`;

  try {
    dispatch(requestPending());

    const response = await axios.get(apiUrl, {params});

    dispatch({type: subIdWhiteBlackListsConstants.LOAD_SUBID_WHITE_LIST, data: response.data});
  } catch (e) {
    console.error(e);
  }
};

export const loadSubIdWhiteList = () => async (dispatch) => {
  try {
    dispatch({
      type: subIdWhiteBlackListsConstants.SUBID_WHITE_LIST_REQUEST_PENDING,
    });

    const {data} = await axios.get('/database/load/subid-white-list');

    dispatch({
      type: subIdWhiteBlackListsConstants.LOAD_SUBID_WHITE_LIST,
      data,
    });
    dispatch({
      type: subIdWhiteBlackListsConstants.SUBID_WHITE_LIST_REQUEST_FULFILLED,
    });
  } catch (e) {
    console.error(e);
  }
};

export const loadSubIdBlackList = () => async (dispatch) => {
  try {
    dispatch({
      type: subIdWhiteBlackListsConstants.SUBID_BLACK_LIST_REQUEST_PENDING,
    });

    const {data} = await axios.get('/database/load/subid-black-list');

    dispatch({
      type: subIdWhiteBlackListsConstants.LOAD_SUBID_BLACK_LIST,
      data,
    });
    dispatch({
      type: subIdWhiteBlackListsConstants.SUBID_BLACK_LIST_REQUEST_FULFILLED,
    });
  } catch (e) {
    console.error(e);
  }
};

const requestPending = () => ({type: subIdWhiteBlackListsConstants.SUBID_WHITE_LIST_REQUEST_PENDING});
