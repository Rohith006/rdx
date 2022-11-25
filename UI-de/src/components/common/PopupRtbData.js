import React from "react";
import ModalContainer from "../UI/modals/ModalContainer";
import JSONPretty from "react-json-pretty";
import copy from "copy-to-clipboard";
import localization from "../../localization/index";

export default (props) => {
  const {
    isOpenModal,
    onCloseModal,
    entity,
    entityId,
    rtbData,
    refreshBidreqFormat,
    pending,
    auth,
  } = props;
  return entityId ? (
    <div>
      <div className="overlay" />
      <ModalContainer
        entity={entity}
        entityId={entityId}
        isOpen={isOpenModal}
        onCloseModal={onCloseModal}
        modalTitle={`${entity} ${entityId}`}
        bodyClassName={"logs_modal card"}
        refreshBidreqFormat={refreshBidreqFormat}
        pending={pending}
        auth={auth}
      >
        <div className="modal-message" style={{ padding: "15px 20px" }}>
          <div>
            <span>Request</span>
            <JSONPretty
              id="json-pretty"
              style={{ fontFamily: "Rubik, sans-serif", fontSize: "0.8em" }}
              data={rtbData.bidrequest || {}}
            />
            {rtbData.bidrequest && (
              <button
                onClick={() => copy(JSON.stringify(rtbData.bidrequest || {}))}
                type="button"
                className="btn light-blue"
              >
                {localization.forms.copy}
              </button>
            )}
          </div>
          <div>
            <span>Response</span>
            <JSONPretty
              id="json-pretty"
              style={{ fontFamily: "Rubik, sans-serif", fontSize: "0.8em" }}
              data={rtbData.bidresponse || {}}
            />
            {rtbData.bidresponse && (
              <button
                onClick={() => copy(JSON.stringify(rtbData.bidresponse || {}))}
                type="button"
                className="btn light-blue"
              >
                {localization.forms.copy}
              </button>
            )}
          </div>
        </div>
      </ModalContainer>
    </div>
  ) : null;
};
