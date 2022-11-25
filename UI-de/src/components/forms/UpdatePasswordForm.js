import React, {Component} from 'react';
import {reduxForm, Field} from 'redux-form';
import {Link} from 'react-router-dom';
import {ButtonRegular, TextField} from '../UI';
import localization from '../../localization';

const validate = (values) => {
  const errors = {};

  if (!values.password) {
    errors.password = localization.validate.required;
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = localization.validate.required;
  }

  if (values.password && values.password.length < 6) {
    errors.password = localization.validate.passwordLong;
  } else if (values.password && values.confirmPassword && values.password !== values.confirmPassword) {
    errors.confirmPassword = localization.validate.passwordMatch;
  }

  return errors;
};

class UpdatePasswordForm extends Component {
  render() {
    return (
      <div className="update-password-container">
        <div className="update-password-message">
          <form className="form" onSubmit={ this.props.handleSubmit } style={{marginLeft: '15%', width: '75%'}}>
            <div className="form_title">
              {localization.forms.resetPasswordTitle}
            </div>
            <Field component={ TextField } type="password" name="password" title={localization.forms.newPassword} />
            <Field component={ TextField } type="password" name="confirmPassword" title={localization.forms.confirmPassword} />
            <div className="form__server-error">
              <Field name="serverError" component={ this.renderServerError }/>
            </div>
            <div className="form_submit-btn" style={{justifyContent: 'space-between'}}>
              <ButtonRegular type="submit" color="dark-blue" width='150px'>{localization.forms.save}</ButtonRegular>
              <Link to={`/login`} className="adv-pub-name">
                <ButtonRegular type="button" color="dark-blue" width='150px'>{localization.forms.cancel}</ButtonRegular>
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  renderServerError({meta: {error}}) {
    return (
      <span>{ error }</span>
    );
  }
}

export default reduxForm({
  form: 'UpdatePasswordForm',
  validate,
})(UpdatePasswordForm);
