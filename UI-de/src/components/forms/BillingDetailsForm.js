import React, {Component} from 'react';
import {reduxForm, Field} from 'redux-form';
import Select from 'react-select';
import ButtonRegular from '../UI/ButtonRegular';
import * as EmailValidator from 'email-validator';
import localization from '../../localization';

const zipCodeValidationRegexp = /^(?=.{0,10}$)[a-z0-9]+(?:[\s-][a-z0-9]+)?$/i;

const validate = (values) => {
  const {firstName, lastName, email, isCorporation, zipCode, companyName, companyZipCode} = values;
  const errors = {};

  if (!firstName) {
    errors.firstName = localization.validate.required;
  }
  if (!lastName) {
    errors.lastName = localization.validate.required;
  }
  if (!email) {
    errors.email = localization.validate.required;
  }
  if (email && !EmailValidator.validate(email)) {
    errors.email = localization.validate.invalidEmail;
  }
  if (isCorporation && !companyName) {
    errors.companyName = localization.validate.required;
  }
  if (!(zipCodeValidationRegexp.test(zipCode))) {
    errors.zipCode = localization.validate.zipCode;
  }
  if (!(zipCodeValidationRegexp.test(companyZipCode))) {
    errors.companyZipCode = localization.validate.zipCode;
  }

  return errors;
};

const upper = (value) => value && value.toUpperCase();

const maxLength = (value) => value && value.length > 10 ? localization.formatString(localization.validate.maxLength, 10) : undefined;

class BillingDetailsForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hideCorporationFields: false,
      selectedCountry: null,
      selectedCompanyCountry: null,
      selectCountryData: [],
    };

    this.renderCheckboxField = this.renderCheckboxField.bind(this);
    this.onSelectCountryChange = this.onSelectCountryChange.bind(this);
    this.onSelectCompanyCountryChange = this.onSelectCompanyCountryChange.bind(this);
  }

  render() {
    return (
      <form className="form card" onSubmit={this.props.handleSubmit}>
        <div className="form_body">
          <div className="form_body-item">
            <div className="card_header bordered">
              <h2 className="heading"> {localization.billingDetails.title}</h2>
            </div>
            <div className="card_body">
              <Field type="text" name="firstName" title={localization.billingDetails.form.firstName} component={this.renderTextField}/>
              <Field type="text" name="lastName" title={localization.billingDetails.form.lastName} component={this.renderTextField}/>
              <Field type="text" name="email" title={localization.forms.email} component={this.renderTextField}/>
              <Field type="text" name="address" title={localization.billingDetails.form.address} component={this.renderTextField}/>
              <Field type="text" name="city" title={localization.billingDetails.form.city} component={this.renderTextField}/>
              {/* <Field type="text" name="country" title="Country" component={ this.renderTextField } />*/}
              <div className="form__text-field">
                <div className="form__text-field__wrapper">
                  <div className="form__text-field__name-wrapper">
                    <span className="form__text-field__name">{localization.billingDetails.form.country}</span>
                  </div>
                  <div className="form__text-field__input-wrapper">
                    <Select options={this.state.selectCountryData} value={this.state.selectedCountry} onChange={this.onSelectCountryChange}/>
                  </div>
                </div>
              </div>
              <Field type="text" name="zipCode" title={localization.billingDetails.form.zipcode} component={this.renderTextField} normalize={upper} validate={maxLength}/>
            </div>
          </div>
          <div className="form_body-item">
            <div className="card_body">
              <Field type="checkbox" name="isCorporation" title={localization.billingDetails.form.corporation} component={this.renderCheckboxField}/>
              <div className={'form__with-corporation' + (!this.state.hideCorporationFields ? ' disabled' : '')}>
                <Field type="text" name="companyName" title={localization.forms.companyName} component={this.renderTextField}/>
                <Field type="text" name="companyAddress" title={localization.billingDetails.form.billingAddress} component={this.renderTextField}/>
                <Field type="text" name="companyCity" title={localization.billingDetails.form.city} component={this.renderTextField}/>
                {/* <Field type="text" name="companyCountry" title="Country" component={ this.renderTextField } />*/}
                <div className="form__text-field">
                  <div className="form__text-field__wrapper">
                    <div className="form__text-field__name-wrapper">
                      <span className="form__text-field__name">{localization.billingDetails.form.companyCountry}</span>
                    </div>
                    <div className="form__text-field__input-wrapper">
                      <Select options={this.state.selectCountryData} value={this.state.selectedCompanyCountry} onChange={this.onSelectCompanyCountryChange}/>
                    </div>
                  </div>
                </div>
                <Field type="text" name="companyZipCode" title={localization.billingDetails.form.zipcode} component={this.renderTextField} normalize={upper} validate={maxLength}/>
                <Field type="text" name="taxId" title={localization.billingDetails.form.vatTax} component={this.renderTextField}/>
              </div>
            </div>
          </div>
        </div>
        <div className="form_submit-btn">
          <ButtonRegular type="submit" color="dark-blue mr2">{localization.forms.submit}</ButtonRegular>
        </div>
      </form>
    );
  }

  static getDerivedStateFromProps(nextProps) {
    if (nextProps.countries.countriesList.length) {
      return {
        selectCountryData: [
          {value: null, label: '-'},
          ...nextProps.countries.countriesList.map((country) => ({
            value: country.alpha2Code,
            label: country.name,
          })),
        ],
      };
    } else {
      return null;
    }
  }

  renderTextField({input, title, type, meta: {touched, error}}) {
    return (
      <div className={'form__text-field' + (touched && error ? ' errored' : '')}>
        <div className="form__text-field__wrapper">
          <div className="form__text-field__name-wrapper">
            <span className="form__text-field__name">{title}</span>
          </div>
          <div className="form__text-field__input-wrapper">
            <input {...input} type={type}/>
            <div className="form__text-field__error">
              <span>{touched && error}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderCheckboxField({input, input: {onChange}, title, type}) {
    return (
      <div className="form__checkbox-field checkbox-control">
        <div className="form__checkbox-field__wrapper">
          <input {...input} onChange={(e) => {
            this.setState({hideCorporationFields: e.target.checked});
            onChange(e);
          }} id="is-campaign" type={type}/>
          <label htmlFor="is-campaign">
            <span className="checkbox-control__indicator"/>
            <span>
              {title}
            </span>
          </label>
        </div>
      </div>
    );
  }

  onSelectCountryChange(selectedCountry) {
    this.setState({
      selectedCountry: selectedCountry.value ? selectedCountry : null,
    });
    this.props.change('country', selectedCountry.value);
  }

  onSelectCompanyCountryChange(selectedCompanyCountry) {
    this.setState({
      selectedCompanyCountry: selectedCompanyCountry.value ? selectedCompanyCountry : null,
    });
    this.props.change('companyCountry', selectedCompanyCountry.value);
  }
}

export default reduxForm({
  form: 'BillingDetailsForm',
  validate,
})(BillingDetailsForm);
