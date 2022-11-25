import React, { PureComponent } from "react";
import Flag from "flags-react";
import ReactECharts from "echarts-for-react";
import { registerMap } from "echarts";
import geoJson from "./map.json";

const data2 = [
  { name: "MX", value: 32787 },
  { name: "US", value: 121 },
  { name: "BR", value: 34131 },
  { name: "RU", value: 3112 },
  { name: "SA", value: 323 },
  { name: "IN", value: 65454 },
  { name: "CA", value: 890 },
  { name: "TR", value: 103 },
];

const tooltip = {
  backgroundColor: "rgba(255,255,255, 1)",
  textStyle: {
    fontStyle: "normal",
    fontWeight: "bold",
    fontFamily: "Montserrat",
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
      return `${params.data.name}: ${params.data.value}`;
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
            roam: false,
            map: map,
            selectedMode: false,
            emphasis: emphasis,
            data: data2,
            aspectScale: "0.8",
            itemStyle: itemStyle,
            nameProperty: "iso_a2",
          },
        ],
      },
    };
  }

  render() {
    const { option } = this.state;
    return (
      <div className="card">
        <div className="card-header">Geography: Top 10 Countries</div>
        <ReactECharts
          style={{ height: "540px", width: "100%" }}
          option={option}
          lazyUpdate={true}
          opts={{ renderer: "svg" }}
        />
        <div className="Top5Container">
          <div>
            <h3 className="geoHeading">Top countries by events</h3>
          </div>
          <div className="card_text flex items-center">
            {data2.length > 0 &&
              data2.slice(0, 5).map((item) => (
                <span className="flag-circle flex items-center">
                  <Flag className="flag-icon" iso={item.name} />
                  <div className="circle"></div>
                  <span className="topCountriesText">
                    {item.name} - {item.value}
                  </span>
                </span>
              ))}
          </div>
        </div>
      </div>
    );
  }
}

export default GeoChart;
