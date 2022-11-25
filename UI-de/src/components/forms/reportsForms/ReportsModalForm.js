import React from 'react';
import {Field, reduxForm} from 'redux-form';
import DisplayCheck from '../../../permissions';

const ReportsModalForm = (props) => (
  <form onSubmit={props.handleSubmit} className="reports-modal-form">
    {
      props.columns.map((el) => (
        <DisplayCheck roles={[el.check]}>
          <Field
            name={el.name}
            value={el.value}
            type="checkbox"
            title={el.title}
            component={renderCheckboxField}
            {...props}
            columns={props.columns}
          />
        </DisplayCheck>
      ))
    }
    <button className="btn dark-blue" type="submit">Apply</button>
  </form>
);


function renderCheckboxField({input, change, title, columns, id}) {
  return (
    <div className="checkbox-control reports">
      <input
        type="checkbox"
        id={id}
        className="val"
        name={input.name}
        checked={input.value}
        onChange={(e) => {
          const arr = columns.map((item) => item.value);
          arr.map((item) => change(item, false));
          input.onChange(e);
        }}
      />
      <label htmlFor={id}>
        <span>{title}</span>
        <div className="checkbox-control__indicator"/>
      </label>
    </div>
  );
}


export default reduxForm({
  form: 'ReportsModalForm',
})(ReportsModalForm);
