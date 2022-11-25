import React from "react";
import { quickLinks } from "../../utils/home";
import PlayIcon from "../../assets/images/icons/play.svg";
import DescriptionIcon from "../../assets/images/icons/description.svg";
import { useSelector } from "react-redux";

export const QuickLinksWidget = () => {
//   const dailyLimit = useSelector((state) => state.auth.subscription.dailyLimit);
const dailyLimit = 30;

  return (
    <div className="quicklinks-container">
      {quickLinks.map((item) => {
        return (
          <div key={item.id} className="quicklinks-items">
            <div className="quicklinks-items_left">
              <img src={item.icon} className="quicklinks-icons" />
              <div>
                <p className="quicklinks-title">{item.title}</p>
                <p className="quicklinks-description">{item.description}</p>
              </div>
            </div>
            <div className="quicklinks-items_right">
              {dailyLimit !== null ? (
                <a className="quicklinks-button" href={item.href}>
                  {item.name}
                </a>
              ) : (
                <a
                  className="quicklinks-button"
                  href={`https://dev-insights.rebid.co/segments/view`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Set daily limit first
                </a>
              )}
              <a href={item.url} target="_blank" rel="noreferrer">
                <img src={PlayIcon} alt="play button" />
              </a>
              <a href={item.url} target="_blank" rel="noreferrer">
                <img className="quicklinks-description_icon" src={DescriptionIcon} alt="play button" />
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
};
