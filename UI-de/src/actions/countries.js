import axios from 'axios';
import {
  COUNTRIES_REQUEST_PENDING,
  COUNTRIES_REQUEST_FULFILLED,
  LOAD_COUNTRIES,
  LOAD_CITIES,
  LOAD_STATES,
  CITIES_REQUEST_PENDING,
  CITIES_REQUEST_FULFILLED,
  LANGUAGES_REQUEST_PENDING,
  LOAD_LANGUAGES,
} from '../constants/countries';

const deleteAuthHeader = {
  transformRequest: [(data, headers) => {
    delete headers.common.authorization;
    return data;
  }],
};

export const loadCountries = () => async (dispatch) => {
  try {
    dispatch({
      type: COUNTRIES_REQUEST_PENDING,
    });

    const response = await axios.get('https://restcountries.eu/rest/v2/all?fields=alpha2Code;name', deleteAuthHeader);

    dispatch({
      type: LOAD_COUNTRIES,
      data: {
        countriesList: response.data,
      },
    });
    dispatch({
      type: COUNTRIES_REQUEST_FULFILLED,
    });
  } catch (e) {
    console.log(e);
  }
};

export const loadStates = (countries) => async (dispatch) => {
  try {
    if (!countries) {
      dispatch({type: LOAD_STATES, data: []});
      return;
    }

    const requestData = countries.map((c) => c.value);

    dispatch({type: COUNTRIES_REQUEST_PENDING});

    const {data} = await axios.get(`/utils/states?countryCodes=${requestData}`);

    dispatch({type: LOAD_STATES, data});
  } catch (e) {
    console.error(e);
  } finally {
    dispatch({type: COUNTRIES_REQUEST_FULFILLED});
  }
};

export const loadCities = (countries) => async (dispatch) => {
  try {
    if (!countries) {
      dispatch({type: LOAD_CITIES, data: []});
      return;
    }
    const requestData = countries.map((c) => c.value);

    dispatch({
      type: CITIES_REQUEST_PENDING,
    });


    const {data} = await axios.get(`/utils/cities-search?countryCodes=${requestData}`);

    dispatch({
      type: LOAD_CITIES,
      data,
    });
    dispatch({
      type: CITIES_REQUEST_FULFILLED,
    });
  } catch (e) {
    console.log(e);
  }
};

export const loadFilteredCities = (countries, words) => async (dispatch) => {
  if (!words) return;
  try {
    if (!countries) {
      dispatch({type: LOAD_CITIES, data: []});
      return;
    }
    let codes = ``;
    countries.forEach((el) => codes += `${el.value},`);
    codes = codes.slice(0, -1);

    dispatch({
      type: CITIES_REQUEST_PENDING,
    });

    const {data} = await axios.get(`/utils/cities-search?countryCodes=${codes}&words=${words}`);

    dispatch({
      type: LOAD_CITIES,
      data,
    });
    dispatch({
      type: CITIES_REQUEST_FULFILLED,
    });
  } catch (e) {
    console.log(e);
  }
};

export const loadLanguages = () => async (dispatch) => {
  try {
    dispatch({
      type: LANGUAGES_REQUEST_PENDING,
    });


    const {data} = await axios.get(`/utils/languages`);

    dispatch({
      type: LOAD_LANGUAGES,
      data,
    });
    dispatch({
      type: CITIES_REQUEST_FULFILLED,
    });
  } catch (e) {
    console.log(e);
  }
};

