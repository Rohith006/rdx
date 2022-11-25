
import React, { Fragment } from "react";
import {
  RandomPlatormTip,
  getGreeting,
  widgets,
//   WidgetsManager,
} from "../../utils/home";
import Tips from "../../assets/images/icons/tips.svg";

function Home() {

  return (
    <div className= "home">
      <div className="home-container">
        <span className="home-greeting">{getGreeting()}, </span>
        <span className="home-username">Reddy</span>
      </div>
      <div className="home-tip_container">
        <img src={Tips} alt="Tips" />
        <RandomPlatormTip />
      </div>
      <div className="home-widgets">
        {widgets.map((item) => {
          return (
            <div
              key={item.key}
              className={`home-widgets_card ${item.widgetSize}`}
            >
              <div className="home-widgets_card-header">{item.widgetTitle}</div>
              <div className="home-widgets_card-body">
                {item.widgetComponent}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Home;
