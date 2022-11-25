import {LOAD_CLICK} from '../constants/click';

const initialState = {
  currentClick: {},
};

export default (state = initialState, action) => {
  switch (action.type) {
    case LOAD_CLICK:
      return {
        ...state,
        currentClick: action.data.click,
      };
    default:
      return state;
  }
};
