import React from 'react';

const CheckBoxField = ({input, title, meta: {touched, error}}) => {
  return (
    <div className="form__checkbox-field checkbox-control">
      <div className="form__checkbox-field__wrapper">
        <input {...input} type="checkbox" id={input.name} className={(touched && error) ? 'errored' : ''}
          name={input.name} checked={input.value} onChange={(e) => input.onChange(e)}/>
        <label htmlFor="2">
          <div className="checkbox-control__indicator"/>
          {title && (<span>{title}</span>)}
        </label>
      </div>
    </div>
  );
};

export default CheckBoxField;
