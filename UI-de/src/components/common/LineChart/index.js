import React, { useEffect, useRef, useState, Fragment } from "react";
import ReactECharts from "echarts-for-react";
import { onLegendChange, onDownloadHandler, createCsv } from "./utils";
import download from "../../../../assets/images/icons/download-button.svg";
import "./scss/index.scss";

const Line = (props) => {
  const { chartData, chartOption, theme, legend, yAxis, csvHandler } = props;
  const chartRef = useRef(null);
  const [renderer, setRender] = useState("canvas");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // yAxis selection and name change
    legend.forEach((item, idx) => {
      let index;
      chartOption.series.forEach((singleSeries, i) => {
        if (singleSeries.name === item) {
          index = i;
        }
      });
      chartOption.series[index].yAxisIndex = idx;
      chartOption.yAxis[idx].name = yAxis[item];
    });

    // edge case if one or zero legend selected
    if (legend.length === 0) {
      chartOption.yAxis[0].name = "";
      chartOption.yAxis[1].name = "";
    } else if (legend.length === 1) {
      chartOption.yAxis[1].name = "";
    }

    // activate previously selected series
    Object.keys(chartOption.legend.selected).forEach((singleLegend) => {
      if (legend.includes(singleLegend)) {
        chartOption.legend.selected[singleLegend] = true;
      } else {
        chartOption.legend.selected[singleLegend] = false;
      }
    });

    // disabling animation for downloadiing
    chartOption.animation = false;
    chartRef.current.getEchartsInstance().setOption(chartOption, {
      replaceMerge: ["yAxis", "series", "xAxis"],
    });
    setTimeout(() => {
      // enabling animation
      chartOption.animation = true;
      chartRef.current.getEchartsInstance().setOption(chartOption);
    }, 200);
  }, [renderer]);

  return (
    <Fragment>
      <div className="line-chart_dropdown">
        <div className="line-chart_dropdown-shift-right">
          <div className="line-chart_dropdown-download-container">
            <span className="line-chart_dropdown-btn">
              <img className="line-chart_dropdown-img" src={download} />
            </span>
            <div className="line-chart_dropdown-content">
              <span
                onClick={() => {
                  onDownloadHandler(
                    "svg",
                    chartRef,
                    loading,
                    setLoading,
                    renderer,
                    setRender
                  );
                }}
              >
                Download SVG
              </span>
              <span
                onClick={() =>
                  onDownloadHandler(
                    "canvas",
                    chartRef,
                    loading,
                    setLoading,
                    renderer,
                    setRender
                  )
                }
              >
                Download PNG
              </span>
              <span onClick={() => csvHandler(legend, chartData, createCsv)}>
                Download CSV
              </span>
            </div>
          </div>
        </div>
      </div>
      <ReactECharts
        ref={chartRef}
        notMerge={true}
        option={chartOption}
        opts={{ renderer: renderer }}
        theme={theme ? theme : ""}
        onEvents={{
          legendselectchanged: (params) =>
            onLegendChange(params, chartRef, legend, yAxis, chartOption),
        }}
        onChartReady={() => {
          setLoading(false);
        }}
      />
    </Fragment>
  );
};

export default Line;
