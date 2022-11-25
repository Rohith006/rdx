import React, { Fragment } from "react";
import { reduxForm } from "redux-form";
import EditForm from "../AdminUsersForm";
import { validate } from "../utils";
import { ADMIN, ACCOUNT_MANAGER, OWNER } from "../../../constants/user";
import { PERMISSIONS, RULES } from "../../../constants/app";
import localization from "../../../localization";
import Link from "react-router-dom/es/Link";

class AddEditForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedCompanyCountry: null,
      selectCountryData: [],
      selectedCampaignType: null,
      selectRole: [
        { label: localization.users.form.owner, value: OWNER },
        { label: localization.users.form.administrator, value: ADMIN },
        {
          label: localization.users.form.accountManager,
          value: ACCOUNT_MANAGER,
        },
      ],
    };

    this.onSelectCompanyCountryChange =
      this.onSelectCompanyCountryChange.bind(this);
    this.setPermissions = this.setPermissions.bind(this);
    this.onSelectRoleChange = this.onSelectRoleChange.bind(this);
  }

  componentDidMount() {
    const { auth } = this.props;
    if (auth.currentUser.role === OWNER) {
      this.props.change("role", OWNER);
    } else {
      this.props.change("role", ADMIN);
    }
    this.setPermissions(true);
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.newUserValues) return;
    const role = this.props.newUserValues.role;
    if (prevProps.newUserValues.role !== role) {
      [ADMIN, OWNER].includes(role)
        ? this.setPermissions(true)
        : this.setPermissions(false);
    }
  }

  setPermissions(value) {
    const { change } = this.props;
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
          <Link to={"/users"} className="go-back_link">
            {localization.users.goBack}
          </Link>
          <EditForm
            {...this.props}
            renderField={renderField}
            selectCountryData={this.state.selectCountryData}
            selectedCompanyCountry={this.state.selectedCompanyCountry}
            onSelectCompanyCountryChange={this.onSelectCompanyCountryChange}
            formTitle={localization.users.form.newUser}
            onChange={(e) => this.onSelectRoleChange("selectedRole", e)}
            selectRole={this.state.selectRole}
            options={this.state.selectRole}
          />
        </div>
      </Fragment>
    );
  }

  static getDerivedStateFromProps(nextProps) {
    if (nextProps.countries.countriesList.length) {
      return {
        selectCountryData: [
          { value: null, label: "-" },
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
      selectedCompanyCountry: selectedCompanyCountry.value
        ? selectedCompanyCountry
        : null,
    });
    this.props.change("companyCountry", selectedCompanyCountry.value);
  }

  onSelectRoleChange(selectedValue, fieldName) {
    const value = { id: selectedValue.value, name: selectedValue.label };
    this.props.change(fieldName, value);
  }
}

const renderField = ({
  input,
  label,
  type,
  meta: { touched, error, warning },
}) => (
  <div className={"form__text-field" + (touched && error ? "  errored" : "")}>
    <div className="form__text-field__wrapper">
      <span className="userField">{label}</span>
      <input {...input} type={type} autoComplete="new-password" />
      <div className="form__text-field__error">
        <span>{touched && error}</span>
      </div>
    </div>
  </div>
);

AddEditForm = reduxForm({
  form: "user",
  validate,
})(AddEditForm);

export default AddEditForm;
