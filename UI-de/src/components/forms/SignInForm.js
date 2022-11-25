import React, { Component } from "react";
import { Field, reduxForm } from "redux-form";
import { Link, withRouter } from "react-router-dom";
import * as EmailValidator from "email-validator";
import ButtonRegular from "../UI/ButtonRegular";
import localization from "../../localization";
import PasswordShow from "../Auth/PasswordShow";
import Select from "react-select";
import { ADMIN, ADVERTISER, PUBLISHER } from "../../constants/user";
import "./scss/signin-form.scss";
const validate = (values) => {
  const errors = {};

  if (!values.email) {
    errors.email = localization.validate.required;
  }
  if (values.email && !EmailValidator.validate(values.email.toLowerCase())) {
    errors.email = localization.validate.invalidEmail;
  }
  if (!values.password) {
    errors.password = localization.validate.required;
  }

  return errors;
};

class SignInForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selects: {
        selectedRole: null,
        selectRoleData: [
          { label: "Advertiser", value: ADVERTISER },
          { label: "Publisher", value: PUBLISHER },
        ],
      },
    };

    this.renderTextField = this.renderTextField.bind(this);
    this.renderServerError = this.renderServerError.bind(this);
    this.getRole = this.getRole.bind(this);
    this.onDivClick = this.onDivClick.bind(this);

  }

  render() {
    const { state, props } = this;
    const isAdmin = this.getRole();
    return (
      //! TODO move inline styles to seperate scss file
      <form className="form custom-form" onSubmit={props.handleSubmit}>
        <div className="form_title" style={{ margin: "0 auto 30px auto" }}>
          {localization.forms.signInTitle}
        </div>
        {isAdmin ? null : (
          <div className="form_text-field">
            <div className="form_text-field_wrapper">
              <div className="form_text-field_name-wrapper">
                {/* <span className="form_text-field_name">
                  {localization.forms.yourRole}
                </span> */}
              </div>
              <div className="form_text-field_input-wrapper">
              {/* <div style={{backgroundColor:"#fdd0d5",color:'black', border:'1px solid rgba(137, 142, 151, 0.5)',padding: '2% 2%', borderRadius: '3px/3px'}} > Advertiser</div> */}

                {/* <Select
                  options={state.selects.selectRoleData}
                  value={state.selects.selectedRole}
                  onChange={(e) => this.onSelectChange("selectedRole", e)}
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
                /> */}
              </div>
            </div>
          </div>
        )}
        <Field
          type="text"
          name="email"
          title={localization.forms.email}
          component={this.renderTextField}
          className="custom-field"
        />
        <Field
          type="text"
          name="password"
          title={localization.forms.password}
          component={PasswordShow}
        />
        <div className="form_server-error">
          <Field name="serverError" component={this.renderServerError} />
        </div>
        {isAdmin ? <div className="form_submit-btn">
          <ButtonRegular
            type="submit"
            color="primary-red"
            width="188px"
            margin="0 auto"
          >
            {localization.forms.login}
          </ButtonRegular>
        </div> : (
        <div className="form_submit-btn" onClick={this.onDivClick}>
          <ButtonRegular
            type="submit"
            color="primary-red"
            width="188px"
            margin="0 auto"
          >
            {localization.forms.login}
          </ButtonRegular>
        </div>
        )}
        <div className="form_forgot-password" style={{ margin: "0 auto" }}>
          <Link to={`/forgot-password`}>
            {localization.forms.forgotPassword}
          </Link>
        </div>
        {isAdmin ? null : (
          <div
            className="form__register-link"
            style={{ margin: "20px auto 20px auto" }}
          >
            {/* {localization.forms.noAccount}{" "}
            <Link to={`/sign-up`}>{localization.forms.register}</Link> */}
          </div>
        )}
      </form>
    );
  }

  getRole() {
    const href = window.location.href;
    return href.includes(__ADMIN_DOMAIN__);
  }

  renderTextField({ input, title, type, meta: { touched, error } }) {
    return (
      <div
        className={"form__text-field" + (touched && error ? " errored" : "")}
      >
        <div className="form__text-field__wrapper">
          <span className="form__text-field__name">{title}</span>
          <input {...input} type={type} />
          <div className="form__text-field__error">
            <span>{touched && error}</span>
          </div>
        </div>
      </div>
    );
  }

  renderServerError({ meta: { error } }) {
    return <span>{error}</span>;
  }

  onDivClick() {
    this.props.change("role", ADVERTISER);
    this.setState({
        selects:{
          selectedRole: ADVERTISER,
          selectRoleData: [
            { label: "Advertiser", value: ADVERTISER }
          ]
        }
    })
  }
}

export default withRouter(
  reduxForm({
    form: "SignInForm",
    validate,
  })(SignInForm)
);
