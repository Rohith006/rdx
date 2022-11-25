import {
  COUNTRIES_REQUEST_PENDING,
  COUNTRIES_REQUEST_FULFILLED,
  LOAD_COUNTRIES,
  CITIES_REQUEST_FULFILLED,
  CITIES_REQUEST_PENDING,
  LOAD_CITIES,
  LOAD_STATES,
  LOAD_LANGUAGES,
} from '../constants/countries';
import {RESET_REDUX_STATE} from '../constants/auth';
import {alpha2} from '../constants/alpha2';

const initialState = {
  isRequestPending: false,
  countriesList: alpha2 || [],
  citiesList: [],
  statesList: [],
  languagesList: {},
  selectList: [{label: '-', value: null}],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case COUNTRIES_REQUEST_PENDING:
      return {
        ...state,
        isRequestPending: true,
      };
    case COUNTRIES_REQUEST_FULFILLED:
      return {
        ...state,
        isRequestPending: false,
      };
    case LOAD_COUNTRIES: {
      const selectList = [...state.selectList, ...action.data.countriesList.map((country) => ({
        value: country.alpha2Code,
        label: country.name,
      }))];

      return {
        ...state,
        countriesList: action.data.countriesList,
        selectList,
      };
    }
    case LOAD_STATES: {
      return {
        ...state,
        statesList: action.data,
      };
    }
    case LOAD_CITIES: {
      return {
        ...state,
        citiesList: action.data,
      };
    }
    case LOAD_LANGUAGES: {
      return {
        ...state,
        languagesList: action.data,
      };
    }
    case RESET_REDUX_STATE:
      return initialState;
    default:
      return state;
  }
};
