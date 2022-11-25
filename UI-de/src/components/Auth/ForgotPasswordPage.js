import React, {Component, Fragment} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {SubmissionError} from 'redux-form';
import PropTypes from 'prop-types';
import ForgotPasswordForm from '../forms/ForgotPasswordForm';
import {restorePassword, resetForgotPasswordState} from '../../actions/forgotPassword';
import Message from '../UI/Message';

class ForgotPasswordPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  render() {
    return (
      <Fragment>
        <div className="forgot-password-page">
          <div className="forgot-password-page__container">
            {
              this.props.forgotPassword.showForgotPasswordSuccessMessage ?
                <Message
                  h1="Please check your email"
                  p={`We've sent you email to ${this.state.email} with a link to reset your password.`}
                /> :
              <ForgotPasswordForm onSubmit={this.handleSubmit}/>
            }
          </div>
        </div>
      </Fragment>
    );
  }

  componentDidMount() {
    this.props.actions.resetForgotPasswordState();
  }

  handleSubmit(formData) {
    this.setState({email: formData.email});

    return this.props.actions.restorePassword({
      ...formData,
    }).catch((err) => {
      const {message} = err.response.data;

      throw new SubmissionError({
        email: message,
      });
    });
  }
}

const mapStateToProps = (state) => ({
  forgotPassword: state.forgotPassword,
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    restorePassword,
    resetForgotPasswordState,
  }, dispatch),
});

ForgotPasswordPage.propTypes = {
  actions: PropTypes.object,
};

export default connect(mapStateToProps, mapDispatchToProps)(ForgotPasswordPage);
