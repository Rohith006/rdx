import Select from 'react-select';
import React from 'react';

export function renderSelectField({input, options, onChange, value}) {
  return (
    <div className={'form__text-field input-md'}>
      <div className="form__text-field__wrapper">
        <Select
          isMulti
          name={input.name}
          options={options}
          onChange={onChange}
          placeholder="Select publisher" value={value}
        />
      </div>
    </div>
  );
}

export function renderTitle({title}) {
  return (
    <div className='form__text-field input-md'>
      {title}
    </div>
  );
}

export function renderCheckboxField({input, id, handleClick, handleDelete, checked, color}) {
  return (
    <div className="checkbox-control reports">

      <input
        {...input}
        type="checkbox"
        id={id}
        className="val"
        name={input.name}
        checked={checked}
        onChange={(e) => {
          handleClick(id);
          input.onChange(e);
        }}/>

      <label htmlFor={id}>
        <span>{input.name}</span>
        <div className="color-box" style={{backgroundColor: color}}></div>
        <div className="checkbox-control__indicator"/>
      </label>

      <svg
        onClick={() => handleDelete(id)}
        height="20"
        width="20"
        viewBox="0 0 20 20"
        aria-hidden="true"
        focusable="false"
        className="cross"
        style={{marginLeft: 'auto', marginRight: '10px'}}>
        <path d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z"></path>
      </svg>
    </div>
  );
}
