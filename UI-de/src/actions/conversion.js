import axios from 'axios';
import {CONVERSION_REQUEST_FULFILLED, CONVERSION_REQUEST_PENDING, LOAD_CONVERSION} from '../constants/conversion';

export const loadConversion = (id) => (dispatch) => {
  dispatch({
    type: CONVERSION_REQUEST_PENDING,
  });

  axios.get(`/database/load/conversion-details?id=${id}`).then((response) => {
    const {conversion} = response.data;

    dispatch({
      type: LOAD_CONVERSION,
      data: {
        conversion,
      },
    });
    dispatch({
      type: CONVERSION_REQUEST_FULFILLED,
    });
  }).catch(console.log);
};
