import React, { useCallback } from "react";
import SquareCard from "../elements/lists/cards/SquareCard";
import PluginForm from "../elements/forms/PluginForm";
import CardBrowser from "../elements/lists/CardBrowser";
import FlowNodeIcons from "../flow/FlowNodeIcons";
import BrowserRow from "../elements/lists/rows/BrowserRow";

export default function ActionPlugins() {
  const urlFunc = useCallback(
    (query) => "/flow/action/plugins" + (query ? "?query=" + query : ""),
    []
  );
  const detailsFunc = useCallback((id) => <PluginForm id={id} />, []);

  const pluginsCards = (data, onClick) => {
    return Object.entries(data?.grouped).map(([category, plugs], index) => {
      return (
        <div className="flex flex-col gap-2 w-max flex-wrap" key={index}>
          <header className="px-3 py-1 text-lg capitalize border-b border-ternary-border">
            {category}
          </header>
          <div className="flex gap-4 flex-wrap">
            {plugs.map((row, subIndex) => {
              return (
                <SquareCard
                  key={index + "-" + subIndex}
                  id={row?.id}
                  icon={
                    <FlowNodeIcons
                      icon={row?.plugin?.metadata?.icon}
                      size={35}
                    />
                  }
                  status={row?.settings?.enabled}
                  name={row?.plugin?.metadata?.name}
                  description={
                    row?.plugin?.metadata?.name === "Google Spreadsheet" &&
                    subIndex === 10
                      ? "This plugin connects Insights to Google Sheets."
                      : row?.plugin?.metadata?.desc
                  }
                  onClick={() => onClick(row?.id)}
                />
              );
            })}
          </div>
        </div>
      );
    });
  };

  const pluginsRows = (data, onClick) => {
    return Object.entries(data?.grouped).map(([category, plugs], index) => {
      return (
        <div className="mt-6 w-full" key={index}>
          <header className="text-lg font-semibold">{category}</header>
          <div>
            {plugs.map((row, subIndex) => {
              const data = {
                icon: row?.plugin?.metadata?.icon,
                enabled: row?.settings?.enabled,
                name: row?.plugin?.metadata?.name,
                description:
                  row?.plugin?.metadata?.name === "Google Spreadsheet" &&
                  subIndex === 10
                    ? "This plugin connects Insights to Google Sheets."
                    : row?.plugin?.metadata?.desc,
              };
              return (
                <BrowserRow
                  key={index + "-" + subIndex}
                  id={row?.id}
                  data={data}
                  onClick={() => onClick(row?.id)}
                />
              );
            })}
          </div>
        </div>
      );
    });
  };

  return (
    <>
      <div className="mb-4 text-base">
        <span className="text-neutral-text">Settings /</span>
        <span className="top-text"> Workflow plugins</span>
      </div>
      <CardBrowser
        label="Workflow plugins"
        urlFunc={urlFunc}
        cardFunc={pluginsCards}
        rowFunc={pluginsRows}
        defaultLayout="cards"
        drawerDetailsTitle="Edit Plugin Action"
        drawerDetailsWidth={800}
        detailsFunc={detailsFunc}
        className="flex flex-wrap gap-8"
      />
    </>
  );
}
