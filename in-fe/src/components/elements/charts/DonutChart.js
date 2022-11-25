import React, { useState } from "react";
import ReactECharts from "echarts-for-react";

const series1 = "#A3D57C";
const series2 = "#A6E5F5";
const series3 = "#E7837B";
const series4 = "#EDA7C2";
const series5 = "#F7DB80";
const DEFAULT_DONUT_COLORS = [series1, series2, series3, series4, series5];
const DEFAULT_VALUE = 0;

function DonutChart({ data }) {
  const [series] = useState(DEFAULT_VALUE);
  const [options] = useState({
    tooltip: {
      trigger: "item",
    },
    legend: {
      orient: "vertical",
      right: 0,
      top: "38%",
    },

    series: [
      {
        type: "pie",
        radius: ["20%", "70%"],
        avoidLabelOverlap: false,
        selectedMode: true,
        color: DEFAULT_DONUT_COLORS,
        label: {
          show: false,
        },
        data: data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.2)",
          },
        },
        right: "35%",
        left: 0,
      },
    ],
  });
  return (
    <div>
      <ReactECharts option={options} />
    </div>
  );
}

export default DonutChart;
