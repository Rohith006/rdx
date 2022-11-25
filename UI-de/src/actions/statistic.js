import axios from "axios";

import {
  SET_COMMON_STATISTIC,
  SET_TRAFFIC_STATISTIC,
} from "../constants/reports";

export const loadCommonStatistic = () => async (dispatch) => {
  try {
    const response = await axios.get("/database/load/common-statistics");
    dispatch({
      type: SET_COMMON_STATISTIC,
      data: response.data,
    });
  } catch (e) {
    console.log(e);
  }
};

export const loadTrafficStatistic =
  (dateRange, role, id) => async (dispatch) => {
    try {
      const response = await axios.get(
        `/dashboard/traffic-statistics?dateRange=${dateRange}&role=${role}&id=${id}`
      );
      const { trafficStatistics } = response.data;
      var data;
      if (dateRange === 30) {
        data = trafficStatistics;
      }
      if (dateRange === 7) {
        data = trafficStatistics.slice(-7);
      }
      if (dateRange === 1) {
        data = trafficStatistics.slice(-1);
      }
      dispatch({
        type: SET_TRAFFIC_STATISTIC,
        data: data,
      });
    } catch (e) {
      console.log(e);
    }
  };
