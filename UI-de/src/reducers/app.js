import {EDIT, RESET_FORM_STATE, SET_ACTION_VALUE_EDIT} from '../constants/app';

const initialState = {
  formAction: '',
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_ACTION_VALUE_EDIT:
      return {
        ...state,
        formAction: EDIT,
      };
    case RESET_FORM_STATE:
      return initialState;
    default:
      return state;
  }
};
