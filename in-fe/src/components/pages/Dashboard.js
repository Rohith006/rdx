import React, { useEffect, useState } from "react";
import TuiPieChart from "../elements/charts/PieChart";
import { asyncRemote } from "../../remote_api/entrypoint";
import CenteredCircularProgress from "../elements/progress/CenteredCircularProgress";
import ProfileEventHeatMap from "../elements/details/ProfileEventHeatMap";
import TopBar from "../../UI/TopBar.js/TopBar";
import Summary from "../../UI/Summary/Summary";
import LineCharts from "../../UI/LineChart";
import GeoChart from "../../UI/GeoChart/GeoChart";

export default function Dashboard() {
  const [eventsByType, setEventsByType] = useState([]);
  const [eventsByTag, setEventsByTag] = useState([]);
  const [eventsBySource, setEventsBySource] = useState([]);
  const [loadingByType, setLoadingByType] = useState(false);
  const [loadingByTag, setLoadingByTag] = useState(false);
  const [loadingBySource, setLoadingBySource] = useState(false);

  useEffect(() => {
    setLoadingByType(true);
    asyncRemote({
      url: "events/by_type",
    })
      .then((resposne) => {
        if (resposne) {
          setEventsByType(resposne.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoadingByType(false);
      });
  }, []);

  useEffect(() => {
    setLoadingByTag(true);
    asyncRemote({
      url: "events/by_tag",
    })
      .then((resposne) => {
        if (resposne) {
          setEventsByTag(resposne.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoadingByTag(false);
      });
  }, []);

  useEffect(() => {
    setLoadingBySource(true);
    asyncRemote({
      url: "events/by_source",
    })
      .then((resposne) => {
        if (resposne) {
          setEventsBySource(resposne.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoadingBySource(false);
      });
  }, []);

  const PieChart = ({ loading, data, header, fill = "#444" }) => {
    return (
      <div className="card" id="pie_chart">
        {header && <header className="card-header">{header}</header>}
        <div className="card-body pie_chart-item">
          {!loading && <TuiPieChart data={data} fill={fill} />}
          {loading && <CenteredCircularProgress />}
        </div>
      </div>
    );
  };
  return (
    <div>
      <TopBar title="Dashboard" subtitle="Today" />
      <Summary />
      <LineCharts />
      <div className="pie_chart-container">
        <PieChart
          header="Events by type"
          loading={loadingByType}
          // data={eventsByType}
          data={[
            {
              name: "Signup",
              value: 1231,
            },
            {
              name: "Subscribed",
              value: 142,
            },
            {
              name: "other",
              value: 6,
            },
          ]}
        />
        <PieChart
          header="Events by tag"
          loading={loadingByTag}
          // data={eventsByTag}
          data={[
            {
              name: "ReBid Buy",
              value: 987,
            },
            {
              name: "ReBid desk",
              value: 756,
            },
            {
              name: "Organic search",
              value: 675,
            },
            {
              name: "Paid search",
              value: 432,
            },
          ]}
        />
        <PieChart
          header="Events by source"
          loading={loadingBySource}
          // data={eventsBySource}
          data={[
            {
              name: "ReBid Desk",
              value: 9874,
            },
            {
              name: "ReBid Buy",
              value: 25674,
            },
          ]}
        />
      </div>
      {/* <div>
        <ProfileEventHeatMap />
      </div> */}
      <GeoChart />
    </div>
  );
}
