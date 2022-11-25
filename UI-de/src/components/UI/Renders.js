import React from 'react';
import classNames from 'classnames';

export const renderRegularText = (props) => {
  const {input, title, meta: {touched, error}, onChange, className, tooltip} = props;
  return (
    <div className={classNames(`form__text-field ${className}`, {' errored': touched && error})}>
      <div className="form__text-field__wrapper">
        <span className="form__text-field__name">
          {title}
          {
            tooltip && (
              <div className="tooltip info">
                <span className="tooltiptext">{tooltip}</span>
              </div>
            )
          }
        </span>
        <input

          {...input}
          autoComplete="off"
          type="text"
          name={input.name}
        />
        <div className="form__text-field__error">
          <span>{touched && error}</span>
        </div>
      </div>
    </div>
  );
};
