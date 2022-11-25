import React from 'react';

const RadioField = ({input, id, val, title, checked, disabled}) => {
  return (
    <div className={`radio-control pill-control w-25${disabled ? 'disabled' : ''}`}>
      <input
        {...input}
        type="radio"
        onChange={input.onChange}
        disabled={disabled}
        id={id}
        value={val}
        checked={checked === undefined ? input.value === val : checked}
      />
      <label className="inc" htmlFor={id}>
        <span className="radio-control__indicator"/>
        {title}
      </label>
    </div>
  );
};

export default RadioField;


