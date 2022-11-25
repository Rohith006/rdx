import axios from 'axios'
import * as topCountriesConstants from '../constants/topCountries'

export const loadTopCountries = () => async (dispatch) => {
  try {
    dispatch({
      type: topCountriesConstants.TOP_COUNTRIES_REQUEST_PENDING,
    })
    const { data } = await axios.get('/dashboard/top-countries')
    dispatch({
      type: topCountriesConstants.LOAD_TOP_COUNTRIES,
      data,
    })
    dispatch({
      type: topCountriesConstants.TOP_COUNTRIES_REQUEST_FULFILLED,
    })
  } catch (e) {
    dispatch({
      type: topCountriesConstants.TOP_COUNTRIES_REQUEST_FULFILLED,
    })
    console.error(e)
  }
}
