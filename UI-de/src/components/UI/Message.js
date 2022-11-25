import React from 'react';
import {NavLink} from 'react-router-dom';

const Message = (props) => (
  <div>
    <NavLink to={`/login`}>
      <img src="/assets/images/logo.png" className="header_logo-mes" alt=""/>
    </NavLink>
    <div className="message-container">
      <div className="message">
        <div className="h1-message"><h3 className="subheading">{props.h1}</h3></div>
        <div className="p-message"><p>{props.p}</p></div>
      </div>
    </div>
  </div>
);

export default Message;
