import localization from "../../localization";
import React from "react";
import draft from "../../../assets/images/icons/draft.svg";

export default (props) => {
  const {
    count: { activeCount, newCount, pausedCount },
  } = props;
  return (
    <div className="stats users">
      <div className="statistic_item card card_body">
        <div className="value_cover">
          <img style={{ marginRight: "20px" }} src={draft} />
          <div>
            <span className="statistic_item-title">
              {localization.status.new}
            </span>
            <span className="statistic_item-value">{newCount}</span>
          </div>
        </div>
        {/* <span className="growth">0%</span>*/}
      </div>
      <div className="statistic_item card card_body">
        <div className="value_cover">
          <span className="icon new" />
          <div>
            <span className="statistic_item-title">
              {localization.status.active}
            </span>
            <span className="statistic_item-value">{activeCount}</span>
          </div>
        </div>
        {/* <span className="growth">0%</span>*/}
      </div>
      <div className="statistic_item card card_body">
        <div className="value_cover">
          <span className="icon paused" />
          <div>
            <span className="statistic_item-title">
              {localization.status.paused}
            </span>
            <span className="statistic_item-value">{pausedCount}</span>
          </div>
        </div>
        {/* <span className="growth">0%</span>*/}
      </div>
    </div>
  );
};
