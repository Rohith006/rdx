import {LOAD_USER_ACTIVATION_SETTINGS} from '../constants/platformSettings';

const initialState = {};

export default (state = initialState, action) => {
  switch (action.type) {
    case LOAD_USER_ACTIVATION_SETTINGS:
      return {
        ...state,
        [action.payload.configuration]: action.payload.setup,
      };
    default:
      return state;
  }
};
