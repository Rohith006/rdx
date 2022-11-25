import axios from 'axios';
import * as topEarningsConstants from '../constants/topEarnings';
import {PUBLISHER, ADVERTISER} from '../constants/user';

export const loadTopEarnings = (user) => async (dispatch) => {
  let apiUrl;
  switch (user.role) {
    case PUBLISHER:
      apiUrl = '/dashboard/top-campaigns-for-publisher';
      break;
    case ADVERTISER:
      apiUrl = '/dashboard/top-campaigns-for-advertiser';
      break;
    default:
      apiUrl = '/dashboard/top-earnings';
  }
  try {
    dispatch({
      type: topEarningsConstants.TOP_EARNINGS_REQUEST_PENDING,
    });

    const {data} = await axios.get(apiUrl);

    dispatch({
      type: topEarningsConstants.LOAD_TOP_EARNINGS,
      data,
    });
    dispatch({
      type: topEarningsConstants.TOP_EARNINGS_REQUEST_FULFILLED,
    });
  } catch (e) {
    dispatch({
      type: topEarningsConstants.TOP_EARNINGS_REQUEST_FULFILLED,
    });
  }
};
