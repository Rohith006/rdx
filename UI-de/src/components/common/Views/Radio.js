import React from 'react';

const CustomRadio = (props) => (
  <div className={`radio-control pill-control ${props.disable ? 'disabled' : ''}`}>
    <input
      name={props.name}
      type="radio"
      onChange={props.onChangeHandler}
      id={props.id}
      value={props.val}
      checked={props.checked}
    />
    <label htmlFor="exclude">
      <span className="radio-control__indicator"/>
      {props.val}
    </label>
  </div>
);

export default CustomRadio;
