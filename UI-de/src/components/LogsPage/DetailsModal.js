import React, { Fragment, useEffect } from "react";
import ModalContainer from "../UI/modals/ModalContainer";
import localization from "../../localization";
import EventDetails from "./EventTypes";

export const ActivityDetailsModal = (props) => {
  const { isOpenModal, closeModal, activityDetails, eventType } = props;
  useEffect(() => {
    document.body.classList.toggle('overflow', isOpenModal);
  },[isOpenModal])
  return (
    <Fragment>
      <div className="overlay" />
      <ModalContainer
        isOpen={isOpenModal}
        onCloseModal={closeModal}
        modalTitle={localization.logs.table.activityDetails}
        bodyClassName={"logs_modal card"}
      >
        <EventDetails eventType={eventType} details={JSON.parse(activityDetails)} />
      </ModalContainer>
    </Fragment>
  );
};
