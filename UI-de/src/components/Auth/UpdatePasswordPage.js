import React, {Component, Fragment} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {SubmissionError} from 'redux-form';
import {updatePassword} from '../../actions/forgotPassword';
import UpdatePasswordForm from '../forms/UpdatePasswordForm';

class UpdatePasswordPage extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  render() {
    return (
      <Fragment>
        <div className="update-password-page">
          <div className="update-password-page__container card_body">
            <UpdatePasswordForm onSubmit={this.handleSubmit}/>
          </div>
        </div>
      </Fragment>
    );
  }

  handleSubmit(formData) {
    return this.props.actions.updatePassword({
      ...formData,
      restoreKey: this.props.match.params.restoreKey,
    })
        .then(() => setTimeout(() => window.location.href = window.location.origin, 2000))
        .catch((err) => {
          if (err.response.data) {
            const {path, message} = err.response.data;
            throw new SubmissionError({
              [path]: message,
            });
          } else {
            console.error(err);
          }
        });
  }
}

const mapStateToProps = (state) => ({
  forgotPassword: state.forgotPassword,
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    updatePassword,
  }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(UpdatePasswordPage);

