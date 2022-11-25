import axios from 'axios';
import * as summaryConstants from '../constants/summary';

export const loadSummary = () => async (dispatch) => {
  try {
    dispatch({
      type: summaryConstants.SUMMARY_REQUEST_PENDING,
    });

    const {data} = await axios.get('/dashboard/summary');

    dispatch({
      type: summaryConstants.LOAD_SUMMARY,
      data,
    });
    dispatch({
      type: summaryConstants.SUMMARY_REQUEST_FULFILLED,
    });
  } catch (e) {
    dispatch({
      type: summaryConstants.SUMMARY_REQUEST_FULFILLED,
    });

    console.error(e);
  }
};
