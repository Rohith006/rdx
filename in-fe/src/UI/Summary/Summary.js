import React from "react";
import numeral from "numeral";
import PropTypes from "prop-types";
import AnimatedNumber from "animated-number-react";

import impression from "../../assets/images/icons/impression.svg";

const Summary = () => {
  return (
    <>
      <div className="statistic">
        <div className="statistic_item card card_body">
          <div className="statistic_inner">
            <img src={impression} />
            <div>
              <span className="statistic_item-title">Event sources</span>
              <Num value={7} />
            </div>
          </div>
          {/* <span className={`growth ${deltaImp.class}`}>{deltaImp.value}34.82%</span> */}
          <span className="growth positive">34.25%</span>
        </div>
        <div className="statistic_item card card_body">
          <div className="statistic_inner">
            <img src={impression} />
            <div>
              <span className="statistic_item-title">Connectors</span>
              <Num value={5} />
            </div>
          </div>
          <span className={`growth positive`}>{54.25}%</span>
        </div>
        <div className="statistic_item card card_body">
          <div className="statistic_inner">
            <img src={impression} />
            <div>
              <span className="statistic_item-title">Incoming events</span>
              <Num value={52603} />
            </div>
          </div>
          <span className={`growth positive`}>{72.25}%</span>
        </div>
        <div className="statistic_item card card_body">
          <div className="statistic_inner">
            <img src={impression} />
            <div>
              <span className="statistic_item-title">Profiles</span>
              <Num value={5123} fixValue={2} />
            </div>
          </div>
          {/* <span className={`growth ${deltaCTR.class}`}>{deltaCTR.value}%</span> */}
          <span className="growth positive">74.25%</span>
        </div>
        <>
          <div className="statistic_item card card_body">
            <div className="statistic_inner">
              <img src={impression} />
              <div>
                <span className="statistic_item-title">Sessions</span>
                <Num value={10231} fixValue={2} />
              </div>
            </div>
            {/* <span className={`growth `}>{deltaCr.value}</span> */}
            <span className="growth positive">20.25%</span>
          </div>
        </>
        <>
          <div className="statistic_item card card_body">
            <div className="statistic_inner">
              <img src={impression} />
              <div>
                <span className="statistic_item-title">Work Flows</span>
                <Num value={6} fixValue={2} />
              </div>
            </div>
            <span className={`growth positive`}>{14.32}%</span>
          </div>
        </>
      </div>
    </>
  );
};

const Num = ({ value, isDollar, fixValue = 0 }) => {
  const formatValue = (value) => {
    return isDollar
      ? `$ ${Number(value).toFixed(fixValue)}`
      : `${
          !String(value).includes(".")
            ? numeral(Number(value).toFixed(fixValue)).format("0,0")
            : Number(value).toFixed(fixValue)
        }`;
  };
  return (
    <span className="statistic_item-value">
      <AnimatedNumber
        value={value || 0}
        formatValue={formatValue}
        duration={1000}
      />
    </span>
  );
};

Summary.propTypes = {
  actions: PropTypes.object,
  summary: PropTypes.object,
};

export default Summary;
