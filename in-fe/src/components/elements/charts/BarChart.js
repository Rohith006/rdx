import {
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Bar,
} from "recharts";
import React, { useEffect, useState } from "react";
import { request } from "../../../remote_api/uql_api_endpoint";
import CenteredCircularProgress from "../progress/CenteredCircularProgress";
import "./Chart.css";
import PropTypes from "prop-types";
import NoDataError from "../../errors/NoDataError";
import ReactECharts from "echarts-for-react";
import { data } from "../../../UI/LineChart/data";

// todo onLoadRequest is a misleading name - it is an object with information on endpoint to call
// todo this needs to be refactored.
export default function BarChartElement({
  onLoadRequest: endpoint,
  columns,
  refreshInterval,
}) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [ready, setReady] = React.useState(false);
  const [options, setOptions] = React.useState({});

  const [allowLoadingSpinner, setAllowLoadingSpinner] = useState(true);

  useEffect(() => {
    let isSubscribed = true;
    if (isSubscribed === true && allowLoadingSpinner) {
      setLoading(true);
    }
    request(
      endpoint,
      (value) => {
        if (isSubscribed === true && allowLoadingSpinner) setLoading(value);
      },
      (value) => {
        if (isSubscribed === true) setError(value);
      },
      (value) => {
        if (isSubscribed === true) {
          setReady(value);
          setOptions({
            color: {
              0: "#91cc75",
              1: "#5470c6",
              2: "#fac858",
              3: "#ee6666",
              4: "#73c0de",
              5: "#3ba272",
              6: "#fc8452",
              7: "#9a60b4",
              8: "#ea7ccc",
            },
            tooltip: {
              trigger: "axis",
              axisPointer: {
                type: "cross",
                crossStyle: {
                  color: "#999",
                },
              },
            },
            toolbox: {
              feature: {
                dataView: { show: true, readOnly: false },
                magicType: { show: true, type: ["line", "bar"] },
                restore: { show: true },
                saveAsImage: { show: true },
              },
            },
            legend: {
              data: ["Events"],
            },
            xAxis: [
              {
                type: "category",
                data: value?.data?.result.map((item) => item.date),
                axisPointer: {
                  type: "shadow",
                },
              },
            ],
            yAxis: [
              {
                type: "value",
                name: "Event",
                min: 0,
                // interval: convertIntervalToNumber(value?.data?.result),
                axisLabel: {
                  formatter: `{value}`,
                },
              },
            ],
            series: [
              {
                name: "Events",
                type: "bar",
                tooltip: {
                  valueFormatter: function (value) {
                    return value;
                  },
                },
                data: value?.data?.result.map((item) => item.count),
              },
            ],
          });
        }
        setAllowLoadingSpinner(false);
      }
    );
    return () => (isSubscribed = false);
  }, [endpoint]);

  useEffect(() => {
    let timer;
    let isSubscribed = true;
    if (refreshInterval > 0) {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(() => {
        request(
          endpoint,
          () => {},
          (value) => {
            if (isSubscribed === true) setError(value);
          },
          (value) => {
            if (isSubscribed === true) setReady(value);
          }
        );
      }, refreshInterval * 1000);
    } else {
      if (timer) {
        clearInterval(timer);
      }
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
      isSubscribed = false;
    };
  }, [refreshInterval, endpoint]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="ChartToolTip">
          <p>{`Start time : ${label}`}</p>
          <p>{`Time span : ${payload[0].payload.interval}`}</p>
          <p>{`Value : ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      {loading === true && <CenteredCircularProgress />}
      {error !== false && loading === false && (
        <NoDataError msg="Data is unavailable" />
      )}
      {ready !== false && loading === false && (
        <ReactECharts option={options && options} />
        // <ResponsiveContainer>
        //   <BarChart
        //     data={ready.data.result}
        //     margin={{ top: 15, right: 20, bottom: 5, left: 0 }}
        //   >
        //     <CartesianGrid strokeDasharray="3 3" />
        //     <Tooltip isAnimationActive={false} content={<CustomTooltip />} />
        //     {columns.map((column, index) => {
        //       return (
        //         <Bar
        //           key={index}
        //           stackId={column.stackId ? column.stackId : "stack"}
        //           dataKey={column.label}
        //           fill={column.color ? column.color : "#ffa000"}
        //         />
        //       );
        //     })}

        //     <XAxis dataKey="date" style={{ fontSize: "80%" }} />
        //     <YAxis style={{ fontSize: "90%" }} />
        //   </BarChart>
        // </ResponsiveContainer>
      )}
    </div>
  );
}

BarChartElement.propTypes = {
  columns: PropTypes.array,
  onLoadRequest: PropTypes.object,
};
