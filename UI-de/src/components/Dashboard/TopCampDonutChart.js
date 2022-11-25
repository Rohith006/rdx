import React from "react";
import ReactECharts from "echarts-for-react";
import millify from "millify";

const series1 = "#A3D57C";
const series2 = "#A6E5F5";
const series3 = "#E7837B";
const series4 = "#EDA7C2";
const series5 = "#F7DB80";
const DEFAULT_DONAT_COLORS = [series1, series2, series3, series4, series5];
const DEFAULT_PAYOUT_VALUE = 0;

class TopCampDonutChart extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      series: [DEFAULT_PAYOUT_VALUE],
      option: {
        tooltip: {
          trigger: "item",
        },
        legend: {
          orient: "vertical",
          left: "37.5%",
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
    let { topCampaigns, field } = this.props;
    if ( topCampaigns && topCampaigns.length && topCampaigns !== prevProps.topCampaigns) {
      topCampaigns = topCampaigns
        .sort((a, b) => (a[field] >= b[field] ? -1 : 1))
        .splice(0, 5);
      const series = topCampaigns
        .filter((item) => item.profit > 0)
        .map((c) => c[field]);
      const data = topCampaigns.map((item) => ({
        name: `(${item.id}) ${item.name}`,
        value: item.profit,
      }));
      if (series.length) {
        this.setState({
          option: {
            series: [{ ...this.state.option.series[0], data: data }],
          },
          series,
        });
      }
    }
  }

  render() {
    return (
      <div id="chart" style={{ position: "relative" }}>
        <ReactECharts option={this.state.option} style={{ height: "250px" }} />
        <h5 className="top_donutTitle">Campaigns</h5>
        <div className="top_donutAmount">
          <h5 style={{ marginBottom: 10 }}>Spend</h5>
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

export default TopCampDonutChart;
