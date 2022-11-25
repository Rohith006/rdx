import React, { useEffect, useState } from "react";
import { asyncRemote, getError } from "../../../remote_api/entrypoint";
import "./InsightsProRunningServicesList.css";
import CenteredCircularProgress from "../progress/CenteredCircularProgress";
import RunningServiceCard from "../cards/RunningServiceCard";
import ErrorsBox from "../../errors/ErrorsBox";

const InsightsProRunningServicesList = ({ onEditClick, refresh }) => {
  const [services, setServices] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (services === null) {
      setLoading(true);
    }
    asyncRemote({
      url: "/Tracardi-pro/services",
      method: "GET",
    })
      .then((response) => {
        setServices(response.data);
      })
      .catch((e) => {
        setError(getError(e));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [refresh, services]);

  const handleServiceEditClick = (service) => {
    if (onEditClick) {
      onEditClick(service);
    }
  };

  const handleDelete = async () => {
    try {
      // Load again services
      const newResposne = await asyncRemote({
        url: "/Tracardi-pro/services",
        method: "GET",
      });
      setServices(newResposne.data);
    } catch (e) {
      alert("Could not refresh services");
    }
  };

  return (
    <div className="InsightsProAddedServicesList">
      {loading && <CenteredCircularProgress />}
      {error && <ErrorsBox errorList={error} />}
      {Array.isArray(services) &&
        services.map((service, key) => {
          return (
            <RunningServiceCard
              key={key}
              service={service}
              onEditClick={handleServiceEditClick}
              onDelete={handleDelete}
            />
          );
        })}
    </div>
  );
};

export default InsightsProRunningServicesList;
