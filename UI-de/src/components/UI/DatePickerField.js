import React from 'react'
import DatePicker from 'react-datepicker'
import classNames from 'classnames'
import moment from 'moment'

export default ({
  input,
  onSelect,
  title,
  placeholder = 'YYYY-MM-DD',
  meta: { touched, error },
}) => {
  const dateValue = input.value ? moment(input.value) : null
  const formattedValue = dateValue ? dateValue.format('YYYY-MM-DD') : null

  return (
    <div
      className={classNames('form__text-field', {
        ' errored': touched && error,
      })}
    >
      <div className="form__text-field__wrapper">
        <span className="form__text-field__name">{title}</span>
        <DatePicker
          name={input.name}
          onSelect={onSelect}
          selected={dateValue}
          value={formattedValue}
          onChange={(e) => input.onChange(e)}
          className="form-control"
          placeholderText={placeholder}
          autoComplete="off"
        />
        <div className="form__text-field__error">
          <span>{touched && error}</span>
        </div>
      </div>
    </div>
  )
}
