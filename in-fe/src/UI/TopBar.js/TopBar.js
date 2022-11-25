import React, { useState } from "react";
import ToggleButton from "./ToggleButton";

function TopBar(props) {
  const [value, setValue] = useState(true);

  const handleToggle = (data) => {
    setValue(data);
  };

  return (
    <div className="topbar_container">
      <>
        <div className="topbar_leftbar ">
          <span className="topbar_title">{props.title}</span>
          {/* <span className="topbar_today">{props.subtitle}</span> */}
        </div>
        <div className="topbar_rightbar ">
          {/* <img src={Wallet} /> */}

          {/* <img src={Earning} /> */}

          <div className="topbar_info">
            <div className="topbar_info-item">
              {value ? (
                <div>
                  <span className="title">Events this month</span>
                  <span className="value">1167</span>
                </div>
              ) : (
                <div>
                  <span className="title">Events last month</span>
                  <span className="value">51436</span>
                </div>
              )}
              {/* {value ? (
                <div>
                  <span className="title">Earning</span>
                  <span className="value">2123.32</span>
                </div>
              ) : (
                <div>
                  <span className="title">Earning</span>
                  <span className="value">{1789}</span>
                </div>
              )}
              {value ? (
                <div>
                  <span className="title">Earning</span>
                  <span className="value">{0}</span>
                </div>
              ) : null} */}
            </div>
            {/* <div className="header_info-item">
              {!value ? (
                <div>
                  <span className="title">Earning:</span>
                  <span className="value">{0}</span>
                </div>
              ) : null}
            </div> */}

            <ToggleButton handleToggle={handleToggle} />
          </div>
        </div>
      </>
    </div>
  );
}

export default TopBar;
