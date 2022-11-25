import React from 'react';
import ButtonRegular from './ButtonRegular';
import Link from 'react-router-dom/Link';
import localization from '../../localization';

const SaveCancel = ({link, name}) => {
  return (
    <div className="form_submit-btn">
      <Link to={link} className="btn light-blue cancel-btn" >
        <span>{localization.forms.cancel}</span>
      </Link>
      <ButtonRegular type="submit" color="dark-blue save-btn" width={102} height={40}>
        <span>{name && 'save'}</span>
      </ButtonRegular>
    </div>
  );
};

export default SaveCancel;
