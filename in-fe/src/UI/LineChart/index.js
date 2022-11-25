import React, { useEffect, useState, memo } from "react";
import Line from "./LineChart";
import millify from "millify";
import { data } from "./data";

const EVENTS = "#4F96A1";
const PROFILES = "#78A9ED";
const SESSIONS = "#f3906a";
const DEFAULT_CHART_COLORS = [EVENTS, PROFILES, SESSIONS];

const chart = {
  events: "Events",
  profiles: "Profiles",
  sessions: "Sessions",
};

const prepChartData = (rawData) => {
  const profiles = rawData.map((data) => data.profiles);
  const sessions = rawData.map((data) => data.sessions);
  const events = rawData.map((data) => data.events);
  const date = rawData.map((data) => data.date);
  const final = {
    profiles,
    sessions,
    events,
    date,
  };
  return final;
};

const checkPermissions = (role, permissions) => {
  const newDataPoints = [];
  if (role === "ADMIN") {
    // Show revenue and profit as well
    newDataPoints.push("revenue");
    newDataPoints.push("profit");
    return newDataPoints;
  }
};

let chartOption = {
  animationDuration: 800,
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "line",
      lineStyle: {
        type: "line",
      },
    },
    backgroundColor: "rgba(255, 255, 255, 1)",
  },
  legend: {
    data: [],
    selected: {},
    bottom: true,
  },
  grid: {
    left: "3%",
    right: "4%",
    bottom: "10%",
    containLabel: true,
  },
  xAxis: {
    type: "category",
    boundaryGap: false,
    data: [],
    axisLabel: {
      hideOverlap: true,
    },
    axisTick: { show: false },
  },
  yAxis: [
    {
      type: "value",
      // type:'log',   // for logarithmic scale of yAxis
      // scale:true,
      // splitNumber :10,
      // minInterval:100
      // maxInterval:100,
      // interval :200,
      // min:1,
      position: "left",
      name: "",
      nameLocation: "middle",
      nameTextStyle: {
        lineHeight: 65,
        fontWeight: 600,
        fontFamily: "Montserrat",
        fontSize: 12,
        verticalAlign: "bottom",
        padding: [20, 0, 0, 0],
      },
      axisLine: {
        show: true,
      },
      axisLabel: {
        formatter: (value, index) => {
          return millify(value, { precision: 1 });
        },
      },
      axisTick: { show: true },
    },
    {
      type: "value",
      position: "right",
      name: "",
      nameLocation: "middle",
      nameTextStyle: {
        lineHeight: 65,
        fontWeight: 600,
        fontFamily: "Montserrat",
        fontSize: 12,
        verticalAlign: "top",
        padding: [0, 20, 0, 0],
      },
      axisLine: {
        show: true,
      },
      axisLabel: {
        formatter: (value, index) => {
          return millify(value, { precision: 1 });
        },
      },
      axisTick: { show: true },
    },
  ],
  series: [],
};

let seriesProps = {
  name: "",
  type: "line",
  symbolSize: 4,
  data: [],
  itemStyle: {},
};

let LEGEND = ["events"];
const datum = data;

const LineCharts = (props) => {
  const [show, setShow] = useState(false);
  const [chartData, setChartData] = useState();
  const [availableDataPoints, setAvailableDataPoints] = useState([
    "events",
    "profiles",
    "sessions",
  ]);

  useEffect(() => {
    const preparedData = prepChartData(datum.slice().reverse()); // prep chart data from response received at API
    setChartData(preparedData);
    const newDataPoints = [...availableDataPoints];
    function keepUnique(value, index, self) {
      return self.indexOf(value) === index;
    }
    var unique = newDataPoints.filter(keepUnique);
    setAvailableDataPoints(unique);
    return () => {
      setShow(false);
    };
  }, [datum]);

  useEffect(() => {
    if (chartData) {
      chartOption.legend.data = availableDataPoints;
      availableDataPoints.forEach((item) => {
        if (LEGEND.includes(item)) {
          chartOption.legend.selected[item] = true;
        } else {
          chartOption.legend.selected[item] = false;
        }
      });
      chartOption.xAxis.data = chartData.date;

      //series
      chartOption.series = availableDataPoints.map((item, idx) => {
        let series = { ...seriesProps };
        series.name = item;
        series.data = chartData[item];
        series.itemStyle = { color: DEFAULT_CHART_COLORS[idx] };
        if (idx < 2) {
          series.yAxisIndex = idx;
          chartOption.yAxis[idx].name = chart[item];
        }
        return series;
      });
      setShow(true);
    }
  }, [chartData]);

  useEffect(() => {
    // component will unmount
    return () => {
      LEGEND = ["events"];
    };
  }, []);

  const csvHandler = (legend, chartData, createCsv) => {
    if (legend.length > 0) {
      const matrix = [["category"]];
      for (let i = 0; i < chartData[Object.keys(chartData)[0]].length; i++) {
        matrix.push([chartData.dates[i]]);
      }
      legend.forEach((item, idx) => {
        matrix[0].push(item);
        chartData[item].forEach((num, i) => {
          matrix[i + 1].push(num);
        });
      });

      createCsv(matrix);
    }
  };
  return (
    <div id="chart">
      {show && (
        <div>
          <Line
            chartData={chartData}
            chartOption={chartOption}
            legend={LEGEND}
            yAxis={chart}
            csvHandler={csvHandler}
            // theme="dark"
          />
        </div>
      )}
    </div>
  );
};

export default memo(LineCharts);
