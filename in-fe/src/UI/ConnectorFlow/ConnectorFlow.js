import React from "react";
import rebid from "../../assets/images/icons/rebid_connector.svg";
import js_event from "../../assets/images/icons/js_event.svg";
import api_event from "../../assets/images/icons/api_event.svg";
import no_type from "../../assets/images/icons/no_type.svg";
import Book from "../../assets/images/icons/Book.svg";
import external from "../../assets/images/icons/external-link.svg";
import FlowNodeIcons from "../../components/flow/FlowNodeIcons";

function ConnectorFlow({ displayType, type, resourceText }) {
  const curr = displayType === "event" ? type?.name : type;
  return (
    <div className="resource_container">
      <div className="connectorFlow_container">
        <div className="flex items-center">
          <div className="connectorFlow_img eventType">
            <img
              src={
                curr
                  ? curr.toLowerCase() === "javascript"
                    ? js_event
                    : api_event
                  : no_type
              }
              alt="js"
            />
          </div>

          <hr className="connectorFlow_horizontal left" />
          <img src={rebid} alt="rebid" />
          {/* {displayType !== "event" && ( */}
          <div className="connectorFlow_img eventType flex items-center">
            <hr className="connectorFlow_horizontal right" />
            {/* <FlowNodeIcons icon="flow" /> */}
            <img src={no_type} alt="no" />
          </div>
          {/* )} */}
        </div>
      </div>
      <div>
        <div className="flex helpful_container">
          <img src={Book} alt="book" />
          <span>Helpful resources</span>
        </div>
        {resourceText && (
          <div className="text_container">
            <div>{resourceText}</div>
            {curr && (
              <div className="flex items-center text_link">
                <span>{curr} documentation</span>
                <img className="text_img" src={external} alt="external" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ConnectorFlow;
