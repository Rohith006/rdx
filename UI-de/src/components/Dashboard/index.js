import React, { Component, Fragment } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Summary from "../common/Summary";
import DisplayCheck from "../../permissions";
import {
  ADVERTISER,
  PUBLISHER,
  ADMIN,
  ACCOUNT_MANAGER,
  OWNER,
} from "../../constants/user";
import * as userConstants from "../../constants/user";
import { loadAdvertisers, loadPublishers } from "../../actions/users";
import { loadCampaigns } from "../../actions/campaigns&budgets";
import { loadTopEarnings } from "../../actions/topEarnings";
import { loadTopSpent } from "../../actions/topSpent";
import { loadCaps } from "../../actions/caps";
import { loadTopCampaigns } from "../../actions/topCampaigns";
import { loadTopCountries } from "../../actions/topCountries";
import {
  loadCommonStatistic,
  loadTrafficStatistic,
} from "../../actions/statistic";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-balham.css";
import localization from "../../localization";
import classNames from "classnames";
import onOutsideElementClick from "../../utils/onOutsideElementClick";
import TopPubDonutChart from "./TopPubDonutChart";
import TopCampDonutChart from "./TopCampDonutChart";
import LineChart from "./LineChart";
import GeoChart from "./GeoMap";
import CapsTop from "./CapsTop";
import TopBar from "../common/TopBar/TopBar";
import moment from "moment";

const lastThirtyDays = [...new Array(31)].map((i, idx) =>
  moment().startOf("day").subtract(idx, "days").format("MMM-DD")
);
const Days = lastThirtyDays.reverse();

const IMPRESSIONS = "#4F96A1";
const CLICKS = "#78A9ED";
const REVENUE = "#99CB6D";
const PROFIT = "#E2726E";
const CTR = "#E59472";
const CR = "#D6AD57";
const WINRATE = "#2F59F5";
const SPEND = "#4f96a1";

class Dashboard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showReportingDropdown: false,
      showTypeDropdown: false,
      daysCount: 30,
      showSummary: false,
      reportingLabel: localization.campaigns.filters.lastThirty,
      periodLabel: localization.dashboard.dropdown.day,
      typeLabel: localization.dashboard.dropdown.budget,
    };
    this.toggleReportingDropdown = this.toggleReportingDropdown.bind(this);
  }

  componentDidMount() {
    const { currentUser } = this.props.auth;
    const { role, id } = this.props.auth.currentUser;
    this.props.actions.loadTrafficStatistic(30, role, id);
    this.props.actions.loadTopCountries();
    this.props.actions.loadTopEarnings(currentUser);

    switch (currentUser.role) {
      case userConstants.ADMIN:
      case userConstants.ACCOUNT_MANAGER:
        this.props.actions.loadCommonStatistic();
        this.props.actions.loadCaps();
        break;
      case userConstants.ADVERTISER:
        // this.props.actions.loadTopSpent();
        this.props.actions.loadCampaigns();
        break;
      case userConstants.PUBLISHER:
        break;
    }

    onOutsideElementClick(this.reportingDropdown, () => {
      if (this.state.showReportingDropdown) {
        this.setState({
          showReportingDropdown: false,
        });
      }
    });
  }

  setReportingSelect(daysCount, reportingLabel) {
    const { role, id } = this.props.auth.currentUser;
    this.setState({ daysCount });
    this.props.actions.loadTrafficStatistic(daysCount, role, id);
    this.setState({
      reportingLabel,
    });
    this.toggleReportingDropdown();
  }

  setTypeSelect(daysCount, typeLabel) {
    this.setState({
      typeLabel,
    });
    this.toggleTypeDropdown();
  }

  toggleReportingDropdown() {
    this.setState((prevState) => ({
      showReportingDropdown: !prevState.showReportingDropdown,
    }));
  }

  render() {
    const { currentUser } = this.props.auth;
    const { campaignsList } = this.props.campaigns;
    const { summary } = this.props.summary;

    const { trafficStatistic } = this.props.statistic;
    const { topEarnings, topSpent } = this.props;

    let revenue = trafficStatistic.reduce(function (accumulator, item) {
      return accumulator + item.revenue;
    }, 0);

    let impressions = trafficStatistic.reduce(function (accumulator, item) {
      return accumulator + item.impressions;
    }, 0);

    let spent = trafficStatistic.reduce(function (accumulator, item) {
      return accumulator + item.spent;
    }, 0);

    let profit = trafficStatistic.reduce(function (accumulator, item) {
      return accumulator + item.profit;
    }, 0);

    let clicks = trafficStatistic.reduce(function (accumulator, item) {
      return accumulator + item.clicks;
    }, 0);

    let ctr = trafficStatistic.reduce(function (accumulator, item) {
      return accumulator + item.ctr;
    }, 0);

    let cr = trafficStatistic.reduce(function (accumulator, item) {
      return accumulator + item.cr;
    }, 0);

    let winRate = trafficStatistic.reduce(function (accumulator, item) {
      return accumulator + item.winRate;
    }, 0);

    const geoClass =
      currentUser.role === ACCOUNT_MANAGER
        ? currentUser.permissions.includes("ADVERTISERS") &&
          currentUser.permissions.includes("PUBLISHERS")
          ? "w100"
          : "w50"
        : "w100";

    return (
      <Fragment>
        <TopBar title={localization.header.nav.dashboard} subtitle="Today" />
        <Summary
          daysCount={this.state.daysCount}
          summary={summary}
          loadTrafficStatistic={this.props.actions.loadTrafficStatistic}
        />
        <div className="card traffic_stat">
          <div className="card_header">
            <div className="subheading_cover">
              <h2 className="subheading">
                {localization.dashboard.trafficStatistics}
              </h2>
              <div ref={(el) => (this.reportingDropdown = el)}>
                <div
                  className={classNames("dropdown", {
                    opened: this.state.showReportingDropdown,
                  })}
                >
                  <button
                    onClick={this.toggleReportingDropdown}
                    className="dropdown__button"
                    tabIndex="0"
                    type="button"
                  >
                    <span className="dropdown__button-value">
                      <span>{this.state.reportingLabel}</span>
                    </span>
                    <span className="dropdown__arrow" />
                  </button>
                  <div className="dropdown__menu">
                    <div className="dropdown__menu-scroll">
                      <div
                        onClick={() =>
                          this.setReportingSelect(
                            1,
                            localization.campaigns.filters.today
                          )
                        }
                        className="dropdown__item nowrap"
                      >
                        <span className="nowrap">
                          {localization.campaigns.filters.today}
                        </span>
                      </div>
                      <div
                        onClick={() =>
                          this.setReportingSelect(
                            7,
                            localization.campaigns.filters.lastSeven
                          )
                        }
                        className="dropdown__item nowrap"
                      >
                        <span className="nowrap">
                          {localization.campaigns.filters.lastSeven}
                        </span>
                      </div>
                      <div
                        onClick={() =>
                          this.setReportingSelect(
                            30,
                            localization.campaigns.filters.lastThirty
                          )
                        }
                        className="dropdown__item nowrap"
                      >
                        <span className="nowrap">
                          {localization.campaigns.filters.lastThirty}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {this.state.showSummary ? (
                <div
                  style={{ color: "#3444CE", cursor: "pointer" }}
                  onClick={() =>
                    this.setState({ showSummary: !this.state.showSummary })
                  }
                >
                  <h6 className="view_summary">Hide summary</h6>
                </div>
              ) : (
                <div
                  style={{ color: "#3444CE", cursor: "pointer" }}
                  onClick={() =>
                    this.setState({ showSummary: !this.state.showSummary })
                  }
                >
                  <h6 className="view_summary">View summary</h6>
                </div>
              )}
            </div>
          </div>
          <div className="card_body">
            {trafficStatistic.length > 0 && (
              <Fragment>
                {this.state.showSummary ? (
                  <div className="traffic_statisticsData">
                    <DisplayCheck
                      roles={[ADMIN, OWNER, ACCOUNT_MANAGER]}
                      label={["PUBLISHERS"]}
                    >
                      <div className="traffic_item">
                        <span
                          className="traffic_dot"
                          style={{ backgroundColor: REVENUE }}
                        ></span>
                        <h3>Revenue</h3>
                        <span className="traffic_value">
                          ${Math.round(revenue)}
                        </span>
                      </div>
                      <div className="traffic_item">
                        <span
                          className="traffic_dot"
                          style={{ backgroundColor: PROFIT }}
                        ></span>
                        <h3>Profit</h3>
                        <span className="traffic_value">
                          ${Math.round(profit)}
                        </span>
                      </div>
                      <div className="traffic_item">
                        <span
                          className="traffic_dot"
                          style={{ backgroundColor: IMPRESSIONS }}
                        ></span>
                        <h3>Impressions</h3>
                        <span className="traffic_value">
                          {Math.round(impressions)}
                        </span>
                      </div>
                      <div className="traffic_item">
                        <span
                          className="traffic_dot"
                          style={{ backgroundColor: CLICKS }}
                        ></span>
                        <h3>Clicks</h3>
                        <span className="traffic_value">
                          {Math.round(clicks)}
                        </span>
                      </div>
                      <div className="traffic_item">
                        <span
                          className="traffic_dot"
                          style={{ backgroundColor: CTR }}
                        ></span>
                        <h3>CTR %</h3>
                        <span className="traffic_value">{Math.round(ctr)}</span>
                      </div>
                      <div className="traffic_item">
                        <span
                          className="traffic_dot"
                          style={{ backgroundColor: CR }}
                        ></span>
                        <h3>CR %</h3>
                        <span className="traffic_value">{Math.round(cr)}</span>
                      </div>
                      <div className="traffic_item">
                        <span
                          className="traffic_dot"
                          style={{ backgroundColor: WINRATE }}
                        ></span>
                        <h3>WinRate %</h3>
                        <span className="traffic_value">
                          {Math.round(winRate)}
                        </span>
                      </div>
                    </DisplayCheck>
                    <DisplayCheck roles={[ADVERTISER]} label={["PUBLISHERS"]}>
                      <div className="traffic_item">
                        <span
                          className="traffic_dot"
                          style={{ backgroundColor: SPEND }}
                        ></span>
                        <h3>Spend</h3>
                        <span className="traffic_value">
                          {Math.round(spent)}
                        </span>
                      </div>
                      <div className="traffic_item">
                        <span
                          className="traffic_dot"
                          style={{ backgroundColor: IMPRESSIONS }}
                        ></span>
                        <h3>Impressions</h3>
                        <span className="traffic_value">
                          {Math.round(impressions)}
                        </span>
                      </div>
                      <div className="traffic_item">
                        <span
                          className="traffic_dot"
                          style={{ backgroundColor: CLICKS }}
                        ></span>
                        <h3>Clicks</h3>
                        <span className="traffic_value">
                          {Math.round(clicks)}
                        </span>
                      </div>
                      <div className="traffic_item">
                        <span
                          className="traffic_dot"
                          style={{ backgroundColor: CTR }}
                        ></span>
                        <h3>CTR</h3>
                        <span className="traffic_value">{Math.round(ctr)}</span>
                      </div>
                      <div className="traffic_item">
                        <span
                          className="traffic_dot"
                          style={{ backgroundColor: CR }}
                        ></span>
                        <h3>CR %</h3>
                        <span className="traffic_value">{Math.round(cr)}</span>
                      </div>
                      <div className="traffic_item">
                        <span
                          className="traffic_dot"
                          style={{ backgroundColor: WINRATE }}
                        ></span>
                        <h3>WinRate %</h3>
                        <span className="traffic_value">
                          {Math.round(winRate)}
                        </span>
                      </div>
                    </DisplayCheck>
                  </div>
                ) : null}
                <LineChart
                  statistics={trafficStatistic}
                  userRole={currentUser.role}
                  permissions={currentUser.permissions}
                />
              </Fragment>
            )}
          </div>
        </div>
        <div className="top_cover">
          <DisplayCheck
            roles={[ADMIN, OWNER, ACCOUNT_MANAGER, ADVERTISER]}
            label={["PUBLISHERS"]}
          >
            <div className="card">
              <div className="card_header bordered">
                <h3 className="subheading">
                  {localization.dashboard.topPublishers}
                </h3>
              </div>
              <div className="card_body donut">
                <TopPubDonutChart
                  topPublishers={topEarnings.publisherTopEarnings}
                  userRole={currentUser.role}
                />
              </div>
            </div>
          </DisplayCheck>
          <DisplayCheck
            roles={[ADMIN, OWNER, ACCOUNT_MANAGER, ADVERTISER]}
            label={["ADVERTISERS"]}
          >
            <div className="card ">
              <div className="card_header bordered">
                <h3 className="subheading">
                  {localization.dashboard.topCampaigns}
                </h3>
              </div>
              <div className="card_body donut">
                <DisplayCheck
                  roles={[ADMIN, OWNER, ACCOUNT_MANAGER, ADVERTISER]}
                >
                  <TopCampDonutChart
                    topCampaigns={topEarnings.campaignTopEarnings}
                    field={"profit"}
                    userRole={currentUser.role}
                  />
                </DisplayCheck>
              </div>
            </div>
          </DisplayCheck>
          {/* TODO Add for Advertisers too */}
          {/* <DisplayCheck
            roles={[OWNER, ADMIN, ACCOUNT_MANAGER]}
            label={["ADVERTISERS"]}
          >
            <CapsTop
              campaignsList={campaignsList}
              capsList={this.props.caps.capsList}
            />
          </DisplayCheck> */}
        </div>
        <div className={`card ${geoClass}`}>
          <div className="card_header bordered">
            <h3 className="subheading">{localization.dashboard.topGeo}</h3>
          </div>
          <div className="card_body geochart">
            <GeoChart
              field={currentUser.role === PUBLISHER ? "payout" : "revenue"}
              topCountries={this.props.topCountries.topCountriesList}
            />
          </div>
        </div>
      </Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  users: state.users,
  campaigns: state.campaigns,
  caps: state.caps,
  topCampaigns: state.topCampaigns,
  topCountries: state.topCountries,
  statistic: state.statistic,
  topEarnings: state.topEarnings.topEarningsStatistic,
  topSpent: state.topSpent.topSpentStatistic,
  summary: state.summary,
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(
    {
      loadAdvertisers,
      loadPublishers,
      loadCampaigns,
      loadTopCountries,
      loadTopEarnings,
      loadTopSpent,
      loadCaps,
      loadTopCampaigns,
      loadCommonStatistic,
      loadTrafficStatistic,
    },
    dispatch
  ),
});

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
