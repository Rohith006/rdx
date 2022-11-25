import React, { Component } from "react";
import { connect } from "react-redux";
import { reduxForm, Field, formValueSelector } from "redux-form";
import Select from "react-select";
import FileDrop from "react-file-drop";
import Papa from "papaparse";
import { NotificationManager } from "react-notifications";
import classNames from "classnames";
// Application modules
import localization from "../../localization";
import DisplayCheck from "../../permissions";
import * as userConstants from "../../constants/user";
import * as subIdWhiteBlackListsConstants from "../../constants/subIdWhiteBlackLists";
import { required } from "../../utils/validatorUtils";
import { BLACKLIST, WHITELIST } from "../../constants/subIdWhiteBlackLists";
import { ADMIN, ADVERTISER } from "../../constants/user";
import Upload from "../../../assets/images/icons/upload.svg";
import { styles } from "../UI/selectStyles";

class CustomOptimizerForm extends Component {
  constructor(props) {
    super(props);
    const { tab } = this.props;
    this.state = {
      selectedPublisher: { label: "All", value: null },
      selectedType: "-",
      tab: tab,
      supportedTypes: [
        { label: "-", value: null },
        { label: "SubId", value: "subId" },
        { label: "Site", value: "site" },
        { label: "App", value: "app" },
        { label: "IP", value: "ip" },
      ],
    };

    this.onLoadWBlistOfSubIds = this.onLoadWBlistOfSubIds.bind(this);
    this.saveWBSubIds = this.saveWBSubIds.bind(this);
    this.onSelectChange = this.onSelectChange.bind(this);
    this.handleUploadCsv = this.handleUploadCsv.bind(this);
    this.renderSelectField = this.renderSelectField.bind(this);
    this.renderTextAreaField = this.renderTextAreaField.bind(this);
    this.handleCheckNameField = this.handleCheckNameField.bind(this);
  }

  componentDidMount() {
    this.props.onLoadSubIdList({ category: "campaign" });
  }

  handleUploadCsv(file) {
    if (!new RegExp(".csv", "i").test(file.name)) {
      NotificationManager.error(
        `Wrong ${file.name} file format. Please upload .csv only.`
      );
      return;
    }

    const onCompleteHandler = (results) => {
      const subIds = [];
      results.data.map((item) => {
        const id = Object.values(item)[0];
        id && subIds.push(id);
      });
      this.props.change("subId", subIds);
    };

    Papa.parse(file, {
      header: true,
      complete: onCompleteHandler,
    });
  }

  handleCheckNameField(type) {
    return type === "whiteList"
      ? "Whitelist - Enter Sub ID's to whitelist"
      : "Blacklist - Enter Sub ID's to block";
  }

  saveWBSubIds(e) {
    e.preventDefault();
    this.setState({
      selectedType: "subId",
    });

    this.props.handleSubmit();
    this.props.reset();
  }

  onLoadWBlistOfSubIds(fieldName, item) {
    if (fieldName === "type") {
      this.setState({
        selectedType: item.value || "subId",
      });
    }

    const { category, formData } = this.props;
    const publisherId = formData.publisherId && formData.publisherId.value;
    const type = formData.type && formData.type.value;
    const campaignId = formData.campaignId && formData.campaignId.value;
    const list = formData.list;

    const data = Object.assign(
      { type, publisherId, category, list, campaignId },
      { [fieldName]: item.value }
    );
    this.props.onLoadSubIdList(data);
    const filters = {
      type: data.type,
      campaign: data.campaignId,
      publisherId: data.publisherId,
    };
    this.props.onUpdateFilters(filters);
  }

  renderTextAreaField({ input, placeholder, title, meta: { touched, error } }) {
    return (
      <div
        className={classNames("form__text-field", {
          " errored": touched && error,
        })}
        style={{ paddingRight: "3%" }}
      >
        <div className="form__text-field__wrapper">
          {/* {title && <span className="form__text-field__name">{title}</span>} */}
          <textarea
            {...input}
            className="settingsSubid"
            id={input.name}
            autoComplete="off"
            placeholder={placeholder || ""}
          />
          <div className="form__text-field__error">
            <span>{touched && error}</span>
          </div>
          <FileDrop onDrop={(files) => this.handleUploadCsv(files[0])}>
            <span className="form__text-field__name">{"Upload CSV file"}</span>
            <div className="tooltip info">
              <span className="tooltiptext">
                Choose the CSV file for uploading
              </span>
            </div>
            <div className="settingsUploadCSV">
              <div className="settingsDivCenter">
                <input
                  type="file"
                  name="file"
                  id="file"
                  className="inputfile"
                  onChange={(e) => {
                    this.handleUploadCsv(e.target.files[0]);
                    e.target.value = null;
                  }}
                  style={{ justifyContent: "center", alignItems: "center" }}
                />
                <label
                  htmlFor="file"
                  className="btn dark-blue settingsUploadLabel mr2"
                >
                  <div style={{ display: "flex", flexDirection: "row" }}>
                    <img
                      style={{ width: "21px", marginLeft: "auto" }}
                      className="img-icon"
                      src={Upload}
                    />
                    <span>Choose CSV file</span>
                  </div>
                </label>
              </div>
            </div>
          </FileDrop>
        </div>
      </div>
    );
  }

  renderRadioField({ input, type, id }) {
    return <input {...input} type={type} id={id} className="custom-radio" />;
  }

  renderSelectField({
    input,
    meta: { touched, error },
    options,
    selectedItem,
    label,
  }) {
    return (
      <div className="select" style={{ width: "100%" }}>
        <div className="form__text-field__wrapper">
          <span className="form__text-field__name" style={{ marginBottom: 10 }}>
            {label}
          </span>
          <Select
            options={options}
            value={selectedItem}
            onChange={(item) => input.onChange(item)}
            placeholder="Select..."
            styles={styles}
            theme={(theme) => ({
              ...theme,
              colors: {
                ...theme.colors,
                primary: "#000000",
              },
            })}
          />
          <div className="form__text-field__error">
            <span>{touched && error}</span>
          </div>
        </div>
      </div>
    );
  }

  onSelectChange(name, selectedItem) {
    const stateProps =
      name === "publisherId" ? "selectedPublisher" : "selectedType";

    this.setState({
      [stateProps]: selectedItem.value ? selectedItem : null,
    });
    this.props.change([name], selectedItem.value);
  }

  render() {
    const { auth, formData, selectPublisherData, options, category } =
      this.props;
    const { selectedType, supportedTypes } = this.state;
    const selectTypePlaceholder = selectedType === "-" ? "subId" : selectedType;

    let types = [...supportedTypes];

    return (
      <form className="form settings" onSubmit={this.saveWBSubIds}>
        <div className="form_body">
          <div className="form_body-item">
            {/* SubIds Filters */}
            <div className="card_body">
              <div className="settingsFormRow">
                <div className="settingsFormField">
                  {category === "campaign" && (
                    <Field
                      component={this.renderSelectField}
                      name="campaignId"
                      options={options}
                      label={"Select campaign"}
                      selectedItem={formData.campaignId}
                      onChange={(item) =>
                        this.onLoadWBlistOfSubIds("campaignId", item)
                      }
                    />
                  )}
                </div>
                <div className="settingsFormField" style={{ marginLeft: "3%" }}>
                  <DisplayCheck roles={[userConstants.ADMIN]}>
                    <Field
                      component={this.renderSelectField}
                      name="publisherId"
                      options={selectPublisherData}
                      label="Select publisher"
                      selectedItem={formData.publisherId}
                      onChange={(item) =>
                        this.onLoadWBlistOfSubIds("publisherId", item)
                      }
                    />
                  </DisplayCheck>
                </div>
              </div>
              <div className="settingsFormRow">
                <div className="settingsFormField">
                  <Field
                    component={this.renderSelectField}
                    name="type"
                    options={types}
                    label="Type"
                    selectedItem={formData.type}
                    onChange={(item) => this.onLoadWBlistOfSubIds("type", item)}
                  />
                </div>
                <div
                  className="settingsFormField"
                  style={{ marginLeft: "3%" }}
                ></div>
              </div>
            </div>
            <div className="settingsFormRow">
              <div className="settingsUpload">
                <Field
                  name="subId"
                  title="SubId or Upload CSV"
                  component={this.renderTextAreaField}
                  placeholder={"Enter " + selectTypePlaceholder}
                  validate={[required]}
                />
              </div>
            </div>
            <div className="settingsBtn">
              <DisplayCheck
                roles={[
                  userConstants.ADMIN,
                  userConstants.ACCOUNT_MANAGER,
                  userConstants.ADVERTISER,
                ]}
              >
                <button
                  type="submit"
                  disabled={this.state.selectedType === "-" ? true : false}
                  className={
                    `btn dark-blue mr2 ${
                      auth.currentUser.role === ADVERTISER &&
                      !formData.campaignId.value
                        ? "disabled"
                        : ""
                    }` + " settingsSaveBtn"
                  }
                  style={{ padding: "0.67em" }}
                >
                  <span className="btn_text">{localization.forms.save}</span>
                </button>
              </DisplayCheck>
            </div>
          </div>
        </div>
      </form>
    );
  }
}

const valueSelector = formValueSelector("CustomOptimizerForm");

const mapStateToProps = (state) => ({
  auth: state.auth,
  formData: {
    campaignId: valueSelector(state, "campaignId") || {
      label: "-",
      value: null,
    },
    publisherId: valueSelector(state, "publisherId") || {
      label: "All",
      value: null,
    },
    type: valueSelector(state, "type") || { label: "All", value: null },
    list: valueSelector(state, "list"),
  },
});

export default connect(
  mapStateToProps,
  null
)(
  reduxForm({
    form: "CustomOptimizerForm",
    enableReinitialize: true,
  })(CustomOptimizerForm)
);
