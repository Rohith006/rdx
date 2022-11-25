import React, { useEffect, useState } from "react";
import localization from "../../../localization";
import {
  Accordion,
  AccordionItem,
  AccordionItemButton,
  AccordionItemHeading,
} from "react-accessible-accordion";
import InventoryItem from "./InventoryItem";

export default function MyInventories(props) {
  const {
    removeSelectedItem,
    inventoriesList,
    onInventoryPayoutChange,
    userRole,
  } = props;

  const [list, setList] = useState([]);

  useEffect(() => {
    setList(inventoriesList.filter((el) => el && el.checked));
  }, [inventoriesList]);

  return (
    <div
      className="card_body-inventory"
      style={{ width: "48%", marginTop: "5.8rem" }}
    >
      <div className="inventory">
        <h3 className="subheading" style={{ marginTop: 0 }}>
          {localization.createCampaignForm.inventoryControl.labels.myInvent}
        </h3>
        <Accordion allowMultipleExpanded={false} allowZeroExpanded>
          {list.map((inventory, index) => {
            return (
              <AccordionItem
                style={{ marginTop: "19px" }}
                uuid={index}
                key={index}
              >
                <div
                  className="close"
                  onClick={() => removeSelectedItem(inventory.id)}
                />
                <AccordionItemHeading>
                  <AccordionItemButton>
                    <span className="arrow" />
                    <span className="title">
                      ({inventory.id}) {inventory.name}
                    </span>
                  </AccordionItemButton>
                </AccordionItemHeading>
                <InventoryItem
                  inventory={inventory}
                  onInventoryPayoutChange={onInventoryPayoutChange}
                  userRole={userRole}
                />
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
}
