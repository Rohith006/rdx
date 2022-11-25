import React, { useCallback } from "react";
import SquareCard from "../elements/lists/cards/SquareCard";
import CardBrowser from "../elements/lists/CardBrowser";
import { BsBoxArrowInRight } from "react-icons/bs";
import Add from "../../assets/images/icons/plus-solid.svg";
import { useHistory } from "react-router";
import AgGrid from "../../UI/AgGrid/AgGrid";
import { EVENT_COLUMN_DEFS } from "../../utils/ColumnDefs/EventColumn";
import { groupDataExtract } from "../../utils/GroupDataExtract";

export default function EventSources() {
  const history = useHistory();
  const urlFunc = useCallback(
    (query) => "/event-sources/by_type" + (query ? "?query=" + query : ""),
    []
  );
  const addFunc = () => {
    history.push("/setup/event/create");
  };
  const detailsFunc = (id) => {
    history.push("/setup/event/view/" + id);
  };

  const sources = (data, onClick) => {
    return (
      <AgGrid
        to="event/view/"
        columnDefs={EVENT_COLUMN_DEFS}
        rowData={groupDataExtract(data)}
      />
    );
  };

  return (
    <>
      <div className="mb-4 text-base">
        <span className="text-neutral-text">Setup /</span>
        <span className="top-text"> {"Events"}</span>
      </div>
      <CardBrowser
        label={"Events"}
        urlFunc={urlFunc}
        cardFunc={sources}
        buttomLabel="ADD"
        buttonIcon={<BsBoxArrowInRight size={20} style={{ marginRight: 10 }} />}
        drawerDetailsTitle={"Event details"}
        drawerDetailsWidth={800}
        detailsFunc={detailsFunc}
        drawerAddTitle={"Event details"}
        drawerAddWidth={800}
        className="flex flex-wrap gap-8"
        icon={Add}
        push={addFunc}
      />
    </>
  );
}
