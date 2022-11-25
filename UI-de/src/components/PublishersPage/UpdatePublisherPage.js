import React, { Component, Fragment } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { formValueSelector, SubmissionError } from "redux-form";
import axios from "axios";
import PropTypes from "prop-types";
import "react-notifications/lib/notifications.css";
import fileDownload from "js-file-download";
import _ from "lodash";

import CreatePublisherForm from "../forms/CreatePublisherForm";
import { signUp } from "../../actions/auth";
import {
  loadPublisherDetails,
  updatePublisher,
  resetCurrentPublisher,
  createPublisher,
} from "../../actions/users";
import { loadCampaigns } from "../../actions/campaigns&budgets";
import { ADM, AUTO, FIRST_PRICE, ORTB } from "../../constants/common";
import { ALL, NEW } from "../../constants/campaigns";
import { USA_BIDDER_DOMAIN } from "../../constants/bidder";
import Duplicate from "../UI/Duplicate";
import BackTo from "../UI/BackTo";

class UpdatePublisherPage extends Component {
  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.onDuplicatePublisher = this.onDuplicatePublisher.bind(this);
  }

  componentDidMount() {
    const { publisherId } = this.props.match.params;
    this.props.actions.loadCampaigns();
    this.props.actions.loadPublisherDetails(publisherId);
  }

  componentWillUnmount() {
    const { actions } = this.props;
    actions.resetCurrentPublisher();
  }

  getInitialValues() {
    const user = this.props.user;
    const initialValues = _.cloneDeep(user);

    if (initialValues) {
      initialValues.channel && (initialValues.channel = user.channel[0]);
      !initialValues.paymentsWith && (initialValues.paymentsWith = ADM);
      !initialValues.auctionType && (initialValues.auctionType = FIRST_PRICE);
      !initialValues.tmax && (initialValues.timeoutSelection = AUTO);
      !initialValues.adType && (initialValues.adType = [ALL]);
      !initialValues.protocolType && (initialValues.protocolType = ORTB);
      !initialValues.rtbProtocolVersion &&
        (initialValues.rtbProtocolVersion = "2.5");
      !initialValues.trafficType && (initialValues.trafficType = ALL);
    }

    return initialValues;
  }

  onDuplicatePublisher() {
    const currentPublisher = _.cloneDeep(this.props.user);

    delete currentPublisher.startDate;
    delete currentPublisher.createdAt;

    delete currentPublisher.updatedAt;
    delete currentPublisher.statusReason;
    delete currentPublisher.bidderUrl;

    // delete currentPublisher.id;
    currentPublisher.isDupicate = true;
    currentPublisher.USA_BIDDER_DOMAIN = `${USA_BIDDER_DOMAIN}/bid?pid=`;

    currentPublisher.status = NEW;
    currentPublisher.isDuplicate = true;

    this.props.actions
      .createPublisher(currentPublisher, this.props.history)

      .catch((e) => {
        throw new SubmissionError({
          serverError: "Server Error",
        });
      });
  }

  handleSubmit(formData) {
    delete formData.confirmPassword;
    if (!formData.payout)
      formData.payout = this.props.platformSettings.userActivation.globalPayout;
    Object.keys(formData).map((field) => {
      const value = formData[field];
      if ((value && typeof value === "string") || value instanceof String) {
        formData[field] = value.trim();
      }
    });

    const obj = _.cloneDeep(formData);
    obj.channel = [formData.channel];
    obj.protocolType !== "oRTB" && (obj.rtbProtocolVersion = null);
    if (obj.adType && obj.adType.length === 0) {
      obj.adType = ["ALL"];
    }
    obj.timeoutSelection === "auto" && (obj.tmax = null);
    // TODO Refactor default bidder, winNotify urls etc.
    obj.bidderUrl =
      formData.bidderUrl || `${USA_BIDDER_DOMAIN}/bid?pid=${formData.id}`;
    return this.props.actions
      .updatePublisher(obj)
      .then((res) => {
        this.props.history.push("/publishers");
      })
      .catch((err) => {
        const errors = err.response.data.errors;

        if (errors) {
          const error = {};
          errors.forEach((err) => {
            error[err.path] = err.message;
          });
          throw new SubmissionError(error);
        } else {
          console.log(err.response.data);
        }
      });
  }

  render() {
    const initialValues = this.getInitialValues();

    return (
      <Fragment>
        <div className="publisher-page">
          <div className="back_to_wrapper">
            <BackTo path="/publishers" text="publishers" />
            {/* <Duplicate onClick={this.onDuplicatePublisher} /> */}
          </div>
          {initialValues.id && (
            <CreatePublisherForm
              action={"update"}
              countries={this.props.countries}
              {...this.props}
              onSubmit={this.handleSubmit}
              initialValues={initialValues}
            />
          )}
        </div>
      </Fragment>
    );
  }
}

const valueSelector = formValueSelector("CreatePublisherForm");

const mapStateToProps = (state) => ({
  user: state.users.currentPublisher,
  formData: {
    id: valueSelector(state, "id"),
    inventories: valueSelector(state, "inventories") || [],
    demandType: valueSelector(state, "demandType") || ALL,
  },
  managers: state.users.managers,
  countries: state.countries,
  campaigns: state.campaigns.campaignsList,
  platformSettings: state.platformSettings,
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(
    {
      signUp,
      updatePublisher,
      loadPublisherDetails,
      loadCampaigns,
      resetCurrentPublisher,
      createPublisher,
    },
    dispatch
  ),
});

UpdatePublisherPage.propTypes = {
  actions: PropTypes.object,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UpdatePublisherPage);
