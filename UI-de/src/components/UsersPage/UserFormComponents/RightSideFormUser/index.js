import React from 'react';
import {OWNER} from '../../../../constants/user';
import {ACCOUNT_MANAGER, PERMISSIONS, RULES} from '../../../../constants/app';
import localization from '../../../../localization';
import classNames from 'classnames';
import {Sector} from '../userFormFields';
import FormData from './forminfo';

const RightSideFormUser = (props) => {
  const {newUserValues} = props;
  const role = newUserValues && newUserValues.role;
  const classSectorRules = classNames({
    'form__text-field form__description': true,
    'hidden': [OWNER, ACCOUNT_MANAGER].includes(role),
  });

  return (
    <div className="form_body-item card_body">
      <FormData {...props}/>
      
    </div>
  );
};

export default RightSideFormUser;
