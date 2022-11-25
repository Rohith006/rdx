import React, {Fragment} from 'react';
import {reduxForm} from 'redux-form';
import {connect} from 'react-redux';
import EditForm from '../AdminUsersForm';
import {ADMIN, OWNER} from '../../../constants/user';
import {PERMISSIONS, RULES} from '../../../constants/app';
import localization from '../../../localization';
import Link from 'react-router-dom/es/Link';
import {validateUserForm} from '../../../utils/common';


class EditorForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedCompanyCountry: null,
      selectCountryData: [],
    };

    this.onSelectCompanyCountryChange = this.onSelectCompanyCountryChange.bind(this);
    this.setPermissions = this.setPermissions.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.newUserValues) return;
    const role = this.props.newUserValues.role;
    if (prevProps.newUserValues.role !== role) {
      [OWNER, ADMIN].includes(role) ? this.setPermissions(true) : this.setPermissions(false);
    }
  }

  setPermissions(value) {
    const {change} = this.props;
    RULES.map((item) => {
      change(item, value);
    });
    PERMISSIONS.map((item) => {
      change(item, true);
    });
  }

  render() {
    return (
      <Fragment>
        <div className="create-admin-page">
          <Link to='/users' className="go-back_link">{localization.users.goBack}</Link>
          <EditForm {...this.props} renderField={renderField}
            formTitle={localization.users.form.updateUser}
            selectCountryData={this.state.selectCountryData}
            selectedCompanyCountry={this.state.selectedCompanyCountry}
            onSelectCompanyCountryChange={this.onSelectCompanyCountryChange}
            isEdit={true}/>
        </div>
      </Fragment>
    );
  }

  static getDerivedStateFromProps(nextProps) {
    if (nextProps.countries.countriesList.length) {
      return {
        selectCountryData: [
          {value: null, label: '-'},
          ...nextProps.countries.countriesList.map((country) => ({
            value: country.alpha2Code,
            label: country.name,
          })),
        ],
      };
    } else {
      return null;
    }
  }

  onSelectCompanyCountryChange(selectedCompanyCountry) {
    this.setState({
      selectedCompanyCountry: selectedCompanyCountry.value ? selectedCompanyCountry : null,
    });
    this.props.change('companyCountry', selectedCompanyCountry.value);
  }
}

const renderField = ({input, label, type, meta: {touched, error, warning}}) => (
  <div className={'form__text-field' + (touched && error ? ' errored' : '')}>
    <div className="form__text-field__wrapper">
      <span className="form__text-field__name//remove" style={{fontFamily:'Montserrat',fontWeight:500,fontSize:'14px',lineHeight:'21px',color:'#444444'}}>{label}</span>
      <input {...input} placeholder={label} type={type}/>
      <div className="form__text-field__error">
        <span>{error}</span>
      </div>
    </div>
  </div>
);

const validate = (values) => {
  return validateUserForm(values);
};

EditorForm = reduxForm({
  form: 'user',
  validate,
})(EditorForm);

EditorForm = connect(
    (state) => ({
      initialValues: state.users.currentUser || {},
    }),
)(EditorForm);

export default EditorForm;
