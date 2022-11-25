import React from 'react';
import classNames from 'classnames';

const TextField = ({input, title, type = 'text', meta, className, ...rest}) =>
  (
    <div className={classNames(`form__text-field ${className}`, {' errored': meta && meta.touched && meta.error})}>
      <div className="form__text-field__wrapper">
        <span className="form__text-field__name">{title}</span>
        <input {...input} type={type} checked autoComplete="off" {...rest} />
        <div className="form__text-field__error">
          <span>{meta && meta.touched && meta.error}</span>
        </div>
      </div>
    </div>
  );

export default TextField;
