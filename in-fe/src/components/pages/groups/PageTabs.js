import React, { useState } from "react";
import Tabs, { TabCase } from "../../elements/tabs/Tabs";
import "./PageTabs.css";
import NeedHelpButton from "../../elements/misc/NeedHelpButton";
import PrivateTab from "../../authentication/PrivateTab";

export default function PageTabs({ title, tabs = {} }) {
  const filteredTabs = tabs.filter(
    (tab) => tab instanceof PrivateTab && tab.isAuth()
  );

  const [tab, setTab] = useState(0);
  let i = -1;

  return (
    <div className="PageTabs" style={{ height: "initial" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 className="Title">{title}</h1>
        {/* <NeedHelpButton /> */}
      </div>

      <Tabs
        className="TabNav"
        tabs={filteredTabs.map((tab) => tab.label)}
        defaultTab={tab}
        onTabSelect={setTab}
        tabStyle={{ flex: "initial" }}
        tabContentStyle={{ overflow: "initial" }}
        tabsStyle={{
          paddingLeft: 24,
          backgroundColor: "#fff",
        }}
      >
        {filteredTabs.map((tab, key) => {
          i = i + 1;
          return (
            <TabCase id={i} key={key}>
              <div style={{ paddingTop: 10, backgroundColor: "white" }}>
                {tab.component}
              </div>
            </TabCase>
          );
        })}
      </Tabs>
    </div>
  );
}
