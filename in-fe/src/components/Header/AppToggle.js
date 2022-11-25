import React, { useRef, useEffect, useState } from "react";
import dots from "../../assets/images/icons/dots.svg";
import desk from "../../assets/images/icons/desk.svg";
import buy from "../../assets/images/icons/buy.svg";
import billing from "../../assets/images/icons/billing.svg";
import knowledge from "../../assets/images/icons/knowledge.svg";

function AppToggle() {
  const [show, setShow] = useState(false);
  const ref1 = useRef();

  useEffect(() => {
    const ifClickedOutside = (e) => {
      if (ref1.current && !ref1.current.contains(e.target)) {
        setShow(false);
      }
    };
    document.addEventListener("click", ifClickedOutside);
    return () => {
      document.removeEventListener("click", ifClickedOutside);
    };
  }, [ref1]);

  const triggerDropdown = () => {
    setShow(!show);
  };

  const redirect = (url) => {
    window.open(url, "_blank");
  };
  return (
    <div ref={ref1} onClick={triggerDropdown} className="appToggle">
      <img className="appToggle_icon" src={dots} alt="Switch button" />
      <p className="appToggle_text">Switch to</p>
      {show && (
        <div className="appToggle_dropdown">
          <div className="appToggle_switch">
            <div className="appToggle_switch-title">Switch to</div>
            <div className="appToggle_switch-container">
              <div
                onClick={() => redirect(process.env.REACT_APP_BUY_URL)}
                className="appToggle_switch-content"
              >
                <img src={buy} alt="buy logo" />
                <span>ReBid Buy</span>
              </div>
              <div
                onClick={() => redirect(process.env.REACT_APP_DESK_URL)}
                className="appToggle_switch-content"
              >
                <img src={desk} alt="desk logo" />
                <span>ReBid Desk</span>
              </div>
            </div>
          </div>
          <div className="appToggle_more">
            <div className="appToggle_more-title">More</div>
            <div className="appToggle_more-container">
              <div
                onClick={() => redirect(process.env.REACT_APP_DIY_URL)}
                className="appToggle_more-content"
              >
                <img src={billing} alt="billing_logo" />
                <span>Billing & Subscription</span>
              </div>
              <div
                onClick={() => redirect(process.env.REACT_APP_KNOWLEDGE_URL)}
                className="appToggle_more-content"
              >
                <img src={knowledge} alt="knowledge_logo" />
                <span>Knowledge center</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppToggle;
