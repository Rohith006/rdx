import axios from 'axios'
import * as capsConstants from '../constants/caps'

export const loadCaps = () => async (dispatch) => {
  try {
    dispatch({
      type: capsConstants.CAPS_REQUEST_PENDING,
    })

    const { data } = await axios.get('/dashboard/caps')

    dispatch({
      type: capsConstants.LOAD_CAPS,
      data,
    })
    dispatch({
      type: capsConstants.CAPS_REQUEST_FULFILLED,
    })
  } catch (e) {
    dispatch({
      type: capsConstants.CAPS_REQUEST_FULFILLED,
    })
  }
}
