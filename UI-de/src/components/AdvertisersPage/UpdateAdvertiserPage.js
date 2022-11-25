import React, { Component, Fragment } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { SubmissionError } from "redux-form";
import PropTypes from "prop-types";
import CreateAdvertiserForm from "../forms/CreateAdvertiserForm";
import {
  loadAdvertiserDetails,
  updateAdvertiser,
  resetCurrentAdvertiser,
  createAdvertiser,
} from "../../actions/users";
import { resetFormState } from "../../actions/app";
import { generateAdvertiserApiKey } from "../../actions/auth";
import localization from "../../localization";
import Link from "react-router-dom/es/Link";
import Duplicate from "../UI/Duplicate";
import _ from "lodash";
import { USA_BIDDER_DOMAIN } from "../../constants/bidder";
import { NEW } from "../../constants/campaigns";
import BackTo from "../UI/BackTo";

class UpdateAdvertiserPage extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onDuplicateAdvertiser = this.onDuplicateAdvertiser.bind(this);
  }

  onDuplicateAdvertiser() {
    const currentAdvertiser = _.cloneDeep(this.props.currentAdvertiser);

    delete currentAdvertiser.startDate;
    delete currentAdvertiser.createdAt;

    delete currentAdvertiser.updatedAt;
    delete currentAdvertiser.statusReason;
    delete currentAdvertiser.bidderUrl;

    // delete currentPublisher.id;
    currentAdvertiser.isDupicate = true;
    currentAdvertiser.USA_BIDDER_DOMAIN = `${USA_BIDDER_DOMAIN}/bid?pid=`;

    currentAdvertiser.status = NEW;
    currentAdvertiser.isDuplicate = true;

    this.props.actions
      .createAdvertiser(currentAdvertiser, this.props.history)
      .then(() => this.props.history.push("/advertisers"))
      .catch(() => {
        throw new SubmissionError({
          serverError: "Server Error",
        });
      });
  }

  getBilling() {
    const {
      currentAdvertiser: { billing },
    } = this.props;
    if (!billing) return {};

    return {
      billingFirstName: billing.firstName,
      billingLastName: billing.lastName,
      billingEmail: billing.email,
      billingAddress: billing.address,
      billingCity: billing.city,
      billingZipCode: billing.zipCode,
      billingCountry: billing.country,
      billingIsCorporation: billing.isCorporation,
      billingCompanyName: billing.companyName,
      billingCompanyAddress: billing.companyAddress,
      billingCompanyCity: billing.companyCity,
      billingCompanyZipCode: billing.companyZipCode,
      billingTaxId: billing.taxId,
      billingCompanyCountry: billing.companyCountry,
    };
  }

  render() {
    const { currentAdvertiser } = this.props;
    const billing = this.getBilling();
    const initialValues = { ...currentAdvertiser, ...billing };

    return Object.keys(initialValues).length ? (
      <Fragment>
        <div className="update-advertiser-page">
          <div className="back_to_wrapper">
            <BackTo path="/advertisers" text="Advertisers" />
            {/* <Duplicate onClick={this.onDuplicateAdvertiser} /> */}
          </div>
          <CreateAdvertiserForm
            {...this.props}
            countries={this.props.countries}
            onSubmit={this.handleSubmit}
            {...{ initialValues }}
            btnName={localization.forms.save}
          />
        </div>
      </Fragment>
    ) : null;
  }

  UNSAFE_componentWillMount() {
    const { advertiserId } = this.props.match.params;
    this.props.actions.loadAdvertiserDetails(advertiserId);
  }

  componentWillUnmount() {
    this.props.actions.resetCurrentAdvertiser();
    this.props.actions.resetFormState();
  }

  handleSubmit(formData) {
    delete formData.confirmPassword;

    Object.keys(formData).map((field) => {
      const value = formData[field];
      if ((value && typeof value === "string") || value instanceof String) {
        formData[field] = value.trim();
      }
    });

    const billing = {
      email: formData.billingEmail,
      firstName: formData.billingFirstName,
      lastName: formData.billingLastName,
      address: formData.billingAddress,
      city: formData.billingCity,
      zipCode: formData.billingZipCode,
      country: formData.billingCountry,
      isCorporation: formData.billingIsCorporation,
      companyName: formData.billingCompanyName,
      companyAddress: formData.billingCompanyAddress,
      companyCity: formData.billingCompanyCity,
      companyZipCode: formData.billingCompanyZipCode,
      taxId: formData.billingTaxId,
      companyCountry: formData.billingCompanyCountry,
    };
    for (const key in billing) {
      if (!billing[key] === undefined) delete billing[key];
    }
    formData.billing = billing;
    formData.remainingBudget =
      formData.remainingBudget === null ? 0 : formData.remainingBudget;
    delete formData.apiKey;

    return this.props.actions
      .updateAdvertiser(formData)
      .then((res) => {
        this.props.history.push("/advertisers");
      })
      .catch((err) => {
        const errors = err && err.response.data.errors;

        if (errors) {
          const error = {};
          errors.forEach((err) => {
            error[err.path] = err.message;
          });
          throw new SubmissionError(error);
        }
      });
  }
}

const mapStateToProps = ({ users, countries, app, auth }, state) => ({
  users: users.advertisers || [],
  managers: users.managers || [],
  countries: countries,
  currentAdvertiser: users.currentAdvertiser,
  auth: auth,
  app: app,
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(
    {
      updateAdvertiser,
      generateAdvertiserApiKey,
      loadAdvertiserDetails,
      resetCurrentAdvertiser,
      resetFormState,
      createAdvertiser,
    },
    dispatch
  ),
});

UpdateAdvertiserPage.propTypes = {
  actions: PropTypes.object,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UpdateAdvertiserPage);
