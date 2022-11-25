import {CHANGE_PAGINATION_VALUE} from '../constants/app';

const initialState = {
  limit: 100,
  offset: 0,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case CHANGE_PAGINATION_VALUE:
      return {
        ...state,
        limit: action.payload.limit,
        offset: action.payload.offset,
      };
    default:
      return state;
  }
};
