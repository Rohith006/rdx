import axios from 'axios';

import {LOAD_BANNER_RESOLUTIONS} from '../constants/dsp';

export const loadBannerResolutions = () => async (dispatch) => {
  try {
    const {data} = await axios.get(`/dsp/banner-resolutions`);
    dispatch({
      type: LOAD_BANNER_RESOLUTIONS,
      payload: data,
    });
  } catch (e) {
    console.error(e);
  }
};
