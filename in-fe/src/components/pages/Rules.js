import React, { useCallback } from "react";
import SquareCard from "../elements/lists/cards/SquareCard";
import CardBrowser from "../elements/lists/CardBrowser";
import { FaUncharted } from "react-icons/fa";
import RuleForm from "../elements/forms/RuleForm";
import RuleDetails from "../elements/details/RuleDetails";
import BrowserRow from "../elements/lists/rows/BrowserRow";
import Add from "../../assets/images/icons/plus-solid.svg";

export default function Rules() {
  const urlFunc = useCallback(
    (query) => "/rules/by_tag" + (query ? "?query=" + query : ""),
    []
  );
  const addFunc = useCallback((close) => <RuleForm onEnd={close} />, []);
  const detailsFunc = useCallback(
    (id, close) => <RuleDetails id={id} onDelete={close} onEdit={close} />,
    []
  );

  const ruleCards = (data, onClick) => {
    return (
      data?.grouped &&
      Object.entries(data?.grouped).map(([category, plugs], index) => {
        return (
          <div className="flex flex-col gap-2 w-max" key={index}>
            <header className="px-3 py-1 text-lg capitalize border-b border-ternary-border">
              {category}
            </header>
            <div className="flex gap-4">
              {plugs.map((row, subIndex) => {
                return (
                  <SquareCard
                    key={index + "-" + subIndex}
                    id={row?.id}
                    icon={<FaUncharted size={45} />}
                    status={row?.enabled}
                    name={row?.name}
                    description={row?.description}
                    onClick={() => onClick(row?.id)}
                  />
                );
              })}
            </div>
          </div>
        );
      })
    );
  };

  const ruleRows = (data, onClick) => {
    return (
      data?.grouped &&
      Object.entries(data?.grouped).map(([category, plugs], index) => {
        return (
          <div className="RowGroup" style={{ width: "100%" }} key={index}>
            <header>{category}</header>
            <div>
              {plugs.map((row, subIndex) => {
                return (
                  <BrowserRow
                    key={index + "-" + subIndex}
                    id={row?.id}
                    data={{ ...row, icon: "route" }}
                    onClick={() => onClick(row?.id)}
                  />
                );
              })}
            </div>
          </div>
        );
      })
    );
  };

  return (
    <>
      <div className="mb-4 text-base">
        <span className="text-neutral-text">Activate /</span>
        <span className="top-text"> Routing rules</span>
      </div>
      <CardBrowser
        label="Routing rules"
        urlFunc={urlFunc}
        cardFunc={ruleCards}
        rowFunc={ruleRows}
        buttomLabel="ADD"
        buttonIcon={<FaUncharted size={20} style={{ marginRight: 10 }} />}
        drawerDetailsTitle="Rule details"
        drawerDetailsWidth={800}
        detailsFunc={detailsFunc}
        drawerAddTitle="New routing rule"
        drawerAddWidth={800}
        addFunc={addFunc}
        className="flex flex-wrap gap-8"
        icon={Add}
      />
    </>
  );
}
