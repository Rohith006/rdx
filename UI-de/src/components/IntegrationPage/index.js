import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import classNames from "classnames";

import { updatePublisher } from "../../actions/users";
import { generatePublisherKey } from "../../actions/auth";
import Integration from "../common/Views/Integration";
import { OPEN_RTB_VERSIONS } from "../../config";
import { USA_BIDDER_DOMAIN, EU_BIDDER_DOMAIN } from "../../constants/bidder";
import { getEndDate, getStartDate } from "../../utils/getPeriodDate";
import { ORTB, AD_TYPES } from "../../constants/common";
import { ALL, CPC } from "../../constants/campaigns";
import { hashids } from "../../utils/common";

class IntegrationPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      apiUrl: "",
      reportUrl: "",
      copied: false,
      postbackUrl: "",
      allChecked: false,
      location: [
        {
          label: "Europe",
          value: 1,
        },
        {
          label: "Usa",
          value: 2,
        },
      ],
      bidderUrl: `${USA_BIDDER_DOMAIN}/bid?pid=${props.user.id}`,
      rtbProtocolVersions: OPEN_RTB_VERSIONS.map((v) => ({
        label: v,
        value: v,
      })),
      rtbProtocolVersion: { label: "2.5", value: "2.5" },
      isOpenModal: false,
    };
    this.onCopy = this.onCopy.bind(this);
    this.editApiUrl = this.editApiUrl.bind(this);
    this.refreshUrl = this.refreshUrl.bind(this);
    this.onChangeLocation = this.onChangeLocation.bind(this);
    this.onElementChangeHandler = this.onElementChangeHandler.bind(this);
    this.openDetailsModal = this.openDetailsModal.bind(this);
    this.renderRegularText = this.renderRegularText.bind(this);
    this.onSelectAdTypes = this.onSelectAdTypes.bind(this);
    this.renderTextField = this.renderTextField.bind(this);
    this.appendMacros = this.appendMacros.bind(this);
    this.setBidderUrl = this.setBidderUrl.bind(this);
    this.handleChangeCaretForInsertMacros =
      this.handleChangeCaretForInsertMacros.bind(this);
  }

  componentDidMount() {
    this.refreshUrl();

    const { user, formData } = this.props;
    if (user.rtbProtocolVersion) {
      this.setState({
        rtbProtocolVersion: {
          label: user.rtbProtocolVersion,
          value: user.rtbProtocolVersion,
        },
      });
    }
    if (formData) {
      this.setBidderUrl();
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { user, formData } = this.props;

    if (user && prevProps.user && user.apiKey !== prevProps.user.apiKey) {
      this.setState({
        apiUrl: `${__PUBLISHER_API_URL__}/campaigns?pubId=${user.id}&key=${
          user.apiKey || "YOUR_API_KEY"
        }`,
        reportUrl: `${__PUBLISHER_API_URL__}/report/ssp?pubId=${user.id}&key=${
          user.apiKey || "YOUR_API_KEY"
        }&startDate=${getStartDate()}&endDate=${getEndDate()}`,
      });
    }
    if (
      formData &&
      (formData.protocolType !== prevProps.formData.protocolType ||
        formData.location !== prevProps.formData.location ||
        formData.adType !== prevProps.formData.adType)
    ) {
      this.setBidderUrl();
    }
  }

  setBidderUrl() {
    const { user, formData } = this.props;
    const domain =
      formData.location === "Usa" ? USA_BIDDER_DOMAIN : EU_BIDDER_DOMAIN;
    const hashIds = hashids.encode([__WLID__, user.id]);
    switch (formData.protocolType) {
      case ORTB: {
        this.setState({
          bidderUrl: `${domain}/bid?pid=${user.id}&auth=${hashIds}`,
        });
        break;
      }
      default:
        break;
    }
  }

  renderRegularText({
    input,
    title,
    meta: { touched, error },
    onFieldChange,
    className,
  }) {
    return (
      <div
        className={classNames(`form__text-field ${className}`, {
          " errored": touched && error,
        })}
      >
        <div className="form__text-field__wrapper">
          <span className="form__text-field__name">{title}</span>
          <input
            type="text"
            id={input.name}
            autoComplete="off"
            name={input.name}
            {...(onFieldChange
              ? { ...input, onChange: (e) => onFieldChange(e, input.onChange) }
              : input)}
          />
          <div className="form__text-field__error">
            <span>{touched && error}</span>
          </div>
        </div>
      </div>
    );
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.user) {
      return {
        apiUrl: `${__PUBLISHER_API_URL__}/campaigns?pubId=${
          nextProps.user.id
        }&key=${nextProps.user.apiKey || "YOUR_API_KEY"}`,
        reportUrl: `${__PUBLISHER_API_URL__}/report/ssp?pubId=${
          nextProps.user.id
        }&key=${
          nextProps.user.apiKey || "YOUR_API_KEY"
        }&startDate=${getStartDate()}&endDate=${getEndDate()}`,
      };
    }

    return null;
  }

  onChangeLocation(selected) {
    this.props.change("location", selected.label);
  }

  onElementChangeHandler(field, updatedData) {
    let value =
      typeof updatedData === "object" ? updatedData.value : updatedData;
    if (field === "protocolType") {
      this.props.propsChange("adType", []);
      if ([ORTB].includes(updatedData)) {
        this.props.propsChange("bidType", CPC);
        this.props.propsChange("adType", [ALL]);
      }
    }
    if (field === "adType") {
      value = [value];
    }
    this.props.propsChange([field], value);
    this.setState({ [field]: updatedData });
  }

  openDetailsModal() {
    this.setState((prevState) => ({
      isOpenModal: !prevState.isOpenModal,
    }));
  }

  onCopy() {
    this.setState({ copied: true });
  }

  editApiUrl(e) {
    this.setState({ apiUrl: e.target.value });
  }

  refreshUrl() {
    const { user } = this.props;
    if (user) {
      this.setState({
        apiUrl: `${__PUBLISHER_API_URL__}/campaigns?pubId=${user.id}&key=${
          user.apiKey || "YOUR_API_KEY"
        }`,
        postbackUrl: user.postbackUrl || "",
      });
    }
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

  onSelectAdTypes(e) {
    let type = this.props.formData.adType;
    let itemName = e.target.value;
    let checked = e.target.checked;

    if (checked) {
      type =
        e.target.value === "ALL"
          ? AD_TYPES.oRTB.map((data) => data.value)
          : [...type.filter((item) => item != "ALL"), e.target.value];
      if (type.length === AD_TYPES.oRTB.length - 2)
        type = AD_TYPES.oRTB.map((data) => data.value);
    } else {
      type = type.filter((item) => item != "ALL" && item !== itemName);
    }

    const newType = [...new Set(type)];
    // const updatedAdType = type.length
    //   ? newType
    //   : AD_TYPES.oRTB.map((data) => data.value);
    const updatedAdType = newType;
    this.setState({
      adTypes: updatedAdType,
    });
    this.props.propsChange("adType", updatedAdType);
  }

  appendMacros(field, macros) {
    const value = this.props.formData[field];
    const key = `caret-${field}`;
    const caret = this.state[key];
    let newValue = "";
    if (value && caret) {
      const part1 = value.slice(0, caret);
      const part2 = value.slice(caret, value.length);
      newValue = part1 + macros + part2;
    } else {
      newValue = value + macros;
    }
    this.props.change(field, newValue);
  }

  handleChangeCaretForInsertMacros(field, value) {
    const key = `caret-${field}`;
    this.setState({
      [key]: value,
    });
  }

  render() {
    const { actions } = this.props;
    const saveBtnName = classNames({
      "btn light-blue": true,
      disabled: !this.state.postbackUrl.length,
    });
    return (
      <Integration
        {...this.props}
        {...this.state}
        selectAdTypes={this.onSelectAdTypes}
        renderRegularText={this.renderRegularText}
        changeLocation={this.onChangeLocation}
        elementChangeHandler={this.onElementChangeHandler}
        showRtbExample={this.openDetailsModal}
        renderTextField={this.renderTextField}
        generatePublisherKey={actions.generatePublisherKey}
        saveBtnName={saveBtnName}
        appendMacros={this.appendMacros}
        handleChangeCaretForInsertMacros={this.handleChangeCaretForInsertMacros}
      />
    );
  }
}

const mapStateToProps = (state) => ({
  formData: state.form.CreatePublisherForm
    ? state.form.CreatePublisherForm.values
    : {},
  user: state.users.currentPublisher,
  currentUser: state.auth.currentUser,
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(
    {
      generatePublisherKey,
      updatePublisher,
    },
    dispatch
  ),
});

export default connect(mapStateToProps, mapDispatchToProps)(IntegrationPage);
