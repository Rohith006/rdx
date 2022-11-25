import React, {Component, Fragment} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {SubmissionError} from 'redux-form';
import AdvertiserSignUpForm from '../forms/AdvertiserSignUpForm';
import {signUp} from '../../actions/auth';
import {AUTH_REQUEST_FULFILLED} from '../../constants/auth';
import {ADVERTISER, PENDING} from '../../constants/user';

class AdvertiserSignUpPage extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  render() {
    return (
      <Fragment>
        <div className="sign-in-page">
          <AdvertiserSignUpForm onSubmit={this.handleSubmit} isRequestPending={this.props.auth.isRequestPending}/>
        </div>
      </Fragment>
    );
  }

  handleSubmit(formData) {
    const {history} = this.props;
    delete formData.confirmPassword;
    formData.role = ADVERTISER;
    formData.status = PENDING;

    return this.props.actions.signUp(formData, history)
        .catch((err) => {
          this.props.dispatch({
            type: AUTH_REQUEST_FULFILLED,
          });
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
  auth: state.auth,
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    signUp,
  }, dispatch),
  dispatch,
});

export default connect(mapStateToProps, mapDispatchToProps)(AdvertiserSignUpPage);
