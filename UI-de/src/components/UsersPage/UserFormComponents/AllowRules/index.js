import React from 'react';
import {OWNER} from '../../../../constants/user';
import {ACCOUNT_MANAGER, PERMISSIONS, RULES} from '../../../../constants/app';
import localization from '../../../../localization';
import classNames from 'classnames';
import {Sector} from '../userFormFields';

const AllowRules = (props) => {
  const {newUserValues} = props;
  const role = newUserValues && newUserValues.role;
  const classSectorRules = classNames({
    'form__text-field form__description': true,
    'hidden': [OWNER, ACCOUNT_MANAGER].includes(role),
  });

  return (
    <div className="form_body-item userRulesContainer">
      {
        role === OWNER ?
          <div className='form__text-field userRulesTitle'>
            <div className="form__description__title">All permissions</div>
          </div> : null
      }
      {
        role === ACCOUNT_MANAGER ?
          <div className='form__text-field userRulesTitle'>
            <div className="form__description__title">Manager can see advertiser and publisher assigned to him</div>
          </div> : null
      }
      {
        role === ACCOUNT_MANAGER ?
          <div className="form__text-field userRulesTitle">
            <div className="form__description__title" style={{fontFamily:'Montserrat',fontWeight:600,fontSize:'14px',lineHeight:'21px',}}>{localization.users.form.sectors}:</div>
            <div className="userDivFlex">
            {
              PERMISSIONS.map((item) => {
                return <Sector item={item} key={item} role={role}/>;
              })
            }
            </div>
          </div> : null
      }
      <div className='userRulesCheck' >
        <div className="form__description__title userRole">{localization.users.form.rules}:</div>
        <div className="userDivFlex">
            {
            RULES.map((item) =>
                <Sector item={item} key={item} role={role}/>,
            )
            }
        </div>
      </div>
    </div>
  );
};

export default AllowRules;
