import React, { useCallback } from "react";
import SquareCard from "../elements/lists/cards/SquareCard";
import CardBrowser from "../elements/lists/CardBrowser";
import { BsBoxArrowRight } from "react-icons/bs";
import DestinationForm from "../elements/forms/DestinationForm";
import DestinationDetails from "../elements/details/DestinationDetails";
import Add from "../../assets/images/icons/plus-solid.svg";
import AgGrid from "../../UI/AgGrid/AgGrid";
import { DESTINATION_COLUMN_DEFS } from "../../utils/ColumnDefs/DestinationColumnDefs";
import { useHistory } from "react-router";

export default function Destinations() {
  const history = useHistory();
  const urlFunc = useCallback(
    (query) => "/destinations/by_tag" + (query ? "?query=" + query : ""),
    []
  );
  const addFunc = () => {
    history.push("/setup/destination/create");
  };
  const detailsFunc = (id) => {
    history.push("/setup/destination/view/" + id);
  };

  const destinations = (data, onClick) => {
    const datum =
      data?.grouped &&
      Object.entries(data?.grouped).map(([category, plugs], index) => plugs);
    let arr = [];
    datum.map((item) => arr.push(...item));
    return (
      <AgGrid
        to="destination/view/"
        columnDefs={DESTINATION_COLUMN_DEFS}
        rowData={arr}
      />
    );
  };

  return (
    <>
      <div className="mb-4 text-base">
        <span className="text-neutral-text">Setup /</span>
        <span className="top-text"> Destination</span>
      </div>
      <CardBrowser
        label="Profile Destinations"
        urlFunc={urlFunc}
        cardFunc={destinations}
        buttomLabel="ADD"
        buttonIcon={<BsBoxArrowRight size={20} style={{ marginRight: 10 }} />}
        drawerDetailsTitle="Destination details"
        drawerDetailsWidth={800}
        detailsFunc={detailsFunc}
        drawerAddTitle="New Destination"
        drawerAddWidth={800}
        className="flex flex-wrap gap-8"
        icon={Add}
        push={addFunc}
      />
    </>
  );
}
