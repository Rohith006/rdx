import React from 'react';
import classNames from 'classnames';

const TextareaField = ({input, title, readOnly, meta, className}) =>
  (
    <div className={classNames('form__text-field', {' errored': meta && meta.touched && meta.error})}>
      <div className="form__text-field__wrapper">
        <span className="form__text-field__name">{title}</span>
        <textarea id={input.name} autoComplete="off" readOnly={readOnly} {...input} />
        <div className="form__text-field__error">
          <span>{meta && meta.touched && meta.error}</span>
        </div>
      </div>
    </div>
  );
export default TextareaField;
