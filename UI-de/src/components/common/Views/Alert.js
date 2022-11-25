import React from 'react';

export default (props) => {
  return (
    <div>
      <p>{props.msg}</p>
      <div style={{marginTop: 20, justifyContent: 'center'}} className="flex">
        <span className="btn mr2" onClick={props.onClose}>Ok</span>
      </div>
    </div>
  );
};
