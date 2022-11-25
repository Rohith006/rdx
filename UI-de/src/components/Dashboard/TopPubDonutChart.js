import React from "react";
import millify from "millify";
import ReactECharts from "echarts-for-react";

const series1 = "#A3D57C";
const series2 = "#A6E5F5";
const series3 = "#E7837B";
const series4 = "#EDA7C2";
const series5 = "#F7DB80";
const DEFAULT_DONAT_COLORS = [series1, series2, series3, series4, series5];
const DEFAULT_PAYOUT_VALUE = 0;

class TopPubDonutChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      series: [DEFAULT_PAYOUT_VALUE],
      option: {
        tooltip: {
          trigger: "item",
        },
        legend: {
          show: true,
          orient: "vertical",
          left: "38%",
          top: "20%",
        },

        series: [
          {
            type: "pie",
            radius: ["50%", "70%"],
            avoidLabelOverlap: false,
            selectedMode: true,
            color: DEFAULT_DONAT_COLORS,
            label: {
              show: false,
              formatter: (params) =>
                params.data &&
                `${params.data.name}: $${millify(params.data.value, {
                  precision: 2,
                  units: ["", "K", "M", "B", "T", "P", "E"],
                })}`,
            },
            data: [],
            right: "66.7%",
            left: 0,
          },
        ],
      },
    };
  }

  componentDidUpdate(prevProps) {
    let { topPublishers } = this.props;
    if (topPublishers && topPublishers.length && topPublishers !== prevProps.topPublishers ) {
      topPublishers = topPublishers.sort((a, b) =>
        a.profit >= b.profit ? -1 : 1
      );
      const series = topPublishers.map((c) => c.profit);
      const data = topPublishers.map((item) => ({
        name: item.name,
        value: item.profit,
      }));

      this.setState({
        option: {
          series: [{ ...this.state.option.series[0], data: data }],
        },
        series,
      });
    }
  }

  render() {
    return (
      <div id="chart" style={{ position: "relative" }}>
        <ReactECharts option={this.state.option} style={{ height: "250px" }} />
        <h5 className="top_donutTitle">Publishers</h5>
        <div className="top_donutAmount">
          <h5 style={{ marginBottom: 15 }}>Earning</h5>
          {this.state.series.map((item, index) => {
            return (
              <div key={index}>
                <ul>
                  <li className="donut-chart">
                    $
                    {millify(item, {
                      precision: 2,
                      units: ["", "K", "M", "B", "T", "P", "E"],
                    })}
                  </li>
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

export default TopPubDonutChart;
