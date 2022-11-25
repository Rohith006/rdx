import React, { Component } from "react";
import { Field, reduxForm } from "redux-form";
import * as EmailValidator from "email-validator";
import {
  MEDIA_BUYING_TEAM,
  AD_NETWORK,
  AFFILIATE_NETWORK,
  AD_AGENCY,
  SSP,
} from "../../constants/user";
import localization from "../../localization";
import { ButtonRegular, CheckBoxField, TextField } from "../UI";
import Select from "react-select";
import PasswordShow from "../Auth/PasswordShow";
import { strongPassRegex } from "../../utils/regExp";
import { Link } from "react-router-dom";

const validate = (values) => {
  const errors = {};

  if (!values.email) {
    errors.email = localization.validate.required;
  }
  if (values.email && !EmailValidator.validate(values.email.toLowerCase())) {
    errors.email = localization.validate.invalidEmail;
  }
  if (!values.name) {
    errors.name = localization.validate.required;
  }
  if (!values.password) {
    errors.password = localization.validate.required;
  }
  if (!values.confirmPassword) {
    errors.confirmPassword = localization.validate.required;
  }
  if (values.password) {
    if (!strongPassRegex.test(values.password)) {
      errors.password = localization.validate.passwordLong;
    }
  }
  if (values.password !== values.confirmPassword) {
    errors.confirmPassword = localization.validate.passwordMatch;
  }

  return errors;
};

class PublisherSignUpForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectAccountTypeData: [
        { value: MEDIA_BUYING_TEAM, label: "Media Buying Team" },
        { value: AD_NETWORK, label: "Ad Network" },
        { value: AFFILIATE_NETWORK, label: "Affiliate Network" },
        { value: AD_AGENCY, label: "Ad Agency" },
        { value: SSP, label: "SSP" },
      ],
      type: [],
      allowRegistration: false,
    };

    this.handleAgreeToTerms = this.handleAgreeToTerms.bind(this);
  }

  handleAgreeToTerms(e) {
    const { checked } = e.target;
    this.setState({ allowRegistration: checked });
  }

  render() {
    return (
      <form className="form" onSubmit={this.props.handleSubmit}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2px",
          }}
        >
          <Field
            component={TextField}
            type="text"
            name="email"
            title={localization.forms.email}
          />
          <Field
            component={TextField}
            type="text"
            name="name"
            title={localization.forms.name}
          />
          <Field
            component={TextField}
            type="text"
            name="companyName"
            title={localization.forms.companyName}
          />
          <div className="form__text-field">
            <div className="form__text-field__wrapper">
              <span className="form__text-field__name">
                {localization.account.accountType}
              </span>
              <Select
                options={this.state.selectAccountTypeData}
                value={this.state.type}
                name="type"
                onChange={(data) => this.onSelectChange("type", data)}
                styles={{
                  option: (
                    provided,
                    { isFocused, isSelected, isDisabled }
                  ) => ({
                    ...provided,
                    backgroundColor: isDisabled
                      ? null
                      : isSelected
                      ? "#fdd0d5"
                      : isFocused
                      ? "#fee8eb"
                      : null,
                    color: isSelected ? "black" : "black",
                  }),
                }}
                theme={(theme) => ({
                  ...theme,
                  colors: {
                    ...theme.colors,
                    primary: "#000000",
                  },
                })}
              />
            </div>
          </div>
          <Field
            component={TextField}
            type="text"
            name="skype"
            title={localization.forms.skype}
          />
          <Field
            type="password"
            name="password"
            title={localization.forms.password}
            component={PasswordShow}
          />
          <Field
            type="password"
            name="confirmPassword"
            title={localization.forms.confirmPassword}
            component={PasswordShow}
          />
        </div>
        <Field
          component={CheckBoxField}
          onChange={(e) => this.handleAgreeToTerms(e)}
        />
        <div className="agreement">
          <span>
            I have read and agree to the{" "}
            <Link to="/support/terms-and-conditions">Terms and Conditions</Link>{" "}
            and <Link to="/support/privacy-policy">Privacy Policy</Link>
          </span>
        </div>
        <div className="form_submit-btn" style={{ justifyContent: "center" }}>
          <ButtonRegular
            type="submit"
            color="dark-blue"
            width="188px"
            margin="0px 2px"
            disabled={!this.state.allowRegistration}
          >
            {localization.forms.signUp}
          </ButtonRegular>
          <Link to={`/login`} className="adv-pub-name">
            <ButtonRegular type="button" color="dark-blue" width="188px">
              {localization.forms.signIn}
            </ButtonRegular>
          </Link>
        </div>
      </form>
    );
  }

  onSelectChange(field, data) {
    this.setState({
      [field]: data.value ? data : null,
    });
    this.props.change(field, data.value);
  }
}

export default reduxForm({
  form: "PublisherSignUpForm",
  validate,
})(PublisherSignUpForm);
