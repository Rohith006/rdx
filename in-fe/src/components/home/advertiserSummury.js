import React, { useState } from "react";
import homeIcon from "../../assets/images/icons/homeIcon.svg";
import { getRoles } from "../../components/authentication/login";

export const AdvertiserWidget = () => {
  const [percent, setPercent] = useState(0);
  const userRole = getRoles(); 

  return (
    <div className="AdvertiserWidget">
      <div className="AdvertiserWidget_content">
        <img src={homeIcon} alt="home icon" />
        <span className="AdvertiserWidget_name">Rohith</span>
      </div>
      <div className="AdvertiserWidget_content">
        <span className="AdvertiserWidget_title">Role</span>
        <span className="AdvertiserWidget_subtitle">{userRole}</span>
      </div>
      <div className="AdvertiserWidget_content">
        <span className="AdvertiserWidget_title">Subscription:</span>
        <span className="AdvertiserWidget_subtitle">PAYG</span>
      </div>
      <div className="AdvertiserWidget_content">
        <span className="AdvertiserWidget_title">Subscription status:</span>
        <span className="AdvertiserWidget_subtitle">Active</span>
      </div>
      <div className="AdvertiserWidget_content">
        <span className="AdvertiserWidget_title">Spend till Date:</span>
        <span className="AdvertiserWidget_subtitle">
          {/* $ {(advertiserUsage && advertiserUsage.actualSpend) || 0} */}
          10
        </span>
      </div>
      <div className="AdvertiserWidget_content-balance">
        <span className="AdvertiserWidget_title">No of events</span>
        <span className="AdvertiserWidget_subtitle">
          {/* ${dailyBalance || 0} (remaining) / $
          {(advertiserUsage && advertiserUsage.dailySpendLimit) || 0} */}
          30
        </span>
      </div>
      <div className="progress advertiser">
        <div className="progress-bar" style={{ width: `30%` }} />
      </div>
    </div>
  );
};

export default AdvertiserWidget;
