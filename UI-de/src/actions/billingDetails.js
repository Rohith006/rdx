import axios from 'axios';
import {
  BILLING_REQUEST_PENDING,
  BILLING_REQUEST_FULFILLED,
  LOAD_BILLING,
  LOAD_CURRENT_BILLING,
} from '../constants/billingDetails';

export const loadBillingDetails = () => async (dispatch) => {
  dispatch({
    type: BILLING_REQUEST_PENDING,
  });

  try {
    const {data} = await axios.get('/database/load/billingDetails');
    dispatch({
      type: LOAD_BILLING,
      data: {
        billingDetailsList: data,
      },
    });
    dispatch({
      type: BILLING_REQUEST_FULFILLED,
    });
  } catch (e) {
    console.error(e);

    dispatch({
      type: BILLING_REQUEST_FULFILLED,
    });
  }
};

// export const loadCurrentBilling = id => async dispatch => {
//     dispatch({
//         type: BILLING_REQUEST_PENDING
//     });
//
//     try {
//         let { data } = await axios.get(`/database/load/advertiser-billing?id=${id}`);
//         dispatch({type: LOAD_CURRENT_BILLING, payload: data});
//         dispatch({
//             type: BILLING_REQUEST_FULFILLED
//         });
//     } catch(e){
//         console.error(e);
//
//         dispatch({
//             type: BILLING_REQUEST_FULFILLED
//         });
//     }
// };

