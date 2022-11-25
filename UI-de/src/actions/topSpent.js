import axios from 'axios';
import * as topSpentConstants from '../constants/topSpent';

export const loadTopSpent = () => async (dispatch) => {
  try {
    dispatch({
      type: topSpentConstants.TOP_SPENT_REQUEST_PENDING,
    });

    const {data} = await axios.get('/dashboard/top-spent');

    dispatch({
      type: topSpentConstants.LOAD_TOP_SPENT,
      data,
    });
    dispatch({
      type: topSpentConstants.TOP_SPENT_REQUEST_FULFILLED,
    });
  } catch (e) {
    dispatch({
      type: topSpentConstants.TOP_SPENT_REQUEST_FULFILLED,
    });
  }
};
