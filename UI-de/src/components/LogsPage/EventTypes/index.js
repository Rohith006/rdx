import React, { Fragment } from "react";
import UserLogin from "./UserLogin";
import New from "./New";
import Edit from "./Edit";
import Activation from "./Activation";
import Delete from "./Delete";
import CampaignNew from "./CampaignNew"

export default function EventDetails(props) {
  const { eventType, details } = props;
  const renderSwitch = (event) => {
    switch (event) {
      case "User login":
        return <UserLogin details={details} eventType={event} />;
      case "Advertiser new":
      case "Publisher new":
      case "Admin new":
      case "Manager new":
        return <New details={details} eventType={event} />;
      case "Advertiser edit":
      case "Publisher edit":
      case "Admin edit":
      case "Campaign edit":
      case "Manager edit":
        return <Edit details={details} eventType={event} />;
      case "Advertiser activation":
      case "Publisher activation":
      case "Campaign activation":
      case "Advertiser pause":
      case "Publisher pause":
      case "Campaign pause":
      case "Advertiser delete":
      case "Publisher delete":
      case "Admin removed":
        return <Activation details={details} eventType={event} />;
      case "Campaign new":
        return <CampaignNew details={details} eventType={event} />;
      case "Campaign delete":
        return <Delete details={details} eventType={event} />;
      default:
        return;
    }
  };
  return <Fragment>{renderSwitch(eventType)}</Fragment>;
}
