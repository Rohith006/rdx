import {LOAD_DSP_INTEGRATIONS, LOAD_BANNER_RESOLUTIONS} from '../constants/dsp';

const initialState = {integration: {}, resolutions: []};

export default (state = initialState, action) => {
  switch (action.type) {
    case LOAD_DSP_INTEGRATIONS: {
      const selectPush = [];
      const selectPop = [];
      // eslint-disable-next-line guard-for-in
      for (const key in action.data.push) {
        selectPush.push({label: key, value: key});
      }
      // eslint-disable-next-line guard-for-in
      for (const key in action.data.pop) {
        selectPop.push({label: key, value: key});
      }

      return {
        ...state,
        integration: {
          push: {
            data: action.data.push,
            keys: Object.keys(action.data.push),
            selectData: selectPush,
          },
          pop: {
            data: action.data.pop,
            keys: Object.keys(action.data.pop),
            selectData: selectPop,
          },
        },
      };
    }
    case LOAD_BANNER_RESOLUTIONS:
      return {
        ...state,
        resolutions: [...action.payload],
      };
    default:
      return state;
  }
};
