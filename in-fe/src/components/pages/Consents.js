import React, { useCallback } from "react";
import "../elements/lists/CardBrowser.scss";
import CardBrowser from "../elements/lists/CardBrowser";
import SquareCard from "../elements/lists/cards/SquareCard";
import { VscLaw } from "react-icons/vsc";
import ConsentDetails from "../elements/details/ConsentDetails";
import ConsentForm from "../elements/forms/ConsentForm";
import Add from "../../assets/images/icons/plus-solid.svg";
import AgGrid from "../../UI/AgGrid/AgGrid";
import { CONSENT_COLUMN_DEFS } from "../../utils/ColumnDefs/ConsentColumnDefs";
import { groupDataExtract } from "../../utils/GroupDataExtract";
import { useHistory } from "react-router";

export default function Consents() {
  const history = useHistory();
  const urlFunc = useCallback(
    (query) => "/consents/type/by_tag" + (query ? "?query=" + query : ""),
    []
  );
  const addFunc = () => {
    history.push("/setup/consent/create");
  };
  const detailsFunc = (id) => {
    history.push("/setup/consent/view/" + id);
  };
  const flows = (data, onClick) => {
    return (
      <AgGrid
        to="consent/view/"
        columnDefs={CONSENT_COLUMN_DEFS}
        rowData={groupDataExtract(data)}
      />
    );
  };

  return (
    <>
      <div className="mb-4 text-base">
        <span className="text-neutral-text">Setup /</span>
        <span className="top-text"> Consents</span>
      </div>
      <CardBrowser
        label="Consent types"
        description="List of defined consent types. You may filter this list by consent name in the upper search box."
        urlFunc={urlFunc}
        cardFunc={flows}
        // buttomLabel="New consent type"
        buttomLabel="ADD"
        buttonIcon={<VscLaw size={20} style={{ marginRight: 10 }} />}
        drawerDetailsTitle="Consent type details"
        drawerDetailsWidth={900}
        detailsFunc={detailsFunc}
        drawerAddTitle="New consent type"
        drawerAddWidth={600}
        push={addFunc}
        className="flex flex-wrap gap-8"
        icon={Add}
      />
    </>
  );
}
