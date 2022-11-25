import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { reduxForm, Field, formValueSelector } from "redux-form";
import {
  ADMIN,
  ADVERTISER,
  PUBLISHER,
  ACCOUNT_MANAGER,
  OWNER,
} from "../../../constants/user";
import DisplayCheck from "../../../permissions/index";
import * as reportsConstants from "../../../constants/reports";
import {
  PUBLISHER_ERRORS,
  APPS,
  SITES,
  COUNTRY,
  OS,
  CREATIVES,
  PUBLISHER_ERRORS_XML,
  PUB_NO_MATCH_CAMPAIGN,
  SIZES,
} from "../../../constants/reports";
import { RTB } from "../../../constants/common";

class ReportsPageTableTypeForm extends Component {
  constructor(props) {
    super(props);
    this.renderRadioField = this.renderRadioField.bind(this);
  }

  renderRadioField({ input, id, val, title, checked }) {
    return (
        <div className={"radio-control pill-control"}>
          <input
            {...input}
            type="radio"
            onChange={(e) => {
              if (!this.props.isRequestPending) {
                input.onChange(e);
                setTimeout(() => {
                  this.props.handleSubmit(this.props.onSubmit)();
                }, 0);
              }
            }}
            id={id}
            value={val}
            checked={checked}
          />
          <label htmlFor={id}>
            <span className="radio-control__indicator" />
            {title}
          </label>
        </div>
    );
  }

  render() {
    const { role, isInventoriesAllowed } = this.props.user;
    const { tableType, switcherStatus } = this.props;
    const {
      DAILY,
      HOURLY,
      IMPRESSIONS,
      ADVERTISERS,
      CAMPAIGNS,
      PUBLISHERS,
      SUB_ID,
      ERRORS,
    } = reportsConstants;

    return (
      <Fragment>
        {switcherStatus === RTB ? (
          <form
            onSubmit={this.props.handleSubmit}
            className="reports_form_selectors"
          >
            <DisplayCheck
              roles={[ADMIN, OWNER, ADVERTISER, PUBLISHER, ACCOUNT_MANAGER]}
            >
              <Field
                name="tableType"
                component={this.renderRadioField}
                val={DAILY}
                id="daily"
                title="Daily"
                checked={tableType === DAILY}
              />
            </DisplayCheck>
            <DisplayCheck roles={[ADMIN]}>
              <Field
                name="tableType"
                component={this.renderRadioField}
                val={HOURLY}
                id="hourly"
                title="Hourly"
                checked={tableType === HOURLY}
              />
            </DisplayCheck>
            <DisplayCheck
              roles={[ADMIN, ACCOUNT_MANAGER]}
              label={["PUBLISHERS"]}
            >
              {!isInventoriesAllowed && (
                <Field
                  name="tableType"
                  component={this.renderRadioField}
                  val={PUBLISHERS}
                  id="Publishers"
                  checked={tableType === PUBLISHERS}
                  title="Publishers"
                />
              )}
            </DisplayCheck>
            <DisplayCheck
              roles={[ADMIN, ACCOUNT_MANAGER]}
              label={["ADVERTISERS"]}
            >
              <div className={`radio-control pill-control`}>
                <Field
                  name="tableType"
                  component={this.renderRadioField}
                  val={ADVERTISERS}
                  id="Advertisers"
                  checked={tableType === ADVERTISERS}
                />
                <label htmlFor="Advertisers">
                  <span className="radio-control__indicator" />
                  Advertisers
                </label>
              </div>
            </DisplayCheck>
            <DisplayCheck
              roles={[ADMIN, ACCOUNT_MANAGER]}
              label={["PUBLISHERS"]}
            >
              <Field
                name="tableType"
                component={this.renderRadioField}
                val={PUBLISHER_ERRORS}
                id="pubErrors"
                title="Publisher Error"
                checked={tableType === PUBLISHER_ERRORS}
              />
            </DisplayCheck>
            <DisplayCheck
              roles={[ADMIN, ACCOUNT_MANAGER]}
              label={["PUBLISHERS"]}
            >
              <div className="radio-control pill-control">
                <Field
                  name="tableType"
                  component={this.renderRadioField}
                  val={PUBLISHER_ERRORS_XML}
                  id="pubErrors"
                  checked={tableType === PUBLISHER_ERRORS_XML}
                />
                <label htmlFor="Errors">
                  <span className="radio-control__indicator" />
                  {role === PUBLISHER ? "Errors Xml" : "Publisher errors Xml"}
                </label>
              </div>
            </DisplayCheck>
            <DisplayCheck
              roles={[ADMIN, PUBLISHER, ADVERTISER]}
              label={[APPS]}
              type={switcherStatus}
            >
              <div className={`radio-control pill-control`}>
                <Field
                  name="tableType"
                  component={this.renderRadioField}
                  val={APPS}
                  id="APPS"
                  checked={tableType === APPS}
                />
                <label htmlFor="APPS">
                  <span className="radio-control__indicator" />
                  Apps
                </label>
              </div>
            </DisplayCheck>
            <DisplayCheck
              roles={[ADMIN, PUBLISHER, ADVERTISER]}
              label={[SITES]}
              type={switcherStatus}
            >
              <div className={`radio-control pill-control`}>
                <Field
                  name="tableType"
                  component={this.renderRadioField}
                  val={SITES}
                  id="SITES"
                  checked={tableType === SITES}
                />
                <label htmlFor="SITES">
                  <span className="radio-control__indicator" />
                  Sites
                </label>
              </div>
            </DisplayCheck>
            <DisplayCheck
              roles={[ADMIN, PUBLISHER, ADVERTISER]}
              label={[SUB_ID]}
              type={switcherStatus}
            >
              <div className="radio-control pill-control">
                <Field
                  name="tableType"
                  component={this.renderRadioField}
                  val={SUB_ID}
                  id={SUB_ID}
                  checked={tableType === SUB_ID}
                />
                <label htmlFor={SUB_ID}>
                  <span className="radio-control__indicator" />
                  Sub ID
                </label>
              </div>
            </DisplayCheck>
            <DisplayCheck
              roles={[ADMIN]}
              label={[CREATIVES]}
              type={switcherStatus}
            >
              <div className={`radio-control pill-control`}>
                <Field
                  name="tableType"
                  component={this.renderRadioField}
                  val={CREATIVES}
                  id={CREATIVES}
                  checked={tableType === CREATIVES}
                />
                <label htmlFor={CREATIVES}>
                  <span className="radio-control__indicator" />
                  Creatives
                </label>
              </div>
            </DisplayCheck>
            <DisplayCheck roles={[ADMIN]} label={["STATS_OS"]}>
              <div className="radio-control pill-control">
                <Field
                  name="tableType"
                  component={this.renderRadioField}
                  val={OS}
                  id={OS}
                  checked={tableType === OS}
                />
                <label htmlFor="Servers">
                  <span className="radio-control__indicator" />
                  Os
                </label>
              </div>
            </DisplayCheck>
            <DisplayCheck
              roles={[ADMIN, PUBLISHER, ADVERTISER, ACCOUNT_MANAGER]}
              label={["STATS_COUNTRY"]}
            >
              <div className="radio-control pill-control">
                <Field
                  name="tableType"
                  component={this.renderRadioField}
                  val={COUNTRY}
                  id={COUNTRY}
                  checked={tableType === COUNTRY}
                />
                <label htmlFor="Servers">
                  <span className="radio-control__indicator" />
                  Countries
                </label>
              </div>
            </DisplayCheck>
            {/* <DisplayCheck roles={[ADMIN]} label={[CREATIVES]}>*/}
            {/*  <div className="radio-control pill-control">*/}
            {/*    <Field*/}
            {/*      name="tableType"*/}
            {/*      component={this.renderRadioField}*/}
            {/*      val={CREATIVES}*/}
            {/*      id={CREATIVES}*/}
            {/*      checked={tableType === CREATIVES}*/}
            {/*    />*/}
            {/*    <label htmlFor={CREATIVES}>*/}
            {/*      <span className="radio-control__indicator"/>Creatives*/}
            {/*    </label>*/}
            {/*  </div>*/}
            {/* </DisplayCheck>*/}
          </form>
        ) : (
          /* ------------------------------------- CAMPAIGNS REPORT ---------------------------------------------*/

          <form
            onSubmit={this.props.handleSubmit}
            className="reports_form_selectors"
          >
            <DisplayCheck
              roles={[ADMIN, OWNER, ADVERTISER, PUBLISHER, ACCOUNT_MANAGER]}
            >
              <Field
                name="tableType"
                component={this.renderRadioField}
                val={DAILY}
                id="daily"
                checked={tableType === DAILY}
                title="Daily"
              />
            </DisplayCheck>
            <DisplayCheck roles={[ADMIN]}>
              <Field
                name="tableType"
                component={this.renderRadioField}
                val={HOURLY}
                id="hourly"
                title="Hourly"
                checked={tableType === HOURLY}
              />
            </DisplayCheck>
            <DisplayCheck
              roles={[ADMIN, ACCOUNT_MANAGER]}
              label={["PUBLISHERS"]}
            >
              {!isInventoriesAllowed && role === ADVERTISER ? null : (
                <Field
                  name="tableType"
                  component={this.renderRadioField}
                  val={PUBLISHERS}
                  id="Publishers"
                  title="Publisher"
                  checked={tableType === PUBLISHERS}
                />
              )}
            </DisplayCheck>
            <DisplayCheck
              roles={[ADMIN, ACCOUNT_MANAGER]}
              label={["ADVERTISERS"]}
            >
              <Field
                name="tableType"
                component={this.renderRadioField}
                val={ADVERTISERS}
                id="Advertisers"
                title="Advertisers"
                checked={tableType === ADVERTISERS}
              />
            </DisplayCheck>
            <DisplayCheck
              roles={[ADMIN, ADVERTISER, ACCOUNT_MANAGER]}
              label={["ADVERTISERS"]}
            >
              <Field
                name="tableType"
                component={this.renderRadioField}
                val={CAMPAIGNS}
                id="Campaigns"
                title="Campaigns"
                checked={tableType === CAMPAIGNS}
              />
            </DisplayCheck>
            <DisplayCheck
              roles={[ADMIN, ACCOUNT_MANAGER]}
              label={["PUBLISHERS"]}
            >
              {!isInventoriesAllowed && role === ADVERTISER ? null : (
                <Field
                  name="tableType"
                  component={this.renderRadioField}
                  val={PUBLISHER_ERRORS}
                  id="pubErrors"
                  title={role === PUBLISHER ? "Errors" : "Publisher errors"}
                  checked={tableType === PUBLISHER_ERRORS}
                />
              )}
            </DisplayCheck>
            <DisplayCheck
              roles={[ADMIN, ACCOUNT_MANAGER]}
              label={[PUB_NO_MATCH_CAMPAIGN, "ADVERTISERS", "PUBLISHERS"]}
            >
              <Field
                name="tableType"
                component={this.renderRadioField}
                val={PUB_NO_MATCH_CAMPAIGN}
                id={PUB_NO_MATCH_CAMPAIGN}
                title="No Match"
                checked={tableType === PUB_NO_MATCH_CAMPAIGN}
              />
            </DisplayCheck>
            <DisplayCheck
              roles={[ADMIN, PUBLISHER, ADVERTISER, ACCOUNT_MANAGER]}
              label={[APPS]}
              type={switcherStatus}
            >
              <Field
                name="tableType"
                component={this.renderRadioField}
                val={APPS}
                id={APPS}
                title="Apps"
                checked={tableType === APPS}
              />
            </DisplayCheck>
            <DisplayCheck
              roles={[ADMIN, PUBLISHER, ADVERTISER, ACCOUNT_MANAGER]}
              label={[SITES]}
              type={switcherStatus}
            >
              <Field
                name="tableType"
                component={this.renderRadioField}
                val={SITES}
                id={SITES}
                title="Sites"
                checked={tableType === SITES}
              />
            </DisplayCheck>
            <DisplayCheck
              roles={[ADMIN, PUBLISHER, ADVERTISER, ACCOUNT_MANAGER]}
              label={[SUB_ID]}
              type={switcherStatus}
            >
              <Field
                name="tableType"
                component={this.renderRadioField}
                val={SUB_ID}
                id={SUB_ID}
                title="Sub ID"
                checked={tableType === SUB_ID}
              />
            </DisplayCheck>
            <DisplayCheck
              roles={[ADMIN]}
              label={[CREATIVES]}
              type={switcherStatus}
            >
                <Field
                  name="tableType"
                  component={this.renderRadioField}
                  val={CREATIVES}
                  id={CREATIVES}
                  title="Creatives"
                  checked={tableType === CREATIVES}
                />
              </DisplayCheck>
            <DisplayCheck roles={[ADMIN]} label={[SIZES]} type={switcherStatus}>
                <Field
                  name="tableType"
                  component={this.renderRadioField}
                  val={SIZES}
                  id={SIZES}
                  title="Sizes"
                  checked={tableType === SIZES}
                />
              </DisplayCheck>
            <DisplayCheck roles={[ADMIN]} label={["STATS_OS"]}>
                <Field
                  name="tableType"
                  component={this.renderRadioField}
                  val={OS}
                  id={OS}
                  title="OS"
                  checked={tableType === OS}
                />
            </DisplayCheck>
            <DisplayCheck
              roles={[ADMIN, PUBLISHER, ADVERTISER, ACCOUNT_MANAGER]}
              label={["STATS_COUNTRY"]}
            >
                <Field
                  name="tableType"
                  component={this.renderRadioField}
                  val={COUNTRY}
                  id="country"
                  title="Countries"
                  checked={tableType === COUNTRY}
                />
            </DisplayCheck>
          </form>
        )}
      </Fragment>
    );
  }
}

const valueSelector = formValueSelector("ReportsPageTableTypeForm");

const mapStateToProps = (state) => ({
  formData: {
    tableType: valueSelector(state, "tableType"),
  },
  user: state.auth.currentUser,
});

export default connect(
  mapStateToProps,
  null
)(
  reduxForm({
    form: "ReportsPageTableTypeForm",
  })(ReportsPageTableTypeForm)
);
