import React, { Component, Fragment } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { SubmissionError } from "redux-form";
import SignInForm from "../forms/SignInForm";
import { signIn } from "../../actions/auth";
import { AUTH_REQUEST_FULFILLED } from "../../constants/auth";
import { NotificationManager } from "react-notifications";
import "./scss/signin-page.scss";
class SignInPage extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.checkPathName = this.checkPathName.bind(this);
  }

  render() {
    return (
      <Fragment>
        <div className="custom-form">
          <div className="logo_cover">
            <img src="/assets/images/desk-logo.png" alt="" />
          </div>
          <div className="sign-in-page">
            <SignInForm
              onSubmit={this.handleSubmit}
              role={this.checkPathName()}
            />
          </div>
        </div>
      </Fragment>
    );
  }

  checkPathName(formData) {
    if (formData && formData.role) {
      return formData.role;
    } else {
      return "admin";
    }
  }

  handleSubmit(formData) {
    const { history } = this.props;
    return this.props.actions
      .signIn(
        {
          ...formData,
          role: this.checkPathName(formData).toUpperCase(),
        },
        history
      )
      .catch((err) => {
        this.props.dispatch({
          type: AUTH_REQUEST_FULFILLED,
        });

        const errors = err.response && err.response.data.errors;

        if (errors) {
          const error = {};
          errors.forEach((err) => {
            error[err.path] = err.message;
          });
          throw new SubmissionError(error);
        } else {
          if (err.response.status === 401) {
            NotificationManager.error("Invalid email or password");
          }
          if (err.response.status === 400) {
            NotificationManager.error("User is not active");
          }
        }
      });
  }
}

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(
    {
      signIn,
    },
    dispatch
  ),
  dispatch,
});

export default connect(null, mapDispatchToProps)(SignInPage);
