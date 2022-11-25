import React, { Component, Fragment } from "react";
import { Field, reduxForm } from "redux-form";
import ButtonRegular from "../UI/ButtonRegular";
import Link from "react-router-dom/es/Link";
import {NotificationManager} from "react-notifications";
import {
  MEDIA_BUYING_TEAM,
  AD_NETWORK,
  AFFILIATE_NETWORK,
  AD_AGENCY,
  SSP,
  OWNER,
  ADMIN,
  ACCOUNT_MANAGER,
} from "../../constants/user";
import CustomSelect from "../common/Views/Select";
import localization from "../../localization";
import { CPC, PUBLIC } from "../../constants/campaigns";
import Select from "react-select";
import IntegrationPage from "../IntegrationPage";
import _, { constant, lte } from "lodash";
import { strongPassRegex } from "../../utils/regExp";
import { required, isEmail,arrayChecker } from "../../utils/validatorUtils";
import { ORTB } from "../../constants/common";
import { normalizeNumber } from "../../utils/normalizers";
import DisplayCheck from "../../permissions";
import { Tabs, Tab, TabPanel, TabList } from "react-web-tabs";
import { styles } from "../UI/selectStyles";


const validate = (values, { action }) => {
  const errors = {};
  if (!values.tmax) {
    errors.tmax = localization.validate.required;
  }
  if (!/^\d+$/.test(values.tmax)) {
    errors.tmax = localization.validate.integersOnly;
  }
  if (values.tmax > 1000) {
    errors.tmax = localization.formatString(
      localization.validate.maxValue,
      1000
    );
  }
  if (action === "create") {
    if (!values.password) {
      errors.password = localization.validate.emptyPasswordField;
    }
  }
  if (values.password) {
    if (!strongPassRegex.test(values.password)) {
      errors.password = localization.validate.passwordLong;
    }
  }
  if (values.password !== values.confirmPassword) {
    errors.confirmPassword = localization.validate.passwordMatch;
  }
  return errors;
};

var firstError;
const onSubmitFail = (errors) => {
  if (errors) {
    firstError = Object.keys(errors);
    if(firstError.length <= 2){
      NotificationManager.error(`Must fill ${firstError} fields`)
    } else{
      NotificationManager.error(`Must fill all the required fields...`)
    }
    const el = document.querySelector(`[name="${firstError}"]`);
    // NotificationManager.error(`Must fill required fields ${firstError}`)
    const position =
      el &&
      el.getBoundingClientRect().top + document.documentElement.scrollTop;
    const offset = 50;
    window.scrollTo({ top: position - offset, behavior: "smooth" });
  }
}

class CreatePublisherForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedManager: null,
      managerId: null,
      selectCountryData: [],
      country: "",
      selectAccountTypeData: [
        { value: MEDIA_BUYING_TEAM, label: "Media Buying Team" },
        { value: AD_NETWORK, label: "Ad Network" },
        { value: AFFILIATE_NETWORK, label: "Affilate Network" },
        { value: AD_AGENCY, label: "Ad Agency" },
        { value: SSP, label: "SSP" },
      ],
      type: [],
      selectCampaignsData: [],
      tabID: "one",
    };
    this.renderTextField = this.renderTextField.bind(this);
    this.onPropsChange = this.onPropsChange.bind(this);
    this.onChangeManager = this.onChangeManager.bind(this);
    this.onSelectChange = this.onSelectChange.bind(this);
    this.setPublisherDataToState = this.setPublisherDataToState.bind(this);
    this.onFileUpload = this.onFileUpload.bind(this);
    this.onNumberFieldChange = this.onNumberFieldChange.bind(this);
    this.onCHangeTab = this.onCHangeTab.bind(this);
  }

  componentDidUpdate(prevProps) {
    const { formData, initialValues, change } = this.props;
    if (prevProps.initialValues !== initialValues) {
      this.setPublisherDataToState();
    }
  }
  
  componentDidMount() {
    const { countries, user } = this.props;
    this.setPublisherDataToState();
    const selectCountryData = countries.countriesList.map((country) => ({
      value: country.alpha2Code,
      label: country.name,
    }));
    this.setState({ selectCountryData });
  }
  
  componentWillUnmount() {
    const { reset } = this.props;
    reset();
    firstError = []; // reset errors
  }

  onChangeManager(selectedManager) {
    this.props.change("managerId", selectedManager.value);
    this.setState({
      selectedManager: selectedManager.value ? selectedManager : null,
    });
  }

  onPropsChange(name, value) {
    this.props.change(name, value);
  }

  renderTextField({ input, title, type, meta: { touched, error } }) {
    return (
      <div
        className={"form__text-field" + (touched && error ? " errored" : "")}
      >
        <div className="form__text-field__wrapper">
          <span className="form__text-field__name">{title}</span>
          <input {...input} type={type} checked autoComplete="new-password" />
          <div className="form__text-field__error">
            <span>{touched && error}</span>
          </div>
        </div>
      </div>
    );
  }

  renderRadioField({ input, title, type }) {
    return (
      <div className="form__description__fields__radio-field">
        <input id={title} {...input} type={type} className="custom-radio" />
        <label htmlFor={title}>
          <span /> {title}{" "}
        </label>
      </div>
    );
  }

  setPublisherDataToState() {
    const { initialValues, managers, countries } = this.props;

    if (!initialValues) return;

    const selectedManager = managers.filter(
      (manager) => manager.id === initialValues.managerId
    )[0];
    const country = countries.countriesList.filter(
      (country) => country.alpha2Code === initialValues.country
    )[0];
    const type = this.state.selectAccountTypeData.filter(
      (type) => type.value === initialValues.type
    )[0];

    const stateData = Object.assign(
      {},
      country && {
        country: { value: country.alpha2Code, label: country.name },
      },
      selectedManager && { selectedManager },
      type && { type }
    );

    this.setState(stateData);
  }

  onSelectChange(field, data) {
    this.setState({
      [field]: data.value ? data : null,
    });
    this.props.change(field, data.value);
  }

  onFileUpload(fileType, data) {
    this.props.change(fileType, data);
  }

  onNumberFieldChange(e, onChange) {
    const value = e.target.value;
    /^\d*\.?\d{0,8}$/.test(value) ? onChange(e) : e.preventDefault();
  }

  onCHangeTab(e) {
    this.setState({ tabID: e.target.value });
    window.scrollTo(0,0)
    if(e.target.value==="two")
      firstError=[];
  }

  render() { 
    const user = this.props.initialValues;
    const { action, formData } = this.props;
    let errArray = [ 'name', 'email', 'password']
    const checkForm = arrayChecker(errArray, firstError)
    
    return (
      <Fragment>
        <form className="form card" onSubmit={this.props.handleSubmit}>
          <Tabs defaultTab={checkForm===true && this.state.tabID==="two"?this.setState({tabID: "one"}):this.state.tabID} onChange={(tabId) => {}}>
            <TabList>
              <Tab type="button" tabFor="one" type="button" onClick={this.onCHangeTab} value="one">                
                { action === "create" ? (
                  <div 
                  style = {{color: `${checkForm == true ? 'red' : 'rwt__tab'}`}} 
                  >{localization.publishers.createPublisher.title}</div>
                ) : ( 
                  <div>{localization.publishers.updatePublisher.title}</div>
                )}
              </Tab>
              <Tab type="button" tabFor="two" type="button" onClick={this.onCHangeTab} value="two">
                {localization.header.nav.integration}
              </Tab> 
            </TabList>
            <TabPanel type="button" tabId="one" >
              <div className="form_body" style={{ marginTop: "-32px" }}>
                <div className="form_body-item" style={{ width: "100%" }}>
                  <div className="card_body">
                    <div style={{ display: "flex" }}>
                      <Field
                        type="text"
                        name="name"
                        title={localization.forms.name}
                        component={this.renderTextField}
                        
                        validate={[required]}
                      />
                      <Field
                        type="text"
                        name="email"
                        title={localization.forms.email}
                        component={this.renderTextField}
                        validate={[required, isEmail]}
                        
                      />
                    </div>

                    <div style={{ display: "flex" }}>
                      <Field
                        type="password"
                        name="password"
                        title={localization.forms.password}
                        component={this.renderTextField}
                        validate={user ? null : required}
                      />
                      <Field
                        type="password"
                        name="confirmPassword"
                        title={localization.forms.confirmPassword}
                        component={this.renderTextField}
                        validate={user ? null : required}
                      />
                    </div>

                    <div style={{ display: "flex" }}>
                      <div style={{ width: "50%", marginRight: "32px" }}>
                        <Field 
                          type="text"
                          name="skype"
                          title={localization.forms.skype}
                          component={this.renderTextField}
                          className="input_text_field"
                        />{" "}
                      </div>
                      <div style={{ display: "flex", width: "50%" }}>
                        <Field
                          type="text"
                          name="payout"
                          title={localization.forms.payout}
                          component={this.renderTextField}
                          normalize={normalizeNumber}
                        />
                        <DisplayCheck roles={[OWNER, ADMIN]}>
                          <CustomSelect
                            name="managerId"
                            label={localization.forms.manager}
                            options={this.props.managers}
                            value={this.state.selectedManager}
                            onChange={this.onChangeManager}
                          />
                        </DisplayCheck>
                      </div>
                    </div>
                    <div style={{ display: "flex" }}>
                      <Field
                        type="text"
                        name="companyName"
                        title={localization.forms.companyName}
                        component={this.renderTextField}
                        className="input_text_field"
                      />
                      <Field
                        type="text"
                        name="city"
                        title={localization.account.city}
                        component={this.renderTextField}
                      />
                    </div>
                    <div className="form__text-field" style={{ width: "49%" }}>
                      <div className="form__text-field__wrapper">
                        <span className="form__text-field__name">
                          {localization.account.country}
                        </span>
                        <Select
                          options={this.state.selectCountryData}
                          value={this.state.country}
                          name="country"
                          onChange={(data) =>
                            this.onSelectChange("country", data)
                          }
                          styles={styles}
                          theme={(theme) => ({
                            ...theme,
                            colors: {
                              ...theme.colors,
                              primary: "#000000",
                            },
                          })}
                        />
                      </div>
                    </div>
                    <div style={{ width: "49%" }}>
                      <Field
                        type="text"
                        name="address"
                        title={localization.account.address}
                        component={this.renderTextField}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="Btn_Container">
                <button
                  className="btn light-blue"
                  onClick={this.props.history.goBack}
                  style={{
                    marginRight: "16px",
                    width: "115px",
                    height: "40px",
                    paddingTop: "10px",
                  }}
                >
                  {localization.forms.cancel}
                </button>
                <button
                  type="button"
                  value="two"
                  onClick={this.onCHangeTab}
                  className="btn neutral"
                >
                  Next
                </button>
              </div>
            </TabPanel>

            <TabPanel type="button" tabId="two">
              <div className="form_body" style={{ marginTop: "-32px" }}>
                <div className="form_body-item">
                  <IntegrationPage
                    {...this.props}
                    propsChange={this.onPropsChange}
                    user={user}
                    action={this.props.action}
                    change={this.props.change}
                    onNumberFieldChange={this.onNumberFieldChange}
                  />
                </div>
              </div>
              <div className="form_submit-btn">
                <Link
                  to={"#"}
                  className="btn white"
                  style={{ marginRight: "16px", paddingTop: 10 }}
                  onClick={this.props.history.goBack}
                >
                  {localization.forms.cancel}
                </Link>
                <ButtonRegular
                  width="115px"
                  height="40px"
                  type="submit"
                  color="primary-red"
                  onclick = {this.submitError}
                >
                  Save
                </ButtonRegular>
              </div>
            </TabPanel>
          </Tabs>
        </form>
      </Fragment>
    );
  }
}

export default reduxForm({
  form: "CreatePublisherForm",
  // saveButton,
  onSubmitFail,
  validate,
})(CreatePublisherForm);
