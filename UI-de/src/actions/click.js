import axios from 'axios';
import {LOAD_CLICK} from '../constants/click';

export const loadClick = (id) => (dispatch) => {
  axios.get(`/database/load/click-details?id=${id}`).then((response) => {
    const {click} = response.data;
    dispatch({
      type: LOAD_CLICK,
      data: {
        click,
      },
    });
  })
      .catch(console.log);
};
