import React from 'react';
import localization from '../../../../localization';
import { OWNER } from '../../../../constants/user';
import DisplayCheck from '../../../../permissions';
import { Field } from 'redux-form';
import { renderRadioField } from '../userFormFields';
import classNames from 'classnames';
import { ADD_ADMINS } from '../../../../constants/app';

const Rules = (props) => {
  const { form } = localization.users;
  const classSectorRules = classNames({
    '': true,
    'disabled': !props.auth.currentUser.permissions.includes(ADD_ADMINS),
  });

  return (
    <div className="form__text-field">
      <div className="form__text-field__wrapper">
        <div className="form__text-field__name-wrapper userRoleWrapper">
          <span className="form__description__title userRole">{form.roles}</span>
        </div>
        {
          props.auth.currentUser.role === OWNER ?
            <DisplayCheck roles={[OWNER]}>
              <div className="userDivFlex">
              <div className="userRadio">
                <Field
                  type="radio"
                  name="role" title={form.owner}
                  value="OWNER"
                  component={renderRadioField}
                />
              </div>
              <div className="userRadio">
                <Field
                  type="radio"
                  name="role" title={form.administrator}
                  value="ADMIN"
                  component={renderRadioField}
                />
              </div>
              <div className="userRadio">
                <Field
                  type="radio"
                  name="role" title={form.accountManager}
                  value="ACCOUNT_MANAGER"
                  component={renderRadioField}
                />
              </div>
              </div>
            </DisplayCheck> :
            <div className="userDivFlex">
              <div className="userRadio">
                <Field
                  className={classSectorRules}
                  type="radio"
                  name="role"
                  title={form.administrator}
                  value="ADMIN"
                  component={renderRadioField}
                />
              </div>
              <div className="userRadio">
                <Field
                  type="radio"
                  name="role"
                  title={form.accountManager}
                  value="ACCOUNT_MANAGER"
                  component={renderRadioField}
                />
              </div>
            </div>
        }
      </div>
    </div>
  );
};

export default Rules;
