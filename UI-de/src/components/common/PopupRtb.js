import React from "react";
import ModalContainer from "../UI/modals/ModalContainer";
import ReactJson from "react-json-view";
import rtbBanner from "../../constants/rtbBanner";
import copy from "copy-to-clipboard";
import localization from "../../localization/index";

export default (props) => {
  const { isOpenModal, onCloseModal, rtbVersion } = props;
  return rtbVersion ? (
    <div>
      <div className="overlay" />
      <ModalContainer
        isOpen={isOpenModal}
        onCloseModal={onCloseModal}
        modalTitle={`Example of RTB v.${rtbVersion}`}
        bodyClassName={"logs_modal card"}
      >
        <div className="modal-message">
          <div>
            <span>Request</span>
            <ReactJson
              src={rtbBanner[rtbVersion].request}
              enableClipboard={false}
              displayDataTypes={false}
              displayObjectSize={false}
            />
            <button
              onClick={() =>
                copy(JSON.stringify(rtbBanner[rtbVersion].request))
              }
              type="button"
              className="btn light-blue"
            >
              {localization.forms.copy}
            </button>
          </div>
          <div>
            <span>Response</span>
            <ReactJson
              src={rtbBanner[rtbVersion].response}
              enableClipboard={false}
              displayDataTypes={false}
              displayObjectSize={false}
            />
            <button
              onClick={() =>
                copy(JSON.stringify(rtbBanner[rtbVersion].response))
              }
              type="button"
              className="btn light-blue"
            >
              {localization.forms.copy}
            </button>
          </div>
        </div>
      </ModalContainer>
    </div>
  ) : null;
};
