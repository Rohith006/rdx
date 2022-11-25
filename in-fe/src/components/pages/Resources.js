import React, { useCallback, useEffect, useState } from "react";
import ResourceDetails from "../elements/details/ResourceDetails";
import SquareCard from "../elements/lists/cards/SquareCard";
import CardBrowser from "../elements/lists/CardBrowser";
import ResourceForm from "../elements/forms/ResourceForm";
import { AiOutlineCloudServer } from "react-icons/ai";
import FlowNodeIcons from "../flow/FlowNodeIcons";
import BrowserRow from "../elements/lists/rows/BrowserRow";
import Add from "../../assets/images/icons/plus-solid.svg";
import { useHistory } from "react-router";
import AdvancedSquareCard from "../elements/lists/cards/AdvancedSquareCard";
import AgGrid from "../../UI/AgGrid/AgGrid";
import { CONNECTOR_COLUMN_DEFS } from "../../utils/ColumnDefs/ConnectorDef";
import { useConfirm } from "material-ui-confirm";
import { asyncRemote } from "../../remote_api/entrypoint";
import { groupDataExtract } from "../../utils/GroupDataExtract";

export default function Resources() {
  const history = useHistory();
  const confirm = useConfirm();
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {}, [refresh]);

  const triggerRefresh = () => {
    setRefresh(refresh + 1);
  };

  const handleResourceDelete = (resource) => {
    confirm({
      title: `Do you want to delete connector ${resource.name}?`,
      description: "This action can not be undone.",
    }).then(async () => {
      try {
        await asyncRemote({
          url: "/resource/" + resource.id,
          method: "delete",
        });
        triggerRefresh();
      } catch (e) {
        console.error(e);
      }
    });
  };

  const urlFunc = useCallback(
    (query) => "/resources/by_type" + (query ? "?query=" + query : ""),
    []
  );

  // const addFunc = useCallback((close) => <ResourceForm onClose={close} />, []);
  const addFunc = () => {
    history.push("/setup/connector/create");
  };
  // const detailsFunc = useCallback(
  //   (id, close) => <ResourceDetails id={id} onDeleteComplete={close} />,
  //   []
  // );
  const detailsFunc = (id) => {
    history.push("/setup/connector/view/" + id);
  };

  const sourceCards = (data, onClick) => {
    return (
      <div className="flex flex-col gap-2 w-max">
        <div className="flex justify-center flex-wrap gap-4">
          {groupDataExtract(data).map((row, subIndex) => {
            return (
              <AdvancedSquareCard
                key={subIndex}
                id={row?.id}
                icon={
                  <FlowNodeIcons
                    icon={row?.icon}
                    size={45}
                    defaultIcon="resource"
                  />
                }
                status={row?.enabled}
                name={row?.name}
                timestamp={row?.timestamp}
                description={row?.description}
                onClick={() => onClick(row?.id)}
                typeOf="Connector"
                type={row?.type}
                category={row?.category ? row?.category : "All"}
                tags={row?.tags}
                onDelete={() => handleResourceDelete(row)}
              />
            );
          })}
        </div>
      </div>
    );
  };

  const sourceRows = (data, onClick) => {
    return (
      <AgGrid
        to="connector/view/"
        columnDefs={CONNECTOR_COLUMN_DEFS}
        rowData={groupDataExtract(data)}
        onDelete={(id) => handleResourceDelete(id)}
      />
    );
  };

  return (
    <>
      <div className="mb-4 text-base">
        <span className="text-neutral-text">Setup / </span>
        <span className="top-text">Connectors </span>
      </div>
      <CardBrowser
        label="Connector"
        urlFunc={urlFunc}
        cardFunc={sourceCards}
        rowFunc={sourceRows}
        buttomLabel="ADD"
        buttonIcon={
          <AiOutlineCloudServer size={20} style={{ marginRight: 10 }} />
        }
        drawerDetailsTitle="Resource details"
        drawerDetailsWidth={800}
        detailsFunc={detailsFunc}
        drawerAddTitle="New resource"
        drawerAddWidth={800}
        push={addFunc}
        className="flex justify-center flex-wrap gap-8"
        icon={Add}
      />
    </>
  );
}
