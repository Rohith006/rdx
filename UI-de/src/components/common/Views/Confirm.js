import React from 'react';

export default (props) => {
  return (
    <div className="react-modal-body">
      <h1>Are you sure?</h1>
      <p>{props.msg}</p>
      <div style={{marginTop: 20}} className="flex justify-center">
        <span className="btn dark-blue mr2" onClick={() => {
          props.onConfirm();
          props.onClose(true);
        }}>
          Yes
        </span>
        <span className="btn light-blue" onClick={props.onClose}>
          No
        </span>
      </div>
    </div>
  );
};
