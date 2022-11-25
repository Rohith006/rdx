import React, {Component} from 'react';
import {Field, reduxForm} from 'redux-form';
import {Link} from 'react-router-dom';
import * as EmailValidator from 'email-validator';
import {ButtonRegular, SelectField, TextField} from '../UI';
import localization from '../../localization';
import {ADVERTISER, PUBLISHER} from '../../constants/user';

const validate = (values) => {
  const errors = {};
  if (!values.role) {
    errors.role = localization.validate.required;
  }
  if (!values.email) {
    errors.email = localization.validate.required;
  }
  if (values.email && !EmailValidator.validate(values.email)) {
    errors.email = localization.validate.invalidEmail;
  }
  return errors;
};

class ForgotPasswordForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectRoleData: [
        {label: 'Advertiser', value: ADVERTISER}
       // {label: 'Publisher', value: PUBLISHER},
      ],
    };
  }

  render() {
    return (
      <form className="form" onSubmit={ this.props.handleSubmit }>
        <div className="form_text-field">
          <Field component={SelectField}
            name="role" title={localization.forms.yourRole}
            options={this.state.selectRoleData}
            change={(e) => this.props.change('role', e.value)} />
        </div>
        <Field name="email" type="email" component={TextField} title={localization.forms.email}/>
        <div className="form_submit-btn" style={{justifyContent: 'space-between'}}>
          <ButtonRegular type="submit" color="light-blue btn" width='150px' >{localization.forms.send}</ButtonRegular>
          <Link to={`/login`} className="adv-pub-name">
            <ButtonRegular type="button" color="dark-blue" width='188px'>{localization.forms.signIn}</ButtonRegular>
          </Link>
        </div>
      </form>
    );
  }
}

export default reduxForm({
  form: 'ForgotPasswordForm',
  validate,
})(ForgotPasswordForm);
