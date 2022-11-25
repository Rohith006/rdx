import axios from 'axios';
import {IMPRESSION_REQUEST_FULFILLED, IMPRESSION_REQUEST_PENDING, LOAD_IMPRESSION} from '../constants/impression';

export const loadImpression = (id) => (dispatch) => {
  dispatch({
    type: IMPRESSION_REQUEST_PENDING,
  });

  axios.get(`/database/load/impression-details?id=${id}`).then((response) => {
    const {impression} = response.data;

    dispatch({
      type: LOAD_IMPRESSION,
      data: {
        impression,
      },
    });
    dispatch({
      type: IMPRESSION_REQUEST_FULFILLED,
    });
  }).catch(console.log);
};
