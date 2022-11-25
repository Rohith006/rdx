import React, { useCallback } from "react";
import "../elements/lists/CardBrowser.scss";
import CardBrowser from "../elements/lists/CardBrowser";
import SquareCard from "../elements/lists/cards/SquareCard";
import EventValidationForm from "../elements/forms/EventValidationForm";
import { BsFolderCheck } from "react-icons/bs";
import EventValidationDetails from "../elements/details/EventValidationDetails";
import Add from "../../assets/images/icons/plus-solid.svg";
import AgGrid from "../../UI/AgGrid/AgGrid";
import { VALIDATION_COLUMN_DEFS } from "../../utils/ColumnDefs/ValidationColumnDefs";
import { groupDataExtract } from "../../utils/GroupDataExtract";
import { useHistory } from "react-router";

export default function EventValidation() {
  const history = useHistory();
  const urlFunc = useCallback(
    (query) =>
      "/event/validation-schemas/by_tag" + (query ? "?query=" + query : ""),
    []
  );
  const addFunc = () => {
    history.push("/setup/validation/create");
  };
  const detailsFunc = (id) => {
    history.push("/setup/validation/view/" + id);
  };

  const flows = (data, onClick) => {
    return (
      <AgGrid
        to="validation/view/"
        columnDefs={VALIDATION_COLUMN_DEFS}
        rowData={groupDataExtract(data)}
      />
    );
  };

  return (
    <>
      <div className="mb-4 text-base">
        <span className="text-neutral-text">Setup /</span>
        <span className="top-text"> Validation</span>
      </div>
      <CardBrowser
        label="Event data validation"
        description="List of validations. You may filter this list by validation schema name in the upper search box."
        urlFunc={urlFunc}
        cardFunc={flows}
        buttomLabel="ADD"
        buttonIcon={<BsFolderCheck size={20} style={{ marginRight: 10 }} />}
        drawerDetailsTitle="Validation schema details"
        drawerDetailsWidth={900}
        detailsFunc={detailsFunc}
        drawerAddTitle="New validation schema"
        drawerAddWidth={600}
        push={addFunc}
        className="flex flex-wrap gap-8"
        icon={Add}
      />
    </>
  );
}
