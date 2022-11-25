import React from 'react';
import Rules from './rules';
import FormData from './formInfo';

const LeftSideFormUser = (props) => {
  return (
    <div className="form_body-item card_body">
      <FormData {...props}/>
      {
         __WLID__ !== '15' ? <Rules {...props}/> : null
      }
    </div>
  );
};

export default LeftSideFormUser;
