import React, { useState, useEffect } from "react";
import OnboardingIcon from "../../assets/images/icons/onboarding-widget.svg";
import HelpcenterIcon from "../../assets/images/icons/helpcenter.svg";
import KnowledgeBaseIcon from "../../assets/images/icons/knowledge-base.svg";
import RightArrowIcon from "../../assets/images/icons/right-arrow.svg";
import { useDispatch, useSelector } from "react-redux";
import Onboarding from "./homeWidgets/Onboarding";
import OnboardingModal from "./homeWidgets/OnboardingModal";


const GettingStartedWidget = () => {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const dispatch = useDispatch()

  
  const closeModal = () => {
    setIsOpenModal(false);
  };

  const GettingStartedOption = [
    {
      title: "On boarding",
      icon: OnboardingIcon,
      id: "1",
      alt: "On boarding",
      onClick: () => setIsOpenModal(true),
    },
    {
      title: "Help center",
      icon: HelpcenterIcon,
      id: "2",
      alt: "Help center",
      onClick: () => document.querySelector(".help-button").click(),
    },
    {
      title: "Knowledge base",
      icon: KnowledgeBaseIcon,
      id: "3",
      alt: "Knowledge base",
      onClick: () => {
        window.open(
          "https://support.rebid.co/portal/en/kb/rebid-desk-help-centre",
          "_blank"
        );
      },
    },
  ];

  return (
    <div className="onboarding">
      {GettingStartedOption.map((widget) => {
        return (
          <div
            className="onboarding-items"
            onClick={widget.onClick}
            key={widget.id}
          >
            <img src={widget.icon} alt={widget.alt} />
            <p className="onboarding-text">{widget.title}</p>
            <img src={RightArrowIcon} alt="Right arrow" />
          </div>
        );
      })}
      {isOpenModal && <div className="overlay" />}
      <OnboardingModal
        isOpen={isOpenModal}
        onCloseModal={closeModal}
        bodyClassName={"logs_modal"}
      >
        <Onboarding />
      </OnboardingModal>
    </div>
  );
};

export default GettingStartedWidget;
