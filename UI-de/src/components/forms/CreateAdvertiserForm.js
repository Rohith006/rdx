import React, { Component, Fragment } from "react";
import { Field, reduxForm } from "redux-form";
import classNames from "classnames";
import * as EmailValidator from "email-validator";
import ButtonRegular from "../UI/ButtonRegular";
import Link from "react-router-dom/es/Link";
import CustomSelect from "../common/Views/Select";
import * as userConstants from "../../constants/user";
import localization from "../../localization";
import DisplayCheck from "../../permissions";
import Select from "react-select";
import { Tabs, Tab, TabPanel, TabList } from "react-web-tabs";
import { strongPassRegex } from "../../utils/regExp";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { NotificationManager } from "react-notifications";
import { EDIT } from "../../constants/app";
import { getEndDate, getStartDate } from "../../utils/getPeriodDate";
import { styles } from "../UI/selectStyles";
import { Left } from "react-bootstrap/lib/Media";
import { arrayChecker } from "../../utils/validatorUtils";

const zipCodeValidationRegexp = /^(?=.{0,10}$)[a-z0-9]+(?:[\s-][a-z0-9]+)?$/i;
const showNotification = () => NotificationManager.success(localization.integration.copied);
/* Fields Validation  */
const validate = (values) => {
  const errors = {};
  if (values.password) {
    if (!strongPassRegex.test(values.password)) {
      errors.password = localization.validate.passwordLong;
    }
  }
  if (values.password !== values.confirmPassword) {
    errors.confirmPassword = localization.validate.passwordMatch;
  }
  if (!values.billingCompanyName && values.billingIsCorporation) {
    errors.billingCompanyName = localization.validate.required;
  }
  return errors;
};
const maxLength = (value) =>
  value && value.length > 10
    ? localization.formatString(localization.validate.maxLength, 10)
    : undefined;
const required = (value) =>
  value && value.trim() ? undefined : localization.validate.required;
const isEmail = (value) =>
  EmailValidator.validate(value)
    ? undefined
    : localization.validate.invalidEmail;
const isZipCode = (value) =>
  zipCodeValidationRegexp.test(value)
    ? undefined
    : localization.validate.zipCode;

/* Fields Normalizing */
const upper = (value) => value && value.toUpperCase();
var firstError;
const onSubmitFail = (errors) => {
  if (errors) {
    firstError = Object.keys(errors);
    if (firstError.length <= 2) {
      NotificationManager.error(`Must fill ${firstError} fields`);
    } else {
      NotificationManager.error(`Must fill all the required fields...`);
    }
    window.scrollTo(0, 0);
  }
};

class CreateAdvertiserForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedManager: null,
      selectCountryData: [],
      selectedCompanyCountry: {},
      selectedCountry: {},
      reportUrl: "",
      tabID: "one",
    };
    this.renderTextField = this.renderTextField.bind(this);
    this.onChangeManager = this.onChangeManager.bind(this);
    this.setManager = this.setManager.bind(this);
    this.renderCheckboxField = this.renderCheckboxField.bind(this);
    this.onSelectCountryChange = this.onSelectCountryChange.bind(this);
    this.onSelectCompanyCountryChange = this.onSelectCompanyCountryChange.bind(this);
    this.renderCheckboxFieldSettings = this.renderCheckboxFieldSettings.bind(this);
    this.onChangeTab = this.onChangeTab.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.managers.length !== this.props.managers.length) {
      this.setManager();
    }
    const { currentAdvertiser } = this.props;
    if ( currentAdvertiser && prevProps.currentAdvertiser && currentAdvertiser.apiKey !== prevProps.currentAdvertiser.apiKey) {
      const { change } = this.props;
      this.setState(
        {
          reportUrl: `${__ADVERTISER_API_URL__}/report/dsp?aid=${currentAdvertiser.id}&key=${
            currentAdvertiser.apiKey || "YOUR_API_KEY"}&startDate=${getStartDate()}&endDate=${getEndDate()}`,
        },
        () => change("reportUrl", this.state.reportUrl)
      );
    }
  }

  componentDidMount() {
    const { initialValues, countries } = this.props;
    this.setState({
      hideCorporationFields: initialValues ? initialValues.billingIsCorporation : false,
    });
    this.setManager();
    const selectCountryData = countries.countriesList.map((country) => ({
      value: country.alpha2Code,
      label: country.name,
    }));
    this.setState({ selectCountryData });
    const companyCountry = initialValues
      ? selectCountryData.find((item) => item.value === initialValues.billingCompanyCountry)
      : "";
    const billingCountry = initialValues
      ? selectCountryData.find((item) => item.value === initialValues.billingCountry)
      : "";
    this.setState({ selectedCompanyCountry: companyCountry });
    this.setState({ selectedCountry: billingCountry });
  }

  componentWillUnmount() {
    firstError = []; // reset errors
  }

  static getDerivedStateFromProps(nextProps) {
    if (nextProps.currentAdvertiser) {
      return {
        reportUrl: `${__ADVERTISER_API_URL__}/report/dsp?aid=${nextProps.currentAdvertiser.id}&key=${
          nextProps.currentAdvertiser.apiKey || "YOUR_API_KEY"}&startDate=${getStartDate()}&endDate=${
          getEndDate()}&subId={SUB_ID}`,
      };
    }
    return null;
  }

  setManager() {
    const { initialValues, managers } = this.props;
    if (!initialValues) return;
    const obj = managers.filter((manager) => manager.id === initialValues.managerId)[0];
    this.setState({ selectedManager: obj });
  }

  renderCheckboxFieldSettings({ input, title, meta: { touched, error } }) {
    return (
      <div className="form__checkbox-field checkbox-control">
        <div className="form__checkbox-field__wrapper">
          <input
            {...input}
            type="checkbox"
            id={input.name}
            className={touched && error ? "errored" : ""}
            name={input.name}
            checked={input.value}
            onChange={(e) => {
              input.onChange(e);
            }}
          />
          <label htmlFor="2">
            <div className="checkbox-control__indicator" />
            <span>{title}</span>
          </label>
        </div>
      </div>
    );
  }

  onChangeManager(selectedManager) {
    this.props.change("managerId", selectedManager.value);
    this.setState({
      selectedManager: selectedManager.value ? selectedManager : null,
    });
  }

  onBalanceChange(e, onChange) {
    if (/^[0-9]+\.?[0-9]{0,2}$/.test(e.target.value) || e.target.value === "") {
      onChange(e);
    }
  }

  onChangeTab(tab) {
    this.setState({ tabID: tab.target.value });
    window.scrollTo(0, 0);
    if (tab.target.value === "three") firstError = [];
  }

  renderTextField({
    input,
    title,
    type,
    meta: { touched, error },
    onInputChange,
  }) {
    return (
      <div className={"form__text-field" + (touched && error ? " errored" : "")}>
        <div className="form__text-field__wrapper">
          <span className="form__text-field__name">{title}</span>
          <input
            {...(onInputChange
              ? { ...input, onChange: (e) => onInputChange(e, input.onChange) }
              : input)}
            type={type}
            autoComplete="new-password"
          />
          <div className="form__text-field__error">
            <span>{touched && error}</span>
          </div>
        </div>
      </div>
    );
  }

  renderCheckboxField({ input, input: { onChange }, title, type }) {
    return (
      <div className="form__checkbox-field checkbox-control">
        <div className="form__checkbox-field__wrapper">
          <input
            {...input}
            onChange={(e) => {
              this.setState({ hideCorporationFields: e.target.checked });
              onChange(e);
            }}
            id="is-campaign"
            type={type}
          />
          <label htmlFor="is-campaign">
            <span className="checkbox-control__indicator" />
            <span> {title}</span>
          </label>
        </div>
      </div>
    );
  }

  onSelectCountryChange(selectedCountry) {
    this.setState({
      selectedCountry: selectedCountry.value ? selectedCountry : null,
    });
    this.props.change("billingCountry", selectedCountry.value);
  }

  onSelectCompanyCountryChange(selectedCompanyCountry) {
    this.setState({
      selectedCompanyCountry: selectedCompanyCountry.value
        ? selectedCompanyCountry
        : null,
    });
    this.props.change("billingCompanyCountry", selectedCompanyCountry.value);
  }

  render() {
    const { hideCorporationFields, reportUrl, selectedManager, tabID } = this.state;
    const { currentAdvertiser, app, actions } = this.props;
    const user = this.props.initialValues;

    const classNameBilDetails = classNames({
      disabled: this.state.hideCorporationFields,
      card_body: true,
    });

    const classNameReportUrl = classNames({
      "form_body-item": true,
      disabled: app ? app.formAction !== EDIT && !currentAdvertiser : false,
    });

    let errArray1 = ["name", "email", "password", "confirmPassword"]; // tab1
    let errArray2 = ["billingCompanyName"]; //tab2
    const checkForm1 = arrayChecker(errArray1, firstError);
    const checkForm2 = arrayChecker(errArray2, firstError);

    return (
      <Fragment>
        <form className="form card" onSubmit={this.props.handleSubmit}>
          <Tabs
            defaultTab={
              checkForm1 && (checkForm2 || !checkForm2) && tabID === "three"
                ? this.setState({ tabID: "one" })
                : !checkForm1 && checkForm2 && tabID === "three"
                ? this.setState({ tabID: "two" })
                : tabID
            }
          >
            <TabList>
              <Tab type="button" tabFor="one" onClick={this.onChangeTab}value="one">
                <div value="one" style={{ color: `${checkForm1 == true ? "red" : "rwt__tab"}` }}>
                  {/* {`${checkForm1 == true ? <Link to ="#two" /> : ""}` */}
                  {localization.billingDetails.personalData}
                </div>
              </Tab>
              <Tab type="button" tabFor="two" onClick={this.onChangeTab} value="two">
                <div value="two" style={{ color: `${checkForm2 == true ? "red" : "rwt__tab"}` }}
                  // className= {`${checkForm2 == true ? 'rwt__tab_error' : 'rwt__tab'}`}
                >
                  {localization.billingDetails.corpbillingDet}
                </div>
              </Tab>
              <Tab type="button" tabFor="three" onClick={this.onChangeTab} value="three">
                {localization.billingDetails.settings}
              </Tab>
            </TabList>
            <TabPanel type="button" tabId="one">
              <div className="form_body" style={{ marginTop: "-32px" }}>
                <div className="form_body-item">
                  {/* <div className="card_header bordered">
                <h2 className="heading">
                  {localization.billingDetails.personalData}
                </h2>
              </div> */}
                  <div className="card_body">
                    <div style={{ display: "flex" }}>
                      <Field
                        type="text"
                        name="name"
                        title={localization.forms.name}
                        component={this.renderTextField}
                        validate={required}
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
                        />
                      </div>
                      <div style={{ display: "flex", width: "50%" }}>
                        <Field
                          type="text"
                          name="balance"
                          title={localization.forms.balance}
                          component={this.renderTextField}
                          onInputChange={this.onBalanceChange}
                        />
                        <DisplayCheck roles={[userConstants.ADMIN]}>
                          <CustomSelect
                            label={"Manager"}
                            options={this.props.managers}
                            value={selectedManager}
                            onChange={this.onChangeManager}
                            styles={styles}
                            theme={(theme) => ({
                              ...theme,
                              colors: {
                                ...theme.colors,
                                primary: "#000000",
                              },
                            })}
                          />
                        </DisplayCheck>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="Btn_Container">
                <button
                  type="button"
                  onClick={this.props.history.goBack}
                  style={{ marginRight: 16 }}
                  className="btn white"
                >
                  Cancel
                </button>
                <button
                  value="two"
                  onClick={this.onChangeTab}
                  type="button"
                  className="btn neutral"
                >
                  Next
                </button>
              </div>
            </TabPanel>
            <TabPanel type="button" tabId="two">
              <div className="form_body" style={{ marginTop: "-32px" }}>
                <div className="form_body-item">
                  <div className="card_body">
                    <div className={"form__with-corporation"}>
                      <div style={{ display: "flex" }}>
                        <Field
                          type="text"
                          name="billingCompanyName"
                          title={localization.billingDetails.form.companyName}
                          component={this.renderTextField}
                          validate={required}
                        />
                        <Field
                          type="text"
                          name="billingCompanyAddress"
                          title={
                            localization.billingDetails.form.billingAddress
                          }
                          component={this.renderTextField}
                        />
                      </div>
                      <div style={{ display: "flex" }}>
                        <Field
                          type="text"
                          name="billingCompanyCity"
                          title={localization.billingDetails.form.city}
                          component={this.renderTextField}
                        />
                        <div className="form__text-field">
                          <div className="form__text-field__wrapper">
                            <div className="form__text-field__name-wrapper">
                              <span className="form__text-field__name">
                                {
                                  localization.billingDetails.form
                                    .companyCountry
                                }
                              </span>
                            </div>
                            <div
                              style={{ marginTop: "4.6px" }}
                              className="form__text-field__input-wrapper"
                            >
                              <Select
                                options={this.state.selectCountryData}
                                value={this.state.selectedCompanyCountry || ""}
                                name="billingCompanyCountry"
                                onChange={this.onSelectCompanyCountryChange}
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
                        </div>
                      </div>
                      <div style={{ display: "flex" }}>
                        <Field
                          type="text"
                          name="billingCompanyZipCode"
                          title={localization.billingDetails.form.zipcode}
                          normalize={upper}
                          validate={[maxLength, isZipCode]}
                          component={this.renderTextField}
                        />
                        <Field
                          type="text"
                          name="billingTaxId"
                          title={localization.billingDetails.form.vatTax}
                          component={this.renderTextField}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="Btn_Container">
                <button
                  type="button"
                  onClick={this.props.history.goBack}
                  style={{ marginRight: "16px" }}
                  className="btn white"
                >
                  Cancel
                </button>
                <button
                  value="three"
                  onClick={this.onChangeTab}
                  type="button"
                  className="btn neutral"
                >
                  Next
                </button>
              </div>
            </TabPanel>
            <TabPanel tabId="three">
              <div className="settings-wrapper">
                <div className="form_body-item">
                  <div className="card_body">
                    <div style={{ borderBottom: "1px solid #E8E8E8" }}>
                      <Field
                        type="text"
                        name="isCampaignsAllowed"
                        title="Advertiser can create campaigns himself and see all campaigns statistics"
                        component={this.renderCheckboxFieldSettings}
                      />
                      <div className={"classNameSettings"}>
                        <Field
                          type="text"
                          name="isInventoriesAllowed"
                          title="Advertiser can choose inventories himself and see supply statistics"
                          component={this.renderCheckboxFieldSettings}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className={classNameReportUrl}>
                  <div className="card_body">
                    <h3 className="subheading ">
                      {localization.integration.keys}
                    </h3>
                    <div className="text-input">
                      <input
                        defaultValue={
                          (currentAdvertiser && currentAdvertiser.apiKey) || ""
                        }
                        type="text"
                        autoComplete="off"
                      />
                    </div>
                    {currentAdvertiser && currentAdvertiser ? (
                      <Fragment>
                        <CopyToClipboard
                          onCopy={() => showNotification()}
                          text={currentAdvertiser.apiKey}
                        >
                          <button
                            type="button"
                            style={{ width: "210px" }}
                            className="btn light-blue"
                          >
                            <span>{localization.integration.clipboard}</span>
                          </button>
                        </CopyToClipboard>
                        <button
                          type="button"
                          className="btn light-blue ml2"
                          onClick={() =>
                            actions.generateAdvertiserApiKey(
                              currentAdvertiser.id
                            )
                          }
                        >
                          <span>{localization.integration.regenerate}</span>
                        </button>
                      </Fragment>
                    ) : (
                      <button
                        type="button"
                        className="btn light-blue"
                        onClick={actions.generateAdvertiserApiKey}
                      >
                        <span>{localization.integration.generateKey}</span>
                      </button>
                    )}
                    <div className="text-input">
                      <input
                        defaultValue={reportUrl}
                        type="text"
                        className=""
                        placeholder=""
                        autoComplete="off"
                      />
                    </div>
                    <p className="description">
                      {localization.integration.keysDesc}
                    </p>
                    <CopyToClipboard
                      onCopy={() => showNotification()}
                      text={reportUrl}
                    >
                      <button type="button" className="btn light-blue" title="">
                        <span className="">
                          {localization.integration.clipboard}
                        </span>
                      </button>
                    </CopyToClipboard>
                  </div>
                </div>
              </div>
              <div className="form_submit-btn" style={{ marginTop: "112px" }}>
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
                  validate={[checkForm1, checkForm2]}
                >
                  {this.props.btnName}
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
  form: "CreateAdvertiserForm",
  onSubmitFail,
  validate,
})(CreateAdvertiserForm);
