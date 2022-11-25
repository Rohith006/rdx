import React, { useEffect, useState, memo } from "react";
import localization from "../../localization";
import {
  ADMIN,
  ACCOUNT_MANAGER,
  ADVERTISER,
  PUBLISHER,
} from "../../constants/user";
import Line from "../common/LineChart";
import millify from "millify";

const prepChartData = (rawData) => {
  const bidrequests = rawData.map((data) => data.bidrequests);
  const bidresponses = rawData.map((data) => data.bidresponses);
  const clicks = rawData.map((data) => data.clicks);
  const cr = rawData.map((data) => data.cr);
  const ctr = rawData.map((data) => data.ctr);
  const fillRate = rawData.map((data) => data.fillRate);
  const impressions = rawData.map((data) => data.impressions);
  const payout = rawData.map((data) => data.payout);
  const profit = rawData.map((data) => data.profit);
  const revenue = rawData.map((data) => data.revenue);
  const winRate = rawData.map((data) => data.winRate);
  const dates = rawData.map((data) => data.date);
  const final = {
    bidrequests,
    bidresponses,
    clicks,
    cr,
    ctr,
    fillRate,
    impressions,
    payout,
    profit,
    revenue,
    winRate,
    dates,
  };
  return final;
};

const checkPermissions = (role, permissions) => {
  const newDataPoints = [];
  if (role === ADMIN) {
    // Show revenue and profit as well
    newDataPoints.push("revenue");
    newDataPoints.push("profit");
  } else if (role === ACCOUNT_MANAGER) {
    if (permissions.includes("ADVERTISERS")) {
      newDataPoints.push("revenue");
    }

    if (permissions.includes("SEE_PROFIT")) {
      newDataPoints.push("profit");
    }
  } else if (role === ADVERTISER) {
    //show spends
    newDataPoints.push("spend");
  } else if (role === PUBLISHER) {
    //add revenue
    newDataPoints.push("revenue");
  }
  return newDataPoints;
};

let chartOption = {
  animationDuration: 800,
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "line",
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
    },
  ],
  series: [],
};

let seriesProps = {
  name: "",
  type: "line",
  symbolSize: 7,
  data: [],
  emphasis: { focus: "series" },
  lineStyle: {},
};

let LEGEND = ["impressions", "clicks"];

const LineChart = (props) => {
  const { userRole, permissions, statistics } = props;
  const [show, setShow] = useState(false);
  const [chartData, setChartData] = useState();
  const [availableDataPoints, setAvailableDataPoints] = useState([
    "impressions",
    "clicks",
    "ctr",
    "cr",
  ]);

  useEffect(() => {
    const preparedData = prepChartData(statistics.slice().reverse()); // prep chart data from response received at API
    setChartData(preparedData);
    const newDataPoints = [
      ...availableDataPoints,
      ...checkPermissions(userRole, permissions),
    ];
    function keepUnique(value, index, self) {
      return self.indexOf(value) === index;
    }
    var unique = newDataPoints.filter(keepUnique);
    setAvailableDataPoints(unique);
    return () => {
      setShow(false);
    };
  }, [statistics]);

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
      chartOption.xAxis.data = chartData.dates;

      //series
      chartOption.series = availableDataPoints.map((item, idx) => {
        let series = { ...seriesProps };
        series.name = item;
        series.data = chartData[item];
        if (idx < 2) {
          series.yAxisIndex = idx;
          chartOption.yAxis[idx].name = localization.dashboard.chart[item];
        }
        return series;
      });
      setShow(true);
    }
  }, [chartData]);

  useEffect(() => {
    // component will unmount
    return () => {
      LEGEND = ["impressions", "clicks"];
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
        <div style={{ padding: "1rem", paddingTop: 0 }}>
          <Line
            chartData={chartData}
            chartOption={chartOption}
            legend={LEGEND}
            yAxis={localization.dashboard.chart}
            csvHandler={csvHandler}
            // theme="dark"
          />
        </div>
      )}
    </div>
  );
};

export default memo(LineChart);
