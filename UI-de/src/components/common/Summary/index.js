import React, { Fragment, useEffect, useState } from "react";
import numeral from "numeral";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import AnimatedNumber from "animated-number-react";

import {
  ADVERTISER,
  PUBLISHER,
  ADMIN,
  OWNER,
  ACCOUNT_MANAGER,
} from "../../../constants/user";
import { loadSummary } from "../../../actions/summary";
import impression from "../../../../assets/images/icons/impression.svg";
import clicks from "../../../../assets/images/icons/clicks.svg";
import winRate from "../../../../assets/images/icons/winrate.svg";
import conv from "../../../../assets/images/icons/conversions.svg";
import ctrate from "../../../../assets/images/icons/ctr.svg";
import payout from "../../../../assets/images/icons/payout.svg";
import revenue from "../../../../assets/images/icons/revenue.svg";
import { withRouter } from "react-router-dom";
import connect from "react-redux/es/connect/connect";
import DisplayCheck from "../../../permissions";
import localization from "../../../localization";
import { toFixedSummary } from "../../../utils/summary/summary";
import { calculateDeltas } from "../../../utils/summary/deltaData";

const Summary = (props) => {
  const [state, setState] = useState({
    deltaImp: {
      value: 0,
      type: "",
    },
    deltaClicks: {
      value: 0,
      type: "",
    },
    deltaConv: {
      value: 0,
      type: "",
    },
    deltaSpent: {
      value: 0,
      type: "",
    },
    deltaEarned: {
      value: 0,
      type: "",
    },
    deltaCTR: {
      value: 0,
      type: "",
    },
    deltaWinRate: {
      value: 0,
      type: "",
    },
    deltaCr: {
      value: 0,
      type: "",
    },
  });
  let { summary } = props.summary;

  useEffect(() => {
    props.actions.loadSummary();
  }, []);

  useEffect(() => {
    setState(calculateDeltas(summary));
  }, [summary]);

  const { role } = props.auth.currentUser;
  const {
    deltaImp,
    deltaClicks,
    deltaConv,
    deltaSpent,
    deltaEarned,
    deltaCTR,
    deltaCr,
    deltaWinRate,
  } = state;
  summary = toFixedSummary(summary);
  const {
    dashboard: { summaryStat },
  } = localization;

  return (
    <Fragment>
      <div className="statistic">
        <div className="statistic_item card card_body">
          <div className="statistic_inner">
            <img width="56px" height="56px" src={impression} />
            <div style={{ display: "block" }}>
              <span className="statistic_item-title">
                {summaryStat.imToday}
              </span>
              <Num value={summary.todayImpressions} />
            </div>
          </div>
          <span className={`growth ${deltaImp.class}`}>{deltaImp.value}%</span>
        </div>
        <div className="statistic_item card card_body">
          <div className="statistic_inner">
            <img width="56px" height="56px" src={clicks} />
            <div>
              <span className="statistic_item-title">
                {summaryStat.clickToday}
              </span>
              <Num value={summary.todayClicks} />
            </div>
          </div>
          <span className={`growth ${deltaClicks.class}`}>
            {deltaClicks.value}%
          </span>
        </div>
        <div className="statistic_item card card_body">
          <div className="statistic_inner">
            <img width="56px" height="56px" src={conv} />
            <div>
              <span className="statistic_item-title">
                {summaryStat.convToday}
              </span>
              <Num value={summary.todayConversions} />
            </div>
          </div>
          <span className={`growth ${deltaConv.class}`}>
            {deltaConv.value}%
          </span>
        </div>
        <DisplayCheck roles={[PUBLISHER]}>
          <div className="statistic_item card card_body">
            <div className="statistic_inner">
              <img width="56px" height="56px" src={winRate} />
              <div style={{ display: "block" }}>
                <span className="statistic_item-title">
                  {summaryStat.winRate}
                </span>
                <Num value={summary.todayWinRate} fixValue={2} />
              </div>
            </div>
            <span className={`growth ${deltaWinRate.class}`}>
              {deltaWinRate.value}%
            </span>
          </div>
        </DisplayCheck>
        <div className="statistic_item card card_body">
          <div className="statistic_inner">
            <img width="56px" height="56px" src={ctrate} />
            <div>
              <span className="statistic_item-title">
                {summaryStat.ctrToday}
              </span>
              <Num value={summary.todayCTR} fixValue={2} />
            </div>
          </div>
          <span className={`growth ${deltaCTR.class}`}>{deltaCTR.value}%</span>
        </div>
        <DisplayCheck roles={[ADVERTISER]}>
          <div className="statistic_item card card_body">
            <div className="statistic_inner">
              <img width="56px" height="56px" src={revenue} />
              <div style={{ display: "block" }}>
                <span className="statistic_item-title">
                  {summaryStat.crToday}
                </span>
                <Num value={summary.todayCr} fixValue={4} />
              </div>
            </div>
            <span className={`growth ${deltaCr.class}`}>{deltaCr.value}%</span>
          </div>
        </DisplayCheck>
        <DisplayCheck
          roles={[ADMIN, OWNER, ACCOUNT_MANAGER, ADVERTISER]}
          label={["ADVERTISERS"]}
        >
          <div className="statistic_item card card_body">
            <div className="statistic_inner">
              {role === ADVERTISER ? (
                <img width="56px" height="56px" src={payout} />
              ) : (
                <img width="56px" height="56px" src={revenue} />
              )}
              <div>
                <span className="statistic_item-title">
                  {role === ADVERTISER ? "Spend" : summaryStat.spentToday}
                </span>
                <Num value={summary.todayRevenue} isDollar fixValue={2} />
              </div>
            </div>
            <span className={`growth ${deltaSpent.class}`}>
              {deltaSpent.value}%
            </span>
          </div>
        </DisplayCheck>
        <DisplayCheck
          roles={[ADMIN, OWNER, ACCOUNT_MANAGER, PUBLISHER]}
          label={["PUBLISHERS"]}
        >
          <div className="statistic_item card card_body">
            <div className="statistic_inner">
              <img
                width="56px"
                height="56px"
                src={role === PUBLISHER ? revenue : payout}
              />
              <div>
                <span className="statistic_item-title">
                  {role === PUBLISHER
                    ? summaryStat.spentToday
                    : summaryStat.earnedToday}
                </span>
                <Num
                  value={
                    role === PUBLISHER
                      ? summary.todayRevenue
                      : summary.todayPayout
                  }
                  isDollar
                  fixValue={2}
                />
              </div>
            </div>
            <span className={`growth ${deltaEarned.class}`}>
              {deltaEarned.value}%
            </span>
          </div>
        </DisplayCheck>
      </div>
    </Fragment>
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

const mapStateToProps = (state) => ({
  auth: state.auth,
  summary: state.summary,
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(
    {
      loadSummary,
    },
    dispatch
  ),
});

Summary.propTypes = {
  actions: PropTypes.object,
  summary: PropTypes.object,
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Summary)
);
