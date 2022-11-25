import React from 'react';
import classNames from 'classnames';
import {Field} from 'redux-form';

class CustomLifespan extends React.Component {
  constructor(props) {
    super(props);
    this.renderTextField = this.renderTextField.bind(this);
  }

  renderTextField({input, placeholder, disabled, meta: {touched, error}, onNumberFieldChange}) {
    return (
      <div className={classNames({' errored': touched && error})}>
        <input {...(onNumberFieldChange ? {...input, onChange: (e) => onNumberFieldChange(e, input.onChange)} : input)}
          type="text"
          placeholder={placeholder}
          disabled={disabled}
          className='input-sm ml2'
          onClick={() => this.props.change('clicksLifespan', null)}
        />
      </div>
    );
  }

  render() {
    return (
      <div className="input-md">
        <Field name="customLifespan" component={this.renderTextField} placeholder="0s-h-d-w"/>
      </div>
    );
  }
}

export default CustomLifespan;
