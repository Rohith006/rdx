import {
  LOAD_AUDIENCE_LIST,
  LOAD_AUDIENCE_COUNT,
  LOAD_CURRENT_AUDIENCE,
} from '../constants/audiences';

const initialState = {
  isRequestPending:true,
  audienceList: [],
  currentAudience: {audience: {}},
  count: 0,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case LOAD_AUDIENCE_LIST:
      return {
        ...state,
        audienceList: action.payload,
        isRequestPending:false
      };
    case LOAD_AUDIENCE_COUNT:
      return {
        ...state,
        count: action.payload,
      };
    case LOAD_CURRENT_AUDIENCE:
      return {
        ...state,
        currentAudience: action.payload,
      };
    default:
      return state;
  }
};
