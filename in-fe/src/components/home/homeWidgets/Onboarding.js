import React, { Fragment, useState, useEffect } from "react";
import { onboardingContent } from "../../../utils/home"
import CheckIcon from "../../../assets/images/icons/checkbox.svg";
import UncheckIcon from "../../../assets/images/icons/uncheckbox.svg";
import PlayIcon from "../../../assets/images/icons/play.svg";

const Onboarding = ({ auth, }) => {
  const [progress, setProgress] = useState(0);
  const counter = 100 / onboardingContent.length;

//   if (auth.subscription.dailyLimit !== null) onboardingContent[0].completed = true;

  useEffect(() => {
    setProgress(
      onboardingContent.filter((item) => {
        return item.completed === true;
      }).length
    );
  }, []);

  const  renderSwitch = (item) => {
        return (
          <a href={item.href} target="_blank" className="onboarding-url">
            {item.title}
          </a>
        );
  };

  return (
    <Fragment>
      <div className="onboarding_content-header">
        <p className="onboarding_content-header_heading">
          Welcome to ReBid Insights 🎉
        </p>
        <p className="onboarding_content-header_paragraph w-[450px] text-sm text-secondary-text">
          We are committed to making your every day work easier. Kickstart the
          transformation of your insights journey by completing the following
          steps.
        </p>
      </div>
      <div className="onboarding_content-body">
        <div className="onboarding_progress-bar">
          <span className="onboarding_progress-bar_complete">
            {progress * counter < 100 ? Math.floor(progress * counter) : 100}%
          </span>
          <div className="progress onboard">
            <div
              className="progress-bar"
              style={{ width: `${Math.floor(progress * counter)}%` }}
            />
          </div>
        </div>
        { onboardingContent.map((item) => {
          return (
            <div key={item.id} className="onboarding-steps">
              <div className="onboarding-steps_items">
                <img
                  className="onboarding-steps_icon"
                  src={item.completed ? CheckIcon : UncheckIcon}
                  alt={item.completed ? "checked" : "unchecked"}
                />
                {renderSwitch(item)}
              </div>
              {item.url && (
                <a href={item.url} target="_blank" rel="noreferrer">
                  <img src={PlayIcon} alt="play button" />
                </a>
              )}
            </div>
          );
        })}
      </div>
    </Fragment>
  );
};

export default Onboarding;