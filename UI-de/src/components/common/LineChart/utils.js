export const onLegendChange = (
  params,
  chartRef,
  legend,
  yAxis,
  chartOption
) => {
  if (chartRef && chartRef.current) {
    if (!legend.includes(params.name)) {
      if (legend.length >= 2) {
        legend.unshift(params.name);
        let lastItem = legend.at(-1);
        chartRef.current
          .getEchartsInstance()
          .dispatchAction({ type: "legendUnSelect", name: lastItem });
        legend.pop();
      } else {
        legend.unshift(params.name);
      }
    } else {
      let idx = legend.indexOf(params.name);
      legend.splice(idx, 1);
    }

    // setting new options
    let option = chartRef.current.getEchartsInstance().getOption();
    legend.forEach((item, idx) => {
      let index;
      option.series.forEach((singleSeries, i) => {
        if (singleSeries.name === item) {
          index = i;
        }
      });
      option.series[index].yAxisIndex = idx;
      option.yAxis[idx].name = yAxis[item];
    });

    // edge case to handle yAxis names if one or zero legend selected
    if (legend.length === 0) {
      option.yAxis[0].name = "";
      option.yAxis[1].name = "";
    } else if (legend.length === 1) {
      option.yAxis[1].name = "";
    }

    // finally setting the option
    chartRef.current.getEchartsInstance().setOption(option, {
      replaceMerge: ["yAxis"],
    });
    chartOption.yAxis = option.yAxis;
    chartOption.legend.selected = option.legend[0].selected;
  }
};

export const createCsv = (matrix) => {
  if (matrix.length) {
    let csvContent =
      "data:text/csv;charset=utf-8," +
      matrix.map((e) => e.join(",")).join("\n");
    var encodedUri = encodeURI(csvContent);
    window.open(encodedUri);
  }
};

export const downloadURI = (uri, fileName) => {
  var link = document.createElement("a");
  link.download = fileName;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const onDownloadHandler = (
  type,
  chartRef,
  loading,
  setLoading,
  renderer,
  setRender
) => {
  if (renderer !== type) {
    setLoading(true);
    setRender(type);
    new Promise((resolve, reject) => {
      if (!loading) {
        resolve();
      }
    }).then(() => {
      let uri = chartRef.current
        .getEchartsInstance()
        .getDataURL({ backgroundColor: "#fff", pixelRatio: 2 });
      downloadURI(uri, "line");
    });
  } else {
    let uri = chartRef.current
      .getEchartsInstance()
      .getDataURL({ backgroundColor: "#fff", pixelRatio: 2 });
    downloadURI(uri, "line");
  }
};
