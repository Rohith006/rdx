import React, {Component, Fragment} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {SubmissionError} from 'redux-form';
import PropTypes from 'prop-types';
import CreateAdvertiserForm from '../forms/CreateAdvertiserForm';
import {createAdvertiser, createBillingDetailsByAdmin} from '../../actions/users';
import {resetFormState} from '../../actions/app';
import {createBillingDetails} from '../../actions/auth';
import {ADVERTISER, PENDING} from '../../constants/user';
import localization from '../../localization';
import Link from 'react-router-dom/es/Link';

class CreateAdvertiserPage extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillUnmount() {
    this.props.actions.resetFormState();
  }

  render() {
    return (
      <Fragment>
        <div className="create-advertiser-page">
          <Link to={'#'} className="go-back_link" onClick={this.props.history.goBack}>{localization.advertisers.goBack}</Link>
          <CreateAdvertiserForm {...this.props} countries={this.props.countries} onSubmit={this.handleSubmit} btnName={localization.forms.create}/>
        </div>
      </Fragment>
    );
  }

  async handleSubmit(formData) {
    delete formData.confirmPassword;
    formData.role = ADVERTISER;
    formData.status = PENDING;

    Object.keys(formData).map((field) => {
      const value = formData[field];
      if (value && typeof value === 'string' || value instanceof String) {
        formData[field] = value.trim();
      }
    });

    const billing = {
      email: formData.billingEmail,
      firstName: formData.billingFirstName,
      lastName: formData.billingLastName,
      address: formData.billingAddress,
      city: formData.billingCity,
      // zipCode: formData.billingZipCode,
      country: formData.billingCountry,
      isCorporation: formData.billingIsCorporation,
      companyName: formData.billingCompanyName,
      companyAddress: formData.billingCompanyAddress,
      companyCity: formData.billingCompanyCity,
      companyZipCode: formData.billingCompanyZipCode,
      zipCode: formData.billingCompanyZipCode && formData.billingCompanyZipCode.trim(),
      taxId: formData.billingTaxId,
      companyCountry: formData.billingCompanyCountry,
    };
    for (const key in billing) {
      if (!billing[key]) delete billing[key];
    }
    formData.billing = billing;
    const user = await this.props.actions.createAdvertiser(formData)
        .then((res) => {
          /*                let {id} = res.user;
                let {billing} = formData;
                billing.userId = id;
                this.props.actions.createBillingDetailsByAdmin(billing);*/
          this.props.history.push('/advertisers');
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
}

const mapStateToProps = (state) => ({
  users: state.users.usersList,
  managers: state.users.managers,
  countries: state.countries,
  auth: state.auth,
  app: state.app,
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    createAdvertiser,
    createBillingDetailsByAdmin,
    createBillingDetails,
    resetFormState,
  }, dispatch),
  dispatch,
});

CreateAdvertiserForm.propTypes = {
  actions: PropTypes.object,
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateAdvertiserPage);
