import React, { Fragment, PureComponent } from "react";
import localization from "../../../localization";
import Flag from "flags-react";
import ReactECharts from "echarts-for-react";
import { registerMap } from "echarts";
import geoJson from "./map.json";

const tooltip = {
  backgroundColor: "rgba(255,255,255, 1)",
  textStyle: {
    fontStyle: "normal",
    fontWeight: "normal",
    fontFamily: "Fira Sans",
    color: "rgb(109,110,113)",
    fontSize: 16,
    extraCssText: "letter-spacing: 3px",
  },
  trigger: "item",
  showDelay: 0,
  transitionDuration: 0.2,
  extraCssText: "box-shadow: rgb(174,174,174) 0px 0px 5px;border-radius:3px;",
  formatter: (params) => {
    if (params.data) {
      return `${params.data.name}: $${params.data.value}`;
    } else {
      return params.name;
    }
  },
};

const emphasis = {
  label: {
    show: false,
  },
  itemStyle: {
    // areaColor: "rgb(158,169,203)",
    areaColor: "none",
    borderColor: "#aaa69d",
  },
  borderColor: "rgb(153, 202, 234)",
  borderWidth: 1,
  borderType: "none",
};

const itemStyle = {
  borderColor: "#DFE0E1",
  borderWidth: 1,
  areaColor: "#F7F7F7",
};

const visualMap = {
  realtime: false,
  calculable: true,
  inRange: {
    color: ["#0076ff", "#14309a"],
  },
  show: false,
};

const map = "world";

class GeoChart extends PureComponent {
  constructor(props) {
    registerMap(map, geoJson);
    super(props);
    this.state = {
      countries: [],
      option: {
        tooltip: tooltip,
        visualMap: visualMap,
        series: [
          {
            name: "World",
            type: "map",
            roam: true,
            map: map,
            selectedMode: false,
            emphasis: emphasis,
            data: null,
            aspectScale: "1.1",
            itemStyle: itemStyle,
            nameProperty: "iso_a2",
          },
        ],
      },
    };
  }

  componentDidUpdate(prevProps) {
    const { topCountries, field } = this.props;

    if (topCountries !== prevProps.topCountries && topCountries.length) {
      const countries = [];
      topCountries.forEach((item) => {
        if (item[field] > 0) {
          countries.push({ name: item.geo, value: item[field].toFixed(2) });
        }
      });

      this.setState({
        countries: countries,
        option: {
          series: [{ ...this.state.option.series[0], data: countries }],
        },
      });
    }
  }

  render() {
    const { option } = this.state;
    return (
      <Fragment>
        <ReactECharts
          style={{ height: "540px", width: "100%" }}
          option={option}
          lazyUpdate={true}
        />
        <div className="Top5Container">
          <div>
            <h3
              className="subheading geoHeading"
              style={{ textAlign: "center", fontWeight: 500 }}
            >
              {localization.dashboard.top5countries}
            </h3>
          </div>
          <div className="card_text">
            {this.props.topCountries.length > 0 &&
              this.props.topCountries.slice(0, 5).map((item, index) => {
                return (
                  <div key={index}>
                    {item.geo !== "" && (
                      <li>
                        <Flag className="flag-icon" iso={item.geo} />
                        <span className="topCountriesText">
                          {item.geo} $
                          {(item.revenue && item.revenue.toFixed(2)) ||
                            (item.payout && item.payout.toFixed(2))}
                        </span>
                      </li>
                    )}{" "}
                  </div>
                );
              })}
          </div>
        </div>
      </Fragment>
    );
  }
}

export default GeoChart;
