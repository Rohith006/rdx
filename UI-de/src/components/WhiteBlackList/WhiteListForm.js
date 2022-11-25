import React from 'react';
import {Field, reduxForm} from 'redux-form';
import Select from 'react-select';
import classNames from 'classnames';
import GridList from './Grid';
import localization from '../../localization';

const columnDefsWlist = [
  {headerName: localization.users.table.name, field: 'name', headerClass: 'ag-grid-header-cell'},
  {headerName: localization.users.table.payout, field: 'payout', headerClass: 'ag-grid-header-cell'},
  {headerName: 'Edit', field: 'userEditor', cellRenderer: 'renderEditor', width: 30},
];
const validate = ({payout}) => {
  const errors = {};
  if (!payout) {
    errors.payout = localization.validate.required;
  }
  if (payout > 100 || payout < 0) {
    errors.payout = 'must be between 0 - 100';
  }
  return errors;
};

class WhiteListForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedPublisher: null,
    };
    this.renderSelectField = this.renderSelectField.bind(this);
    this.renderTextField = this.renderTextField.bind(this);
    this.onPublisherSelect = this.onPublisherSelect.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onPublisherSelect(selectedPublisher) {
    this.setState({selectedPublisher});
    this.props.change('publisherId', selectedPublisher.value);
  }

  onNumberFieldChange(e, onChange) {
    const value = e.target.value;
    /^\d*\.?\d{0,2}$/.test(value) || !value ? onChange(e) : e.preventDefault();
  }

  onSubmit() {
    const {handleSubmit, reset, invalid} = this.props;
    handleSubmit();
    this.setState({selectedPublisher: null});
    if (!invalid) {
      reset();
    }
  }

  render() {
    return (
      <div className="card_body w100">
        <div className="card_body-item w100">
          <div className="form-group w100 ">
            <p className="form__text-field__name">Whitelist</p>
            <div className="form-group_row">
              <Field name="publisherId"
                component={this.renderSelectField}
                selectedPublisher={this.state.selectedPublisher || {}}
                selectPublisherData={this.props.options}/>
              <Field component={this.renderTextField}
                name="payout" placeholder={'%'}
                onNumberFieldChange={this.onNumberFieldChange}/>
              <span className="btn light-blue ml2" onClick={this.onSubmit} style={{marginBottom: '17px'}}>Add</span>
            </div>
            <GridList {...this.props} columnDefs={columnDefsWlist}/>
          </div>
        </div>
      </div>
    );
  }

  renderSelectField({input, title, selectedPublisher, selectPublisherData}) {
    return (
      <div className={'form__text-field input-md'}>
        <div className="form__text-field__wrapper">
          <Select name={input.name} className="text-input__select"
            options={selectPublisherData} onChange={this.onPublisherSelect}
            placeholder="Select publisher" value={selectedPublisher}/>
        </div>
      </div>
    );
  }

  renderTextField({input, meta: {touched, error}, placeholder, onNumberFieldChange}) {
    return (
      <div className={classNames({'form__text-field__wrapper input-sm': touched && error})}>
        <input {...(onNumberFieldChange ? {...input, onChange: (e) => onNumberFieldChange(e, input.onChange)} : input)}
          type="text" autoComplete="off" placeholder={placeholder}/>
        <div className="input-error-wrapper__error-container">
          <span>{touched && error}</span>
        </div>
      </div>
    );
  }
}

export default reduxForm({
  form: 'WhiteListForm',
  fields: Field,
  validate,
})(WhiteListForm);
