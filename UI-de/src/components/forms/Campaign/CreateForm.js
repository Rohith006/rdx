import React, { Component, Fragment } from "react";
import "react-datepicker/dist/react-datepicker.css";
import PropTypes from "prop-types";
import { cloneDeep, isFunction } from "lodash";
import connect from "react-redux/es/connect/connect";
import { Field, formValueSelector, reduxForm } from "redux-form";
import localization from "../../../localization";
import { bindActionCreators } from "redux";
import {
  resetCurrentCampaign,
  loadInventories,
  loadDataPartners
} from "../../../actions/campaigns&budgets";
import classNames from "classnames";
import DatePicker from "react-datepicker/es";
import moment from "moment";
import Spin from "antd/es/spin";
import {
  ACTIVE,
  PAUSED,
  ENABLE,
  DISABLE,
  MOBILE,
  TABLETS,
  CARRIER_AND_WIFI,
  CARRIER,
  WIFI,
  FEMALE_AND_MALE, 
  FEMALE,
  MALE,
  SELECT_INVENTORY_SOURCE,
  DESKTOP,
  CONNECTEDTV,
  ALL,
  BANNER,
  ALL_AGE_GROUP,
  CUSTOM,
  trafficType,
  os,
  NATIVEADD,
  NATIVEADD_ALIAS,
  VIDEOADD,
  AUDIOADD,
  PUSH,
  POP,
} from "../../../constants/campaigns";
import { HOUR, DAY, WEEK } from "../../../constants/caps";
import * as userConstants from "../../../constants/user";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { NotificationManager } from "react-notifications";
import compareVersions from "compare-versions";
import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemPanel,
  AccordionItemButton,
} from "react-accessible-accordion";
import "react-datepicker/dist/react-datepicker.css";
import "react-accessible-accordion/dist/fancy-example.css";
import { confirmAlert } from "react-confirm-alert";
import CustomConfirm from "../../common/Views/Confirm";
import { SvgDelete } from "../../common/Icons";
import { SelectField } from "../../UI";
import DisplayCheck from "../../../permissions";
import Creatives from "../../common/Creatives";
import DayPartingDesk from "../../common/DayPartingDesk";
import Budget from "./View/AccordionElements/Budget";
import { loadCities, loadFilteredCities } from "../../../actions/countries";
import { normalizeBoolean } from "../../../utils/normalizers";
import { required, arrayChecker} from "../../../utils/validatorUtils";
import NativePushPopAdCreatives from "../../common/NativePushPopAdCreatives";
import VideoAdCreatives from "../../common/VideoAdCreatives";
import AudioAdCreatives from "../../common/AudioAdCreatives";
import InventoryControl from "../../InventoryControls/InventoryControl";
import BrowserVersion from "../campaignComponents/browserVersion";
import Carriers from "../campaignComponents/carriers";
import CampaignTags from "../campaignComponents/campaignTags";
import Location from "../Target/Geo";
import CheckCircle from "../../../../assets/images/icons/check_circle.svg";
import CheckMark from "../../../../assets/images/icons/check-mark.svg";

import Vector from "../../../../assets/images/icons/arrowside.svg";
import { TextField } from "../../UI";
import { platforms } from "../../../constants/platformsSelect";
import {
  hashids,
  setCaretInput,
  showSuccessNotification,
  toNumber,
  trimmer,
} from "../../../utils/common";
import { loadBannerResolutions } from "../../../actions/dsp";
import { ADMIN } from "../../../constants/user";
import { CopyToClipboard } from "react-copy-to-clipboard";
import validate from "../../../utils/validation/campaignForm";
import { Tabs, Tab, TabPanel, TabList } from "react-web-tabs";
import SelectCpmCampaignTypePage from "../../CreateCampaign/SelectCpmCampaignTypePage";
import { styles } from "../../UI/selectStyles";
import AudModal from '../campaignComponents/DataPartners/AudienceTab'
import { thirdPartyFilters } from "../../UI/ThirdParty";
import {LIVERAMP, LOTAME, DIGISEG} from '../../../constants/campaigns';

const { IOS, ANDROID } = os.mobile;
import { CapitalToLower } from "../../../utils/upperToLower";
var firstError;

function onSubmitFail(errors) {
  if (!errors)
    return;
  firstError = Object.keys(errors);
  const el = document.querySelector(`[name="${firstError}"]`);
  if(firstError.length <= 2){
    NotificationManager.error(`Must fill ${firstError} fields `)
  } else{
    NotificationManager.error(`Must fill all the required fields...`)
  }
  // NotificationManager.error(`Must fill required fields ${firstError}`);
  const position = el &&
    el.getBoundingClientRect().top + document.documentElement.scrollTop;
  const offset = 10;
  window.scrollTo({ top: position - offset, behavior: "smooth" });
};
class CreateForm extends Component {

  constructor(props) {
    super(props);
    this.state = {
      selectLanguagesData: [],
      selectCountriesData: [],
      selectCitiesData: [],
      selectCountryData: [],
      selectCityData: [],
      selectedCountries: [],
      selectedCountriesExclude: [],
      selectCategoryData: [],
      selectAdvertiserData: [],
      selectedCategories: [],
      selectedStatus: null,
      selectedAdvertiser: null,
      showCampaignCategoryDropdown: false,
      showMinIosVersionDropdown: false,
      showMaxIosVersionDropdown: false,
      showMinAndroidVersionDropdown: false,
      showMaxAndroidVersionDropdown: false,

      outputData: "",
      outputDataList: '',
      validateMaxBid: "",
      openModal : false,
      segmentId: '',
      mySegments: '',

      dataThirdParty: '',
      paginationValue: '',
      iosVersionsList: [
        "3.x.x",
        "4.x.x",
        "5.x.x",
        "6.x.x",
        "7.x.x",
        "9.x.x",
        "10.x.x",
        "11.x.x",
        "12.x.x",
        "13.x.x",
        "14.x.x",
        "15.x.x",
      ],
      androidVersionsList: [
        "1.x.x",
        "2.x.x",
        "3.x.x",
        "4.x.x",
        "5.x.x",
        "6.x.x",
        "7.x.x",
        "8.x.x",
        "9.x.x",
        "10.x.x",
        "11.x.x",
      ],
      campaignCategoryList: [],
      minIosVersion: "",
      maxIosVersion: "",
      minAndroidVersion: "",
      maxAndroidVersion: "",
      selectCampaignCategory: "",
      selectedCampaignCategory: null,
      showCal: false,
      value: 0,
      budgetAdvancedOptions: true,
      filters: {
        selectedImpression: null,
        selectImpressionTypeData: [
          { label: "Hour", value: HOUR },
          { label: "Day", value: DAY },
          { label: "Week", value: WEEK },
        ],
      },
      selectedThirdParty: null,
      partnerFilter: '',
      firstSubmit: false,
      tabID: "one",
    };
    this.onOpenConfirmationDialog = this.onOpenConfirmationDialog.bind(this);
    this.appendMacros = this.appendMacros.bind(this);
    this.renderNotificationsThresholdTextField =
      this.renderNotificationsThresholdTextField.bind(this);
    this.onSelectCountryChange = this.onSelectCountryChange.bind(this);
    this.onSelectAdvertiserChange = this.onSelectAdvertiserChange.bind(this);
    this.toggleDropdown = this.toggleDropdown.bind(this);
    this.setOsVersion = this.setOsVersion.bind(this);
    this.onSelectCarriesChange = this.onSelectCarriesChange.bind(this);
    this.renderCheckboxField = this.renderCheckboxField.bind(this);
    this.renderDatePicker = this.renderDatePicker.bind(this);
    this.renderTrackingUrlField = this.renderTrackingUrlField.bind(this);
    this.renderRadioField = this.renderRadioField.bind(this);
    this.renderSingleItem = this.renderSingleItem.bind(this);
    this.renderSelectAdvertiserField =
      this.renderSelectAdvertiserField.bind(this);
    this.onSelectCityChange = this.onSelectCityChange.bind(this);
    this.onSelectLanguageChange = this.onSelectLanguageChange.bind(this);
    this.onSelectBrowsersChange = this.onSelectBrowsersChange.bind(this);
    this.onSelectCategoryChange = this.onSelectCategoryChange.bind(this);
    this.onDatePartingDeskChange = this.onDatePartingDeskChange.bind(this);
    this.onSelectAllDays = this.onSelectAllDays.bind(this);
    this.onCreateDeliveryTypeChange =
      this.onCreateDeliveryTypeChange.bind(this);
    this.onSelectChange = this.onSelectChange.bind(this);
    this.onSelectPlatformChange = this.onSelectPlatformChange.bind(this);
    this.changeCity = this.changeCity.bind(this);
    this.handleChangeCaretForInsertMacros =
    this.handleChangeCaretForInsertMacros.bind(this);
    this.onChangeTab = this.onChangeTab.bind(this);
    this.groupsList = this.groupsList.bind(this);
    this.onChangeFilter = this.onChangeFilter.bind(this);
    this.groupsData = this.groupsData.bind(this);
    this.state.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    const {
      actions,
      initialValues: {
        modelPayment,
        monetizationType,
        isPmpSupport,
        trafficType,
      },
    } = this.props;
    actions.loadBannerResolutions();
    if (modelPayment && monetizationType && trafficType) {
      const params = {
        bidType: modelPayment,
        adType: monetizationType === CONNECTEDTV ? VIDEOADD : monetizationType,
        isPmpSupport,
        trafficType,
      };
      actions.loadInventories(params);
    }
    window.addEventListener("mousedown", this.pageClick, false);
    if (this.props.action === "create") {
      const url = `${__POSTBACK_TRACKING_URL__}/postback?aid=id&cid=cid&type=cpm`;
      this.props.change("postbackUrl", url);
    }
    this.props.change("disableConversionTest", true);
    this.props.change("disableTestLink", true);
    this.setState({
      selectAdvertiserData: [
        ...this.props.users
          .filter((user) => user.status === ACTIVE)
          .map((advertiser) => ({
            value: advertiser.id,
            label: `(${advertiser.id}) ${
              advertiser.companyName || advertiser.name
            }`,
          })),
      ],
      selectPlatformsData: platforms,
    });
    
  }

  componentWillUnmount() {
    this.props.actions.resetCurrentCampaign();
    firstError = []; // reset errors
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { formData } = this.props;
    if (
      nextProps.initialValues !== this.props.initialValues &&
      this.props.action === "create" &&
      nextProps.formData.dayParting === null
    ) {
      this.setState({ isSelectedAll: true });
    }

    this.setState({
      selectCitiesData: nextProps.citiesList.map(({ name }) => ({
        value: name,
        label: name,
      })),
    });

    if (nextProps.formData.city !== formData.city) {
      const cities = nextProps.formData.city || [];
      const selectedCities = cities.map((name) => ({
        value: name,
        label: name,
      }));

      this.setState({
        selectedCities,
      });
    }

    if (nextProps.languagesList !== this.props.languagesList) {
      this.setState({
        selectLanguagesData: Object.keys(nextProps.languagesList).map(
          (language) => ({
            label: nextProps.languagesList[language].name,
            value: language,
          })
        ),
      });
    }

    if (
      nextProps.languagesList &&
      nextProps.formData.language &&
      nextProps.formData.language !== formData.language
    ) {
      this.setState({
        selectedLanguage: nextProps.formData.language.map((name) => ({
          label: nextProps.languagesList[name]
            ? nextProps.languagesList[name].name
            : "",
          value: name,
        })),
      });
    }

    if (nextProps.categoriesList !== this.props.categoriesList) {
      const selectCategoryData = [];
      for (const catKey in nextProps.categoriesList) {
        selectCategoryData.push(
          ...Object.keys(nextProps.categoriesList[catKey]).map((key) => ({
            label: `${key} - ${nextProps.categoriesList[catKey][key]}`,
            value: key,
          }))
        );
      }
      this.setState({
        selectCategoryData,
      });
    }

    if (
      nextProps.formData.category &&
      this.props.categoriesList &&
      nextProps.formData.category !== formData.category
    ) {
      const selectedCategories = [];

      nextProps.formData.category.forEach((item) => {
        const categoryGroup = Object.values(this.props.categoriesList).filter(
          (categoryGroup) => {
            return categoryGroup[item] !== undefined;
          }
        );

        if (categoryGroup.length) {
          selectedCategories.push({
            label: `${item} - ${categoryGroup[0][item]}`,
            value: item,
          });
        }
      });

      this.setState({
        selectedCategories,
      });
    }

    if (nextProps.countries.countriesList.length) {
      const toSet = {
        selectCountriesData: nextProps.countries.countriesList.map(
          ({ alpha2Code, name }) => ({
            value: alpha2Code,
            label: name,
          })
        ),
      };

      if (
        nextProps.formData.budgetAdvancedOptions !==
        formData.budgetAdvancedOptions
      ) {
        toSet.budgetAdvancedOptions = nextProps.formData.budgetAdvancedOptions;
      }

      if (
        (nextProps.auth.currentUser.role === userConstants.ADMIN ||
          nextProps.auth.currentUser.role === userConstants.ACCOUNT_MANAGER) &&
        nextProps.formData.advertiserId &&
        !this.state.selectedAdvertiser
      ) {
        const advertiser = nextProps.users.find(
          (user) => user.id === nextProps.formData.advertiserId
        );
        if (advertiser) {
          toSet.selectedAdvertiser = {
            value: advertiser.id,
            label: `(${advertiser.id}) ${
              advertiser.companyName || advertiser.name
            }`,
          };
        }
      }

      if (
        formData.geography &&
        !(this.state.selectedCountries && this.state.selectedCountries.length)
      ) {
        const initialCountries = formData.geography.map((countryCode) => {
          const find = nextProps.countries.countriesList.find((country) => {
            return country.alpha2Code === countryCode;
          });
          if (!find) {
            return;
          }
          const { name, alpha2Code } = find;
          return {
            value: alpha2Code,
            label: name,
          };
        });
        if (initialCountries.length) {
          toSet.selectedCountries = initialCountries;
          this.props.change("geography", formData.geography);
        }
      }

      if (
        formData.geoExclude &&
        !(
          this.state.selectedCountriesExclude &&
          this.state.selectedCountriesExclude.length
        )
      ) {
        const initialCountries = formData.geoExclude.map((countryCode) => {
          const find = nextProps.countries.countriesList.find((country) => {
            return country.alpha2Code === countryCode;
          });
          if (!find) {
            return;
          }
          const { name, alpha2Code } = find;
          return {
            value: alpha2Code,
            label: name,
          };
        });
        if (initialCountries.length) {
          toSet.selectedCountriesExclude = initialCountries;
          this.props.change("geoExclude", formData.geography);
        }
      }

      // Remove all cities if there are no any selected country
      if (
        nextProps.formData.geography !== formData.geography &&
        !nextProps.formData.geography
      ) {
        toSet.selectedCities = null;
        this.props.change("city", null);
      }

      if (nextProps.formData.minIosVersion && !this.state.minIosVersion) {
        const minIosVersion = nextProps.formData.minIosVersion;

        toSet.minIosVersion = minIosVersion;
        this.props.change("minIosVersion", minIosVersion);
      }

      if (nextProps.formData.maxIosVersion && !this.state.maxIosVersion) {
        const maxIosVersion = nextProps.formData.maxIosVersion;

        toSet.maxIosVersion = maxIosVersion;
        this.props.change("maxIosVersion", maxIosVersion);
      }

      if (
        nextProps.formData.minAndroidVersion &&
        !this.state.minAndroidVersion
      ) {
        const minAndroidVersion = nextProps.formData.minAndroidVersion;

        toSet.minAndroidVersion = minAndroidVersion;
        this.props.change("minAndroidVersion", minAndroidVersion);
      }

      if (
        nextProps.formData.maxAndroidVersion &&
        !this.state.maxAndroidVersion
      ) {
        const maxAndroidVersion = nextProps.formData.maxAndroidVersion;

        toSet.maxAndroidVersion = maxAndroidVersion;
        this.props.change("maxAndroidVersion", maxAndroidVersion);
      }

      this.setState(toSet);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      actions,
      formData,
      formData: {
        advertiserId,
        trackingUrl,
        isPmpSupport,
        modelPayment,
        monetizationType,
        trafficType,
        platform,
        campaignId,
      },
      isRequestPending,
    } = this.props;

    if (
      !isRequestPending &&
      (prevProps.formData.modelPayment !== modelPayment ||
        prevProps.formData.isPmpSupport !== isPmpSupport ||
        prevProps.formData.trafficType !== trafficType ||
        prevProps.formData.monetizationType !== monetizationType)
    ) {
      const params = {
        bidType: modelPayment,
        adType: monetizationType === CONNECTEDTV ? VIDEOADD : monetizationType,
        isPmpSupport,
        trafficType,
      };
      actions.loadInventories(params);
    }

    if (this.props.action === "create") {
      this.props.change("postbackUrl", "");
    }

    if (
      formData.advertiserId !== prevProps.formData.advertiserId &&
      this.props.auth.currentUser.role === userConstants.ADMIN
    ) {
      if (formData.postbackUrl) {
        this.props.change(
          "postbackUrl",
          formData.postbackUrl &&
            formData.postbackUrl.replace(
              /(?=advertiserId=)(.*)(?=&clickId=)/g,
              "advertiserId=" +
                (formData.advertiserId || this.props.auth.currentUser.id)
            )
        );
      }
    }

    // if (this.state.selectedCountries !== prevState.selectedCountries) {
    //   this.props.actions.loadCities(this.state.selectedCountries);
    // }

    if (this.props.users !== prevProps.users) {
      this.setState({
        selectAdvertiserData: [
          ...this.props.users
            .filter((user) => user.status === userConstants.ACTIVE)
            .map((advertiser) => ({
              value: advertiser.id,
              label: `(${advertiser.id}) ${
                advertiser.companyName || advertiser.name
              }`,
            })),
        ],
      });
    }

    if (trackingUrl !== prevProps.formData.trackingUrl) {
      if (!trackingUrl) return;
      let sub1 = trackingUrl.split("?")[1];
      let sub2;
      let sub3;
      if (sub1) {
        if (!!~sub1.indexOf("&")) {
          sub1 = sub1.split("&");
          sub2 = sub1.filter((sub) => !!~sub.indexOf("{CLICKID}"))[0];
          sub2 = sub2 ? sub2.split("=")[0] : "CLICK_ID_GOES_HERE";
        } else {
          sub2 = sub1 ? sub1.split("=")[0] : "CLICK_ID_GOES_HERE";
        }
      }
      const hashIds = hashids.encode([__WLID__, advertiserId]);
      if ([POP].includes(formData.monetizationType)) {
        this.props.change(
          "postbackUrl",
          `${__POSTBACK_TRACKING_URL__}/postback?auth=${hashIds}&impid={IMP_ID}`
        );
      } else {
        this.props.change(
          "postbackUrl",
          `${__POSTBACK_TRACKING_URL__}/postback?aid=${advertiserId}&cid=${campaignId}&type=cpm`
        );
      }
    }

    if (_.isArray(platform) && platform !== prevProps.formData.platform) {
      this.setState({
        selectedPlatform: platform.map((p) => {
          const elem = platforms.find((item) => item.value === p);
          if (elem) {
            return {
              value: p,
              label: elem.label,
            };
          }
        }),
      });
    }
  }

  changeCity(value) {
    this.props.actions.loadFilteredCities(this.state.selectedCountries, value);
  }

  onOpenConfirmationDialog(e, item, prevValue) {
    if (this.props.action === "create") {
      this.props.change([e.target.name], item);
      this.props.change("inventories", []);
      return;
    }

    e.preventDefault();

    confirmAlert({
      customUI: ({ onClose }) => (
        <CustomConfirm
          onConfirm={() => confirm()}
          onClose={(confirmUpdate) => close(onClose, confirmUpdate)}
          msg={localization.confirm.updateInventorySection}
        />
      ),
    });

    const confirm = () => {
      this.props.change([e.target.name], item);
      this.props.change("inventories", []);
    };

    /* Cancel action handler */
    const close = (onClose, confirmUpdate) => {
      if (typeof confirmUpdate === "object") {
        // can be event or boolean
        this.props.change([e.target.name], prevValue);
      }
      onClose();
    };
  }

  onSelectCategoryChange(selectedCategories) {
    const converted =
      (selectedCategories &&
        selectedCategories.map((category) => category.value)) ||
      null;
    this.props.change("category", converted);
    this.setState({ selectedCategories });
  }

  onCreateDeliveryTypeChange(creativeDeliveryType) {
    this.props.change("creativeDeliveryType", creativeDeliveryType.value);
    this.setState({
      creativeDeliveryType: creativeDeliveryType.value
        ? creativeDeliveryType
        : null,
    });
  }

  renderSelectAdvertiserField({
    input,
    title,
    meta: { touched, error },
    selectAdvertiserData,
    selectedAdvertiser,
  }) {
    return (
      <div
        className={classNames("form__text-field__wrapper mb3", {
          " errored": touched && error,
        })}
      >
        <span className="form__text-field__name">{title}</span>
        <Select
          name={input.name}
          options={selectAdvertiserData}
          value={selectedAdvertiser}
          onChange={this.onSelectAdvertiserChange}
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
    );
  }

  renderSelect({ input, title, meta: { touched, error }, data, change }) {
    const { name, value, onChange, onFocus } = input;
    return (
      <div className={classNames({ errored: touched && error })}>
        <div className="form__text-field__name">{title}</div>
        <Select
          name={name}
          value={data.find((item) => item.value === value)}
          onChange={(val) => {
            let value = parseFloat(val.value);
            value = isNaN(value) ? val.value : value;
            onChange(value);
            change(value);
          }}
          onFocus={onFocus}
          options={data}
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
    );
  }

  renderRegularTextField({
    input,
    title,
    type,
    meta: { touched, error },
    onNumberFieldChange,
    className,
    onChange,
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
            {...(onNumberFieldChange
              ? {
                  ...input,
                  onChange: (e) => onNumberFieldChange(e, input.onChange),
                }
              : input)}
            id={input.name}
            autoComplete="off"
            type="text"
            name={input.name}
          />
          <div className="form__text-field__error">
            <span>{touched && error}</span>
          </div>
        </div>
      </div>
    );
  }

  renderTrackingUrlField({
    input,
    title,
    onclick,
    onchange,
    meta: { touched, error },
  }) {
    return (
      <div
        className={classNames(`form__text-field`, {
          " errored": touched && error,
        })}
      >
        <div className="form__text-field__wrapper">
          <span className="form__text-field__name">{title}</span>
          <input
            {...input}
            onChange={(e) => {
              input.onChange(e);
              onchange(e);
            }}
            onClick={(e) => onclick(e)}
            id={input.name}
            autoComplete="off"
            type="text"
            name={input.name}
          />
          <div className="form__text-field__error">
            <span>{touched && error}</span>
          </div>
        </div>
      </div>
    );
  }

  renderTextAreaField({
    input,
    placeholder,
    customStyle,
    title,
    meta: { touched, error },
    getCursor,
  }) {
    return (
      <div
        className={classNames("form__text-field", {
          " errored": touched && error,
        })}
      >
        <div className="form__text-field__wrapper">
          <span className="form__text-field__name">{title}</span>
          <textarea
            style={customStyle}
            className={classNames("textarea-input", {
              " errored": touched && error,
            })}
            {...input}
            onChange={(ev) => {
              input.onChange(ev);
              if (isFunction(getCursor)) {
                getCursor(ev.target);
              }
            }}
            onClick={(ev) => {
              if (isFunction(getCursor)) {
                getCursor(ev.target);
              }
            }}
            onFocus={(ev) => {
              input.onFocus(ev);
              if (isFunction(getCursor)) {
                getCursor(ev.target);
              }
            }}
            id={input.name}
            autoComplete="off"
            placeholder={placeholder || ""}
          />
          <div className="form__text-field__error">
            <span>{touched && error}</span>
          </div>
        </div>
      </div>
    );
  }

  appendMacros(field, macros) {
    // const {formData} = this.props;
    // this.props.change('trackingUrl', (formData.trackingUrl || '') + macros);

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

  renderDeleteCell() {
    return (
      <div className="ag-root__cell-icon">
        <span className="editor-control">
          <SvgDelete />
        </span>
      </div>
    );
  }

  renderPostbackUrlTextField({ input, title, meta: { touched, error } }) {
    return (
      <div
        className={classNames("form__text-field", {
          " errored": touched && error,
        })}
      >
        <div className="form__text-field__wrapper">
          <span className="form__text-field__name">{title}</span>
          <textarea
            {...input}
            id={input.name}
            autoComplete="off"
            className="textarea-input"
            name={input.name}
            disabled
          />
          <div className="form__text-field__error">
            <span>{touched && error}</span>
          </div>
        </div>
      </div>
    );
  }

  renderCheckboxField({
    input,
    required,
    val,
    meta: { touched, error },
    title,
    disabled,
  }) {
    const { formData } = this.props;
    return (
      <div className={`checkbox-control ${disabled ? "disabled" : ""}`}>
        <input
          {...input}
          type="checkbox"
          id={input.name}
          disabled={disabled}
          className={touched && error ? "errored" : ""}
          name={input.name}
          checked={input.value}
          value={val}
          onChange={(e) => {
            if (
              input.value &&
              input.name === "enableNotifications" &&
              formData.notificationsThreshold
            ) {
              this.props.change("notificationsThreshold", null);
            }
            if (
              input.value &&
              input.name === "enableCrThreshold" &&
              (formData.lowestCrThreshold || formData.highestCrThreshold)
            ) {
              this.props.change("lowestCrThreshold", null);
              this.props.change("highestCrThreshold", null);
            }
            if (input.name === "budgetAdvancedOptions") {
              this.setState({
                budgetAdvancedOptions: !this.state.budgetAdvancedOptions,
              });
            }
            if (input.name === "targetingAdvancedOptions") {
              this.props.change(
                "targetingAdvancedOptions",
                !formData.targetingAdvancedOptions
              );
            }
            input.onChange(e);
          }}
        />
        <label htmlFor={input.name}>
          <div className="checkbox-control__indicator" />
          <span> {title}</span>
        </label>
      </div>
    );
  }

  renderNotificationsThresholdTextField({
    input,
    input: { onChange },
    disabled,
    meta: { touched, error },
    onNumberFieldChange,
  }) {
    return (
      <div
        className={classNames("form__text-field block input-sm", {
          " errored": touched && error,
        })}
      >
        <div className="form__text-field__wrapper">
          <input
            {...(onNumberFieldChange
              ? {
                  ...input,
                  onChange: (e) => onNumberFieldChange(e, input.onChange),
                }
              : input)}
            disabled={disabled}
            type="text"
          />
          <div className="form__text-field__error">
            <span>{touched && error}</span>
          </div>
          <span className="percent" />
        </div>
      </div>
    );
  }

  renderDatePicker({
    input,
    onSelect,
    title,
    placeholder,
    meta: { touched, error },
  }) {
    return (
      <div
        className={classNames("form__text-field", {
          " errored": touched && error,
        })}
      >
        <div className="form__text-field__wrapper">
          <span className="form__text-field__name">{title}</span>
          <DatePicker
            selected={input.value ? moment(input.value) : null}
            onSelect={onSelect}
            showYearDropdown
            showMonthDropdown
            minDate={moment().subtract(30, "years")}
            // maxDate={moment().add(0, "years")}
            calendarClassName="campaign_Date"
            value={
              input.value ? moment(input.value).format("YYYY-MM-DD") : null
            }
            onChange={(e) => {
              this.props.touch(input.name);
              input.onChange(e);
            }}
            className="form-control"
            name={input.name}
            placeholderText={placeholder}
            autoComplete="off"
            {...(this.props.action === "create"
              ? { minDate: moment() }
              : {
                  minDate:
                    this.props.campaign &&
                    moment(this.props.campaign.createdAt),
                })}
          />
          <div className="form__text-field__error">
            <span>{touched && error}</span>
          </div>
        </div>
      </div>
    );
  }

  renderRadioField({ input, id, val, title, checked, disabled }) {
    if (input.name === "deviceType") {
      if (input.value === ALL || input.value === DESKTOP) {
        this.props.change("platform", ALL);
      }
    }
    return (
      <div
        className={`radio-control pill-control ${disabled ? "disabled" : ""}`}
      >
        <input
          {...input}
          type="radio"
          onChange={input.onChange}
          disabled={disabled}
          id={id}
          value={val}
          checked={checked}
        />
        <label htmlFor={id}>
          <span className="radio-control__indicator" />
          {title}
        </label>
      </div>
    );
  }

  renderSingleItem({ input, id, val, title, checked }) {
    if (title === "Connected TV") {
      this.props.change("deviceType", CONNECTEDTV);
    }
    return (
      <div className={`radio-control pill-control`}>
        <input
          {...input}
          type="radio"
          onChange={input.onChange}
          id={id}
          value={val}
          className="pointer"
          checked={checked}
        />
        <label className="single_item" htmlFor={id}>
          <span className="radio-control__indicator" />
          {title}
        </label>
      </div>
    );
  }

  onNumberFieldChange(e, onChange) {
    const value = e.target.value;
    /^\d*\.?\d{0,4}$/.test(value) || !value ? onChange(e) : e.preventDefault();
  }

  onDatePartingDeskChange(props, checked) {
    const { formData } = this.props;
    const clonedData = cloneDeep(formData.dayParting || {});

    let hours = clonedData[props.original.name] || [props.column.Header];

    const selectAllHours = (checked) => {
      const results = [];
      for (let hour = 0; hour < 24; hour++) {
        const hourStr = hour.toString();
        if (checked) {
          results.push(hourStr.padStart(2, "0"));
        }
      }
      return results;
    };

    if (props.column.Header === "Action") {
      hours = selectAllHours(checked);
    } else if (
      Object.keys(clonedData).length &&
      clonedData[props.original.name]
    ) {
      hours = checked
        ? [...hours, props.column.Header]
        : hours.filter((item) => item !== props.column.Header);
    }

    if (hours.length) {
      clonedData[props.original.name] = hours;
    } else {
      // Don't save empty hours object for campaign scheduler
      delete clonedData[props.original.name];
    }

    if (!checked) {
      this.setState({ isSelectedAll: checked });
    }

    this.props.change("dayParting", clonedData);
  }

  onSelectAllDays(checked) {
    const results = {};

    if (checked) {
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

      for (const day of days) {
        results[day] = [];

        for (let hour = 0; hour < 24; hour++) {
          const hourStr = hour.toString();
          results[day].push(hourStr.padStart(2, "0"));
        }
      }
    }

    this.props.change("dayParting", results);

    this.setState({ isSelectedAll: checked });
  }

  onSelectChange(attribute, filter) {
    this.setState((prevState) => ({
      // dataThirdParty: this.props.dataPartnerslse,
      filters: {
        ...prevState.filters,
        [attribute]: filter.value ? this.state.dataThirdParty : null,
      },
    }));
    this.props.change(attribute, filter.value);
  }

  onSelectCountryChange(selectedCountries) {
    const { formData } = this.props;
    const converted =
      (selectedCountries &&
        selectedCountries.map((country) => country.value)) ||
      null;
    if (formData.isIncludeGeo) {
      this.props.change("geography", converted);
      this.setState({ selectedCountries });
    } else {
      this.props.change("geoExclude", converted);
      this.setState({ selectedCountriesExclude: selectedCountries });
    }
  }

  onSelectBrowsersChange(selectedBrowser) {
    selectedBrowser =
      selectedBrowser && selectedBrowser.filter((el) => el.value);
    const converted =
      (selectedBrowser && selectedBrowser.map((browser) => browser.value)) ||
      [];
    this.props.change("selectedBrowsers", converted);
  }

  onSelectCarriesChange(selectedCarriers) {
    selectedCarriers =
      selectedCarriers && selectedCarriers.filter((el) => el.value !== "-");
    let converted =
      (selectedCarriers && selectedCarriers.map((carr) => carr.value)) || [];
    if (converted != null) {
      converted = [...new Set(converted.map((el) => JSON.stringify(el)))].map(
        (el) => JSON.parse(el)
      );
    }
    this.props.change("selectedCarriers", converted);
  }

  onSelectCityChange(selectedCity) {
    const converted =
      (selectedCity && selectedCity.map((city) => city.value)) || null;
    this.props.change("city", converted);
    this.setState({ selectedCity });
  }

  onSelectLanguageChange(selectedLanguage) {
    const converted =
      (selectedLanguage && selectedLanguage.map((item) => item.value)) || null;
    this.props.change("language", converted);
    this.setState({ selectedLanguage });
  }

  onSelectPlatformChange(selectedPlatform) {
    const converted =
      (selectedPlatform && selectedPlatform.map((item) => item.value)) || [];
    this.props.change("platform", converted);
    this.setState({ selectedPlatform });
  }

  onSelectAdvertiserChange(selectedAdvertiser) {
    this.props.change("advertiserId", selectedAdvertiser.value);
    this.setState({
      selectedAdvertiser: selectedAdvertiser.value ? selectedAdvertiser : null,
    });
  }

  toggleDropdown(name) {
    this.setState((prevState) => ({
      [name]: !prevState[name],
    }));
  }

  setOsVersion(name, value, dropdownName) {
    this.setState({
      [name]: value,
    });
    this.props.change(name, value);
    this.toggleDropdown(dropdownName);
  }

  onSelectClose(element) {
    setTimeout(() => {
      this.setState({
        [element]: false,
      });
    }, 300);
  }

  handleChangeCaretForInsertMacros(field, value) {
    const key = `caret-${field}`;
    this.setState({
      [key]: value,
    });
  }

  onChangeTab(tab) {
    this.setState({ tabID: tab.target.value });
    window.scrollTo(0,0)
    if (tab.target.value === "six") firstError = [];
  }
 
  handleClick(tab){
    this.setState({openModal:!this.state.openModal, segmentId: tab})
    if(tab == "1") {
      this.setState({mySegments: this.props.audiences})
    }
  }
  
  async onChangeFilter(data){
    await this.props.actions.loadDataPartners({
      limit: 10,
      after : '',
      filter: data.value
    });
    this.setState({      
      selectedThirdParty: data.value ? data : "",
      partnerFilter: data.value,
    })
  }

  onChangeSegmentsId(el) {
    if(el == "1") {
      this.setState({mySegments: this.props.audiences})
    }
    this.setState({segmentId: el});
  }
  
  onCloseModal(){
    this.setState(prevState => ({
      openModal: !prevState.openModal
    }));
  }

  groupsList(data){
    this.setState({outputData: data}),
      this.onCloseModal()
  }
  groupsData(data){
    this.setState({outputDataList: data}) 
  }

  render() {
    const {outputDataList, outputData} = this.state
    const groupsData = [...outputData && outputData.reduce((r, { group, name, toggle, cost }) => {
      r.has(group) || r.set(group, {
        group,
        segments: []
      });
      r.get(group).segments.push({ name, toggle, cost});
      return r;
    }, new Map).values()];

    const {
      campaign,
      formData,
      addCreative,
      formData: { deviceType, modelPayment },
      initialValues: { monetizationType },
    } = this.props;
    const {
      campaignTracking: { fields, labels },
      targeting,
    } = localization.createCampaignForm;
    const { selectImpressionTypeData } = this.state.filters;
    const animatedComponents = makeAnimated();
    const classNamePlatform = classNames({
      "form-group": true,
      disabled:
        deviceType === ALL ||
        deviceType === DESKTOP ||
        deviceType === CONNECTEDTV,
    });
    const classNameDesktop = classNames({
      "": true,
      disabled: deviceType === ALL,
    });
    const classNameTargetingOptions = classNames({
      "": true,
      disabled: !formData.targetingAdvancedOptions,
    });
    const { validateMaxBid, tabID } = this.state;
    const { currentUser } = this.props.auth;
    const errArray1 = [ 'advertiserId', 'campaignName', 'trackingUrl', 'topLevelDomain', ]
    const errArray2 = [ 'budget']
    const errBannerArray = ['tagUrl']
    const errNativeArray = ['creativeName', 'creativeCta', 'creativeSponsored', 'creativeDescription'];
    const errAudioarray = ['adTitle', 'audioDuration'];
    const errVideoarray = ['adTitle', 'videoDuration']
    const checkForm1 =arrayChecker(errArray1, firstError)
    const checkForm2 =arrayChecker(errArray2, firstError)
    const checkNativeForm = arrayChecker(errNativeArray, firstError)
    const checkAudioForm = arrayChecker(errAudioarray, firstError)
    const checkBannerForm = arrayChecker(errBannerArray, firstError)
    const checkVideoForm = arrayChecker(errVideoarray, firstError);
    return (
      <form className="form card" onSubmit={this.props.handleSubmit}>
        <Tabs defaultTab={checkForm1===true && tabID==="six"
          ? this.setState({ tabID: "one"})
          : checkForm2 && !checkForm1 && tabID==="six"
            ? this.setState({ tabID: "one"})
            : tabID
          }
        >
          <TabList>
            <Tab type="button" tabFor="one" onClick={this.onChangeTab} value="one">
              <div value="one" style = {{color: `${checkForm1 == true ? 'red' : 'rwt__tab'}`}}>
                {localization.createCampaignForm.campaignTracking.title}
              </div>
            </Tab>
            <Tab type="button" tabFor="two" onClick={this.onChangeTab} value="two">
              <div value="two" style = {{color: `${checkForm2 == true ? 'red' : 'rwt__tab'}`}}>
                {localization.createCampaignForm.budgetSchedule.titleBudget}
              </div>
            </Tab>
            <Tab type="button" tabFor="three" onClick={this.onChangeTab} value="three">
              {targeting.title}
            </Tab>
            {(!currentUser.isInventoriesAllowed &&
              currentUser.role === userConstants.ADVERTISER) ||
            currentUser.role === userConstants.ACCOUNT_MANAGER ? null : (
              <Tab type="button" tabFor="four" onClick={this.onChangeTab} value="four">
                  {localization.createCampaignForm.inventoryControl.title}  
                </Tab>
            )}
            <Tab type="button" tabFor="five">
              Audience
            </Tab>
            {/* <Tab type="button" tabFor="six">
              {localization.createCampaignForm.creatives.title} */}
            <Tab type="button" tabFor="six" onClick={this.onChangeTab} value="six">
            <div value="six" style = {{color: `${checkNativeForm == true || 
              checkBannerForm == true || checkVideoForm == true ||
              checkAudioForm == true 
              ? 'red' : 'rwt__tab'}`}}>
              {localization.createCampaignForm.creatives.title}</div>
            </Tab>
          </TabList>
          <Accordion
            preExpanded={["1", "2", "3", "4", "5", "6"]}
            allowMultipleExpanded={true}
          >
            <TabPanel type="button" tabId="one">
              <AccordionItem uuid={"1"}>
                <AccordionItemPanel>
                  <div className="card_body">
                    <div className="card_body-item">
                      <div className="adType">
                        <p className="ad_typeTitle">Ad type</p>
                        {monetizationType &&
                          monetizationType.toUpperCase() === BANNER && (
                            <label className="Ad_type">
                              <img src={CheckCircle} />
                              Banner AD
                            </label>
                          )}
                        {monetizationType &&
                          monetizationType.toUpperCase() === NATIVEADD && (
                            <label className="Ad_type">
                              <img src={CheckCircle} />
                              Native AD
                            </label>
                          )}
                        {monetizationType &&
                          monetizationType.toUpperCase() === VIDEOADD &&
                          formData.deviceType &&
                          formData.deviceType !== CONNECTEDTV && (
                            <label className="Ad_type">
                              <img src={CheckCircle} />
                              Video AD
                            </label>
                          )}
                        {monetizationType &&
                          monetizationType.toUpperCase() === AUDIOADD && (
                            <label className="Ad_type">
                              <img src={CheckCircle} />
                              Audio AD
                            </label>
                          )}
                        {formData.deviceType &&
                          formData.deviceType === CONNECTEDTV && (
                            <label className="Ad_type">
                              <img src={CheckCircle} />
                              CTV AD
                            </label>
                          )}
                      </div>
                      <DisplayCheck
                        roles={[
                          userConstants.OWNER,
                          userConstants.ADMIN,
                          userConstants.ACCOUNT_MANAGER,
                        ]}
                      >
                        <Field
                          component={this.renderSelectAdvertiserField}
                          name="advertiserId"
                          title={labels.advertiserName}
                          selectedAdvertiser={this.state.selectedAdvertiser}
                          validate={[required]}
                          selectAdvertiserData={this.state.selectAdvertiserData}
                        />
                      </DisplayCheck>
                      <DisplayCheck
                        roles={[userConstants.OWNER, userConstants.ADMIN]}
                      >
                        {monetizationType &&
                          ![PUSH, POP].includes(
                            monetizationType.toUpperCase()
                          ) && (
                            <Fragment>
                              <div className="form-group">
                                <p className="form__text-field__name">
                                  {labels.status}
                                </p>
                                <div className="form-group_row">
                                  <Field
                                    name="status"
                                    component={this.renderRadioField}
                                    id="include"
                                    title={fields.active}
                                    val={ACTIVE}
                                    checked={formData.status === ACTIVE}
                                  />
                                  <Field
                                    name="status"
                                    component={this.renderRadioField}
                                    id="exclude"
                                    title={fields.paused}
                                    val={PAUSED}
                                    checked={formData.status === PAUSED}
                                  />
                                </div>
                              </div>
                            </Fragment>
                          )}
                      </DisplayCheck>
                      <div className="form-group1">
                        <Field
                          component={this.renderRegularTextField}
                          title={labels.campaignName}
                          type="text"
                          name="campaignName"
                          validate={[required]}
                        />
                      </div>
                      {monetizationType &&
                        [POP].includes(monetizationType.toUpperCase()) && (
                          <Fragment>
                            <div className="form-group">
                              <Field
                                component={this.renderRegularTextField}
                                title={"title"}
                                type="text"
                                name="titleXml"
                              />
                            </div>
                            <div className="form-group">
                              <Field
                                component={this.renderRegularTextField}
                                title={"description"}
                                type="text"
                                name="descriptionXml"
                              />
                            </div>
                          </Fragment>
                        )}
                      <div className="form-group1">
                        {formData.tagEnable ? null : (
                          <div className={"form__text-field"}>
                            <div className="form__text-field__wrapper">
                              <Field
                                component={this.renderTrackingUrlField}
                                title={labels.campaignURL}
                                type="text"
                                name="trackingUrl"
                                normalize={trimmer}
                                validate={[required]}
                                onclick={(e) =>
                                  setCaretInput(
                                    e.nativeEvent,
                                    this.handleChangeCaretForInsertMacros
                                  )
                                }
                                onchange={(e) =>
                                  setCaretInput(
                                    e.nativeEvent,
                                    this.handleChangeCaretForInsertMacros
                                  )
                                }
                              />
                            </div>
                          </div>
                        )}
                        <div className="campaignMacros">
                          {formData.tagEnable ? null : (
                            <Fragment>
                              <div className="macros-group">
                                <span>{fields.requiredMacros}:</span>
                                <button
                                  onClick={() =>
                                    this.appendMacros(
                                      "trackingUrl",
                                      "{CLICK_ID}"
                                    )
                                  }
                                  type="button"
                                  className="link"
                                >
                                  {fields.clickid}
                                </button>
                                <div className="macros_sub">
                                  <span>{fields.optionalMacros}:</span>
                                  <button
                                    onClick={() =>
                                      this.appendMacros(
                                        "trackingUrl",
                                        "{PUBLISHER_ID}"
                                      )
                                    }
                                    type="button"
                                    className="link"
                                  >
                                    {fields.publisheruuid}
                                  </button>
                                  <button
                                    onClick={() =>
                                      this.appendMacros(
                                        "trackingUrl",
                                        "{DEVICE_ID}"
                                      )
                                    }
                                    type="button"
                                    className="link"
                                  >
                                    {fields.deviceid}
                                  </button>
                                  <button
                                    onClick={() =>
                                      this.appendMacros(
                                        "trackingUrl",
                                        "{APP_BUNDLE}"
                                      )
                                    }
                                    type="button"
                                    className="link"
                                  >
                                    {fields.appBundle}
                                  </button>
                                  <button
                                    onClick={() =>
                                      this.appendMacros(
                                        "trackingUrl",
                                        "{APP_NAME}"
                                      )
                                    }
                                    type="button"
                                    className="link"
                                  >
                                    {fields.appName}
                                  </button>
                                  <button
                                    onClick={() =>
                                      this.appendMacros("trackingUrl", "{IFA}")
                                    }
                                    type="button"
                                    className="link"
                                  >
                                    {fields.ifa}
                                  </button>
                                  <button
                                    onClick={() =>
                                      this.appendMacros(
                                        "trackingUrl",
                                        "{AUCTION_PRICE}"
                                      )
                                    }
                                    type="button"
                                    className="link"
                                  >
                                    {fields.auctionPrice}
                                  </button>
                                  <button
                                    onClick={() =>
                                      this.appendMacros(
                                        "trackingUrl",
                                        "{CR_ID}"
                                      )
                                    }
                                    type="button"
                                    className="link"
                                  >
                                    {fields.crid}
                                  </button>
                                  <button
                                    onClick={() =>
                                      this.appendMacros("trackingUrl", "{IP}")
                                    }
                                    type="button"
                                    className="link"
                                  >
                                    {fields.ip}
                                  </button>
                                </div>
                              </div>
                            </Fragment>
                          )}
                        </div>
                      </div>
                      {!formData.tagEnable &&
                        monetizationType &&
                        ![PUSH, POP].includes(
                          monetizationType.toUpperCase()
                        ) && (
                          <Fragment>
                            <div className="form-group1">
                              <Field
                                component={this.renderRegularTextField}
                                title={labels.impressionURL}
                                name="dspImpUrl"
                              />
                            </div>
                            <div className="form-group1">
                              <div className="form-group1_row">
                                <Field
                                  component={this.renderRegularTextField}
                                  title={labels.topLevel}
                                  name="topLevelDomain"
                                  validate={[required]}
                                />
                              </div>
                            </div>
                          </Fragment>
                        )}
                      <div className="form-group1 nowrap align-end">
                        <Field
                          component={this.renderPostbackUrlTextField}
                          title={labels.postbackURL}
                          name="postbackUrl"
                        />
                        <CopyToClipboard
                          onCopy={() =>
                            showSuccessNotification(
                              localization.integration.copied
                            )
                          }
                          text={formData.postbackUrl}
                        >
                          <button type="button" className="btn white">
                            {localization.forms.copy}
                          </button>
                        </CopyToClipboard>
                      </div>
                    </div>
                    <div className="card_body-item">
                      {monetizationType &&
                        ![PUSH, POP].includes(
                          monetizationType.toUpperCase()
                        ) && (
                          <Fragment>
                            <div className="form-group">
                              <p className="form__text-field__name">
                                {labels.antiFraudDet}
                              </p>
                              <div className="form-group_row">
                                <Field
                                  name="enableAntiFraudDetection"
                                  title={<span>Enable</span>}
                                  component={this.renderCheckboxField}
                                />
                                <div className="tooltip info">
                                  <span className="tooltiptext">
                                    {fields.antiFraudDesc}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Fragment>
                        )}
                      <CampaignTags
                        {...this.props}
                        campaignId={this.props.match.params.campaignId}
                      />
                      {monetizationType &&
                        [POP].includes(monetizationType.toUpperCase()) && (
                          <div className="form-group">
                            <div className={"form__text-field"}>
                              <div className="form__text-field__wrapper">
                                <span className="form__text-field__name">
                                  {"domain"}
                                </span>
                                <Field
                                  component="input"
                                  title={"domain"}
                                  type="text"
                                  name="domain"
                                  onChange={(e) =>
                                    setCaretInput(
                                      e.nativeEvent,
                                      this.handleChangeCaretForInsertMacros
                                    )
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                  <div className="Btn_Container" style={{ marginTop: 112 }}>
                    <button
                      onClick={() => window.history.back()}
                      type="button"
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
                </AccordionItemPanel>
              </AccordionItem>
            </TabPanel>
            {formData ? (
              <TabPanel tabId="two">
                <Budget
                  formData={formData}
                  renderRadioField={this.renderRadioField}
                  onOpenConfirmationDialog={this.onOpenConfirmationDialog}
                  renderRegularTextField={this.renderRegularTextField}
                  renderDatePicker={this.renderDatePicker}
                  change={this.props.change}
                  budgetAdvancedOptions={this.state.budgetAdvancedOptions}
                  selectImpressionTypeData={selectImpressionTypeData}
                  renderCheckboxField={this.renderCheckboxField}
                />
                <div className="Btn_Container" style={{ marginTop: 112 }}>
                  <button
                    onClick={() => window.history.back()}
                    type="button"
                    style={{ marginRight: 16 }}
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
            ) : null}
            <TabPanel tabId="three">
              <AccordionItem uuid={"3"}>
                <AccordionItemPanel>
                  <div className="card_body">
                    <div className="card_body-item">
                      {monetizationType &&
                        ![PUSH, POP].includes(
                          monetizationType.toUpperCase()
                        ) && (
                          <Fragment>
                            {/* Category */}
                            <div className="form-group">
                              <div className="form__text-field__name">
                                {labels.campaignCat}
                              </div>
                              <div className="w100">
                                <Select
                                  className="country-select"
                                  options={this.state.selectCategoryData}
                                  onChange={this.onSelectCategoryChange}
                                  value={this.state.selectedCategories}
                                  isMulti
                                  styles={styles}
                                  theme={(theme) => ({
                                    ...theme,
                                    colors: {
                                      ...theme.colors,
                                      primary: "#000000",
                                    },
                                  })}
                                  components={animatedComponents}
                                />
                              </div>
                            </div>
                            {/* Campaign Scheduling */}
                            <div className="form-group">
                              <div className="form__text-field__name">
                                {targeting.labels.dayParting}
                                <div className="tooltip info">
                                  <span className="tooltiptext">
                                    Timezone: UTC
                                  </span>
                                </div>
                              </div>
                              <div className="form-group_row">
                                <Field
                                  name="isDayPartingEnable"
                                  component={this.renderRadioField}
                                  title={targeting.fields.disable}
                                  val={false}
                                  checked={
                                    formData.isDayPartingEnable === false
                                  }
                                  normalize={normalizeBoolean}
                                />
                                <Field
                                  name="isDayPartingEnable"
                                  component={this.renderRadioField}
                                  title={targeting.fields.enable}
                                  onChange={this.onSelectAllDays}
                                  val={true}
                                  checked={formData.isDayPartingEnable === true}
                                  normalize={normalizeBoolean}
                                />
                              </div>
                            </div>
                            {formData.isDayPartingEnable && (
                              <div className="form-group w100">
                                <DayPartingDesk
                                  data={formData.dayParting}
                                  onChangeHandler={this.onDatePartingDeskChange}
                                  onSelectAllDays={this.onSelectAllDays}
                                  isSelectedAll={this.state.isSelectedAll}
                                />
                              </div>
                            )}
                          </Fragment>
                        )}
                      <Location
                        changeCity={this.changeCity}
                        onSelectCityChange={this.onSelectCityChange}
                        onSelectCountryChange={this.onSelectCountryChange}
                        monetizationType={monetizationType}
                        formData={formData}
                        {...this.state}
                      />
                      {/* Languages */}
                      <div className="form-group">
                        <div className="form-group1_col">
                          <div className="form__text-field__name">
                            {labels.languages}
                          </div>
                          <div className="w100">
                            <Select
                              className="country-select"
                              options={this.state.selectLanguagesData}
                              onChange={this.onSelectLanguageChange}
                              value={this.state.selectedLanguage}
                              components={animatedComponents}
                              isMulti
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
                      {monetizationType &&
                        ![PUSH, POP].includes(
                          monetizationType.toUpperCase()
                        ) && (
                          <Fragment>
                            <div className="form-group">
                              <div className="form__text-field__name">
                                {targeting.labels.inventoryType}
                                <div className="tooltip info">
                                  <span className="tooltiptext">
                                    This option filters available inventories
                                    according to the supported inventory type
                                  </span>
                                </div>
                              </div>
                              <div className="form-group_row">
                                {[
                                  trafficType.ALL,
                                  trafficType.WEB,
                                  trafficType.IN_APP,
                                ].map((item, index) => (
                                  <Field
                                    component={this.renderRadioField}
                                    name="trafficType"
                                    title={CapitalToLower(item)}
                                    key={index}
                                    val={item}
                                    onChange={(event, newValue, prevValue) =>
                                      this.onOpenConfirmationDialog(
                                        event,
                                        item,
                                        prevValue
                                      )
                                    }
                                    checked={formData.trafficType === item}
                                  />
                                ))}
                              </div>
                            </div>

                            <div className="form-group">
                              <div className="form__text-field__name">
                                {targeting.labels.deviceType}
                              </div>

                              {monetizationType &&
                                monetizationType.toUpperCase() !==
                                  CONNECTEDTV &&
                                deviceType !== CONNECTEDTV && (
                                  <div className="form-group_row">
                                    <Field
                                      name="deviceType"
                                      component={this.renderRadioField}
                                      id="all"
                                      title={targeting.fields.all}
                                      val={ALL}
                                      checked={formData.deviceType === ALL}
                                    />
                                    <Field
                                      name="deviceType"
                                      component={this.renderRadioField}
                                      id="mobile"
                                      title={targeting.fields.mobile}
                                      val={MOBILE}
                                      checked={formData.deviceType === MOBILE}
                                    />
                                    <Field
                                      name="deviceType"
                                      component={this.renderRadioField}
                                      id="tablets"
                                      title={targeting.fields.tablets}
                                      val={TABLETS}
                                      checked={formData.deviceType === TABLETS}
                                    />
                                    <Field
                                      name="deviceType"
                                      component={this.renderRadioField}
                                      className={classNameDesktop}
                                      id="desktop"
                                      title={targeting.fields.desktop}
                                      val={DESKTOP}
                                      checked={formData.deviceType === DESKTOP}
                                    />
                                  </div>
                                )}

                              <div className="form-group_row">
                                {(monetizationType &&
                                  monetizationType.toUpperCase() ===
                                    CONNECTEDTV) ||
                                deviceType === CONNECTEDTV ? (
                                  <Field
                                    name="deviceType"
                                    component={this.renderSingleItem}
                                    className={classNameDesktop}
                                    id="connectedTV"
                                    title={targeting.fields.connectedTV}
                                    val={CONNECTEDTV}
                                    checked
                                  />
                                ) : null}
                              </div>
                            </div>
                            {monetizationType &&
                              monetizationType.toUpperCase() !==
                                CONNECTEDTV && (
                                <div className={classNamePlatform}>
                                  <div className="form__text-field__name">
                                    {targeting.labels.platform}
                                  </div>
                                  <div className="form-group_row">
                                    <Field
                                      name="platform"
                                      component={this.renderRadioField}
                                      id="all"
                                      title={targeting.fields.all}
                                      val={ALL}
                                      checked={
                                        formData.platform &&
                                        formData.platform.includes(ALL)
                                      }
                                    />
                                    <Field
                                      name="platform"
                                      component={this.renderRadioField}
                                      id="include"
                                      title="iOS"
                                      val={IOS}
                                      checked={
                                        formData.platform &&
                                        formData.platform.includes(IOS)
                                      }
                                    />
                                    <Field
                                      name="platform"
                                      component={this.renderRadioField}
                                      id="include"
                                      title="Android"
                                      val={ANDROID}
                                      checked={
                                        formData.platform &&
                                        formData.platform.includes(ANDROID)
                                      }
                                    />
                                  </div>
                                </div>
                              )}
                            {deviceType !== ALL &&
                              deviceType !== DESKTOP &&
                              deviceType !== CONNECTEDTV &&
                              formData.platform &&
                              formData.platform.includes(IOS) && (
                                <div className="form-group">
                                  <div className="form__text-field__name">
                                    Apple iOS ver:
                                  </div>
                                  <div className="form-group_row">
                                    <div
                                      onBlur={() =>
                                        this.onSelectClose(
                                          "showMinIosVersionDropdown"
                                        )
                                      }
                                      className="dropdown_cover"
                                    >
                                      <div
                                        className={classNames(
                                          "dropdown bordered",
                                          {
                                            opened:
                                              this.state
                                                .showMinIosVersionDropdown,
                                          }
                                        )}
                                        onMouseDown={this.props.onMouseDown}
                                      >
                                        <button
                                          className="dropdown__button"
                                          tabIndex="0"
                                          type="button"
                                          onClick={() =>
                                            this.toggleDropdown(
                                              "showMinIosVersionDropdown"
                                            )
                                          }
                                        >
                                          <span className="dropdown__button-value">
                                            {this.state.minIosVersion || "Min"}
                                          </span>
                                          <span className="dropdown__arrow" />
                                        </button>
                                        <div className="dropdown__menu">
                                          <div className="dropdown__menu-scroll">
                                            <div
                                              className="dropdown__item nowrap"
                                              onClick={() =>
                                                this.setOsVersion(
                                                  "minIosVersion",
                                                  "",
                                                  "showMinIosVersionDropdown"
                                                )
                                              }
                                            >
                                              <span> - </span>
                                            </div>
                                            {this.state.iosVersionsList.map(
                                              (version, i) => (
                                                <div
                                                  key={i}
                                                  className={classNames(
                                                    "dropdown__item nowrap",
                                                    {
                                                      hidden:
                                                        formData.maxIosVersion &&
                                                        compareVersions(
                                                          version,
                                                          formData.maxIosVersion
                                                        ) === 1,
                                                    }
                                                  )}
                                                  onClick={() =>
                                                    this.setOsVersion(
                                                      "minIosVersion",
                                                      version,
                                                      "showMinIosVersionDropdown"
                                                    )
                                                  }
                                                >
                                                  <span>{version}</span>
                                                </div>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div
                                      onBlur={() =>
                                        this.onSelectClose(
                                          "showMaxIosVersionDropdown"
                                        )
                                      }
                                      className="dropdown_cover"
                                    >
                                      <div
                                        className={classNames(
                                          "dropdown bordered",
                                          {
                                            opened:
                                              this.state
                                                .showMaxIosVersionDropdown,
                                          }
                                        )}
                                      >
                                        <button
                                          className="dropdown__button"
                                          tabIndex="0"
                                          type="button"
                                          onClick={() =>
                                            this.toggleDropdown(
                                              "showMaxIosVersionDropdown"
                                            )
                                          }
                                        >
                                          <span className="dropdown__button-value">
                                            {this.state.maxIosVersion || "Max"}
                                          </span>
                                          <span className="dropdown__arrow" />
                                        </button>
                                        <div className="dropdown__menu">
                                          <div className="dropdown__menu-scroll">
                                            <div
                                              className="dropdown__item nowrap"
                                              onClick={() =>
                                                this.setOsVersion(
                                                  "maxIosVersion",
                                                  "",
                                                  "showMaxIosVersionDropdown"
                                                )
                                              }
                                            >
                                              <span> - </span>
                                            </div>
                                            {this.state.iosVersionsList.map(
                                              (version, i) => (
                                                <div
                                                  key={i}
                                                  className={classNames(
                                                    "dropdown__item nowrap",
                                                    {
                                                      hidden:
                                                        formData.minIosVersion &&
                                                        compareVersions(
                                                          formData.minIosVersion,
                                                          version
                                                        ) === 1,
                                                    }
                                                  )}
                                                  onClick={() =>
                                                    this.setOsVersion(
                                                      "maxIosVersion",
                                                      version,
                                                      "showMaxIosVersionDropdown"
                                                    )
                                                  }
                                                >
                                                  <span>{version}</span>
                                                </div>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            {deviceType !== ALL &&
                              deviceType !== DESKTOP &&
                              deviceType !== CONNECTEDTV &&
                              formData.platform &&
                              formData.platform.includes(ANDROID) && (
                                <div className="form-group">
                                  <div className="form__text-field__name">
                                    Android ver:
                                  </div>
                                  <div className="form-group_row">
                                    <div
                                      onBlur={() =>
                                        this.onSelectClose(
                                          "showMinAndroidVersionDropdown"
                                        )
                                      }
                                      className="dropdown_cover"
                                    >
                                      <div
                                        className={classNames(
                                          "dropdown bordered",
                                          {
                                            opened:
                                              this.state
                                                .showMinAndroidVersionDropdown,
                                          }
                                        )}
                                      >
                                        <button
                                          className="dropdown__button"
                                          tabIndex="0"
                                          type="button"
                                          onClick={() =>
                                            this.toggleDropdown(
                                              "showMinAndroidVersionDropdown"
                                            )
                                          }
                                        >
                                          <span className="dropdown__button-value">
                                            {this.state.minAndroidVersion ||
                                              "Min"}
                                          </span>
                                          <span className="dropdown__arrow" />
                                        </button>
                                        <div className="dropdown__menu">
                                          <div className="dropdown__menu-scroll">
                                            <div
                                              className="dropdown__item nowrap"
                                              onClick={() =>
                                                this.setOsVersion(
                                                  "minAndroidVersion",
                                                  "",
                                                  "showMinAndroidVersionDropdown"
                                                )
                                              }
                                            >
                                              <span> - </span>
                                            </div>
                                            {this.state.androidVersionsList.map(
                                              (version, i) => (
                                                <div
                                                  key={i}
                                                  className={classNames(
                                                    "dropdown__item nowrap",
                                                    {
                                                      "dropdown__item--hidden":
                                                        formData.maxAndroidVersion &&
                                                        compareVersions(
                                                          version,
                                                          formData.maxAndroidVersion
                                                        ) === 1,
                                                    }
                                                  )}
                                                  onClick={() =>
                                                    this.setOsVersion(
                                                      "minAndroidVersion",
                                                      version,
                                                      "showMinAndroidVersionDropdown"
                                                    )
                                                  }
                                                >
                                                  <span>{version}</span>
                                                </div>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div
                                      onBlur={() =>
                                        this.onSelectClose(
                                          "showMaxAndroidVersionDropdown"
                                        )
                                      }
                                      className="dropdown_cover"
                                    >
                                      <div
                                        className={classNames(
                                          "dropdown bordered",
                                          {
                                            opened:
                                              this.state
                                                .showMaxAndroidVersionDropdown,
                                          }
                                        )}
                                      >
                                        <button
                                          className="dropdown__button"
                                          tabIndex="0"
                                          type="button"
                                          onClick={() =>
                                            this.toggleDropdown(
                                              "showMaxAndroidVersionDropdown"
                                            )
                                          }
                                        >
                                          <span className="dropdown__button-value">
                                            {this.state.maxAndroidVersion ||
                                              "Max"}
                                          </span>
                                          <span className="dropdown__arrow" />
                                        </button>
                                        <div className="dropdown__menu">
                                          <div className="dropdown__menu-scroll">
                                            <div
                                              className="dropdown__item nowrap"
                                              onClick={() =>
                                                this.setOsVersion(
                                                  "maxAndroidVersion",
                                                  "",
                                                  "showMaxAndroidVersionDropdown"
                                                )
                                              }
                                            >
                                              <span> - </span>
                                            </div>
                                            {this.state.androidVersionsList.map(
                                              (version, i) => (
                                                <div
                                                  key={i}
                                                  className={classNames(
                                                    "dropdown__item nowrap",
                                                    {
                                                      "dropdown__item--hidden":
                                                        formData.minAndroidVersion &&
                                                        compareVersions(
                                                          formData.minAndroidVersion,
                                                          version
                                                        ) === 1,
                                                    }
                                                  )}
                                                  onClick={() =>
                                                    this.setOsVersion(
                                                      "maxAndroidVersion",
                                                      version,
                                                      "showMaxAndroidVersionDropdown"
                                                    )
                                                  }
                                                >
                                                  <span>{version}</span>
                                                </div>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            <BrowserVersion
                              {...this.props}
                              onSelectBrowsersChange={
                                this.onSelectBrowsersChange
                              }
                            />
                            {/* {this.props.audiences.length ? (
                              <Field
                                component={SelectField}
                                name="audiences"
                                title={"Audience"}
                                options={this.props.audiences}
                                isMulti={true}
                                change={(e) =>
                                  this.props.change("audiences", e.value)
                                }
                              />
                            ) : null} */}
                          </Fragment>
                        )}
                    </div>

                    {/* right Target section */}
                    <div className="card_body-item">
                      {/* subscriber date */}
                      {monetizationType &&
                        ![PUSH, POP].includes(
                          monetizationType.toUpperCase()
                        ) && (
                          <Fragment>
                            <div className="form-group">
                              <div className="form__text-field__name">
                                {labels.advancedOpt}
                              </div>
                              <Field
                                name="targetingAdvancedOptions"
                                title={
                                  <span
                                    style={{
                                      fontSize: "14px",
                                      color: "#444",
                                    }}
                                  >
                                    Enable
                                  </span>
                                }
                                component={this.renderCheckboxField}
                                val={ENABLE}
                                checked={
                                  formData.targetingAdvancedOptions === ENABLE
                                }
                              />
                            </div>
                            <div className={classNameTargetingOptions}>
                              <div className="form-group">
                                <div className="form__text-field__name">
                                  {targeting.labels.gender}
                                </div>
                                <div className="form-group_row">
                                  <Field
                                    name="gender"
                                    component={this.renderRadioField}
                                    id="bothgenders"
                                    title={targeting.fields.both}
                                    val={FEMALE_AND_MALE}
                                    checked={
                                      formData.gender === FEMALE_AND_MALE
                                    }
                                  />
                                  <Field
                                    name="gender"
                                    component={this.renderRadioField}
                                    id="female"
                                    title={targeting.fields.female}
                                    val={FEMALE}
                                    checked={formData.gender === FEMALE}
                                  />
                                  <Field
                                    name="gender"
                                    component={this.renderRadioField}
                                    id="male"
                                    title={targeting.fields.male}
                                    val={MALE}
                                    checked={formData.gender === MALE}
                                  />
                                </div>
                              </div>
                              <div className="form-group">
                                <div className="form__text-field__name">
                                  {targeting.labels.age}
                                </div>
                                <div className="form-group_row">
                                  <Field
                                    name="ageGroup"
                                    component={this.renderRadioField}
                                    id="all"
                                    title={targeting.fields.all}
                                    val={ALL_AGE_GROUP}
                                    checked={
                                      formData.ageGroup === ALL_AGE_GROUP
                                    }
                                  />
                                  <Field
                                    name="ageGroup"
                                    component={this.renderRadioField}
                                    id="custom"
                                    title={targeting.fields.custom}
                                    val={CUSTOM}
                                    checked={formData.ageGroup === CUSTOM}
                                  />
                                </div>
                                <div className="form-group_row">
                                  {formData.ageGroup === CUSTOM && (
                                    <div className="requests-list mt2">
                                      <Field
                                        name="ageRange.12-17"
                                        title="12-17"
                                        component={this.renderCheckboxField}
                                      />
                                      <Field
                                        name="ageRange.18-24"
                                        title="18-24"
                                        component={this.renderCheckboxField}
                                      />
                                      <Field
                                        name="ageRange.25-34"
                                        title="25-34"
                                        component={this.renderCheckboxField}
                                      />
                                      <Field
                                        name="ageRange.35-44"
                                        title="35-44"
                                        component={this.renderCheckboxField}
                                      />
                                      <Field
                                        name="ageRange.45-54"
                                        title="45-54"
                                        component={this.renderCheckboxField}
                                      />
                                      <Field
                                        name="ageRange.55-64"
                                        title="55-64"
                                        component={this.renderCheckboxField}
                                      />
                                      <Field
                                        name="ageRange.65+"
                                        title="65+"
                                        component={this.renderCheckboxField}
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="form-group">
                                <div className="form__text-field__name">
                                  {targeting.labels.connections}
                                </div>
                                <div className="form-group_row">
                                  <Field
                                    id="carrier"
                                    name="connections"
                                    component={this.renderRadioField}
                                    title={targeting.fields.carrier}
                                    val={CARRIER_AND_WIFI}
                                    checked={
                                      formData.connections === CARRIER_AND_WIFI
                                    }
                                  />
                                  <Field
                                    name="connections"
                                    component={this.renderRadioField}
                                    id="wifi"
                                    title={targeting.fields.wifi}
                                    val={WIFI}
                                    checked={formData.connections === WIFI}
                                  />
                                </div>
                              </div>
                              <Carriers
                                {...this.props}
                                {...this.state}
                                onSelectCarriesChange={
                                  this.onSelectCarriesChange
                                }
                              />
                            </div>
                            <div className="form-group">
                              <div className="form__text-field__name">
                                {labels.bidRequestParam}
                              </div>
                              <div className="form-group_row">
                                <Field
                                  name="bidRequestParam"
                                  component={this.renderRadioField}
                                  id="disable"
                                  title={fields.disable}
                                  val={DISABLE}
                                  checked={formData.bidRequestParam === DISABLE}
                                />
                                <Field
                                  name="bidRequestParam"
                                  component={this.renderRadioField}
                                  id="enable"
                                  title={fields.enable}
                                  val={ENABLE}
                                  checked={formData.bidRequestParam === ENABLE}
                                />
                              </div>
                              <div className="form-group_row">
                                {formData.bidRequestParam === ENABLE && (
                                  <div className="requests-list mt2">
                                    <Field
                                      name="bidParams.isIfa"
                                      title={fields.ifa}
                                      component={this.renderCheckboxField}
                                    />
                                    <Field
                                      name="bidParams.isGDPR"
                                      title={fields.GDPR}
                                      component={this.renderCheckboxField}
                                    />
                                    <Field
                                      name="bidParams.isBundleId"
                                      title={fields.bundleID}
                                      component={this.renderCheckboxField}
                                    />
                                    <Field
                                      name="bidParams.isSiteId"
                                      title={fields.siteID}
                                      component={this.renderCheckboxField}
                                    />
                                    <Field
                                      name="bidParams.isSubId"
                                      title={fields.subID}
                                      component={this.renderCheckboxField}
                                    />
                                    <Field
                                      name="bidParams.isCOPA"
                                      title={fields.COPPA}
                                      component={this.renderCheckboxField}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </Fragment>
                        )}
                    </div>
                  </div>
                  <div className="Btn_Container" style={{ marginTop: 112 }}>
                    <button
                      onClick={() => window.history.back()}
                      type="button"
                      style={{ marginRight: 16 }}
                      className="btn white"
                    >
                      Cancel
                    </button>
                    <button
                      value="four"
                      onClick={this.onChangeTab}
                      type="button"
                      className="btn neutral"
                    >
                      Next
                    </button>
                  </div>
                </AccordionItemPanel>
              </AccordionItem>
            </TabPanel>
            <TabPanel tabId="four">
              {(!currentUser.isInventoriesAllowed &&
                currentUser.role === userConstants.ADVERTISER) ||
              currentUser.role === userConstants.ACCOUNT_MANAGER ? null : (
                <AccordionItem uuid={"4"}>
                  {/* <AccordionItemPanel> */}
                    <div className="card_body inventories">
                      <div className="flex w100">
                        {formData.inventoryControl ===
                          SELECT_INVENTORY_SOURCE &&
                        formData.inventories &&
                        this.props.inventoryList.length ? (
                          <InventoryControl
                            activeInventories={Object.values(
                              formData.inventories
                            )}
                            formData={formData}
                            entityId={formData.id}
                            inventories={this.props.inventoryList}
                            change={this.props.change}
                          />
                        ) : (
                          "No available inventories"
                        )}
                      </div>
                    </div>
                    <div className="Btn_Container" style={{ marginTop: 112 }}>
                      <button
                        onClick={() => window.history.back()}
                        type="button"
                        style={{ marginRight: 16 }}
                        className="btn white"
                      >
                        Cancel
                      </button>
                      <button
                        value="five"
                        onClick={this.onChangeTab}
                        type="button"
                        className="btn neutral"
                      >
                        Next
                      </button>
                    </div>
                  {/* </AccordionItemPanel> */}
                </AccordionItem>
              )}
            </TabPanel>
            <TabPanel tabId="five">
              <div className = "aud-tab_container">
                <div className = "audience_select">
                  <div  className = "segment-container">
                    <div  className = "mysegments">
                      <div className="segment_name" >{localization.campaigns.dataPartners.mySegments}</div>
                      <button type= "button" className="segment-btn" onClick={(e) => this.handleClick("1")}>
                      <div className = "segment_click">
                        <img src = {Vector} className="segment_icon"/></div>
                      </button>
                    </div>
                    <div className = "mysegments" >
                      <div className="segment_name">
                      {localization.campaigns.dataPartners.thirdPartySegments}
                      </div>
                        <button type ="button" className="segment-btn" onClick={() => this.handleClick("2")}>
                          <div className = "segment_click"><img src = {Vector} className="segment_icon"/></div>
                        </button>
                        <AudModal show = {this.state.openModal} 
                          onCloseModal ={() => this.onCloseModal()} 
                          segId = {this.state.segmentId}
                          onChangeSegId = {(e) => this.onChangeSegmentsId(e)}
                          mySegmentsData = {this.state.mySegments}
                          formData={formData}
                          finalGroups = {this.groupsList}
                          groupsListdata = {this.groupsData}
                          handleOnChange = {this.onChangeFilter}
                          filterName = {this.state.selectedThirdParty}
                          thirdPartyFilters = {thirdPartyFilters}
                          isRequestPending = {this.props.isRequestPending}
                          pagination = {this.props.paginationValue}
                          rowValues = {this.props.liveRampData}
                          digiseg = {this.props.digiseg}
                          limit = {this.props.limit}
                          partnerFilter={this.state.partnerFilter}
                        />
                      </div>
                  </div>
                  <div className="audience-display" >
                  
                    { outputData.length ?
                      <ul className = "tree">
                        <li className = "camp_name"><img src={CheckMark} className = "check_mark" />Diwali Sale</li>
                        <ul> 
                          {groupsData.map((el, i)=>(
                                <Fragment>
                                  <li className = "group" key = {i}>
                                    Group {el.group} 
                                    {el.segments.map((item, ind) =>
                                        (<p key = {ind}> 
                                          <div >
                                            <span className="segment_name" >
                                              {item.name}
                                            </span>
                                            {ind < el.segments.length-1 ? 
                                            <span className="segment_toggle"  disabled>
                                              {item.toggle}
                                            </span> : ""}
                                            
                                          </div>
                                        </p>)
                                      )}
                                  </li>

                                  {i < groupsData.length -1 ? <span className="groups_data_list" >
                                    <p style = {{padding:5}}> {outputDataList}</p>  
                                  </span> : null }
                                </Fragment>
                              )
                            )} 
                        </ul>
                      </ul>
                      :
                      <div className="audience-tab_text" >
                        <text >
                          Created audience segment will show here 
                          <br/>
                          <p disabled>to create the audience choose the segment type from left side</p>
                        </text>
                      </div>
                      
                    }  
                  </div>
                </div>
              <div className="Btn_Container1" 
              >
                <button
                  onClick={() => window.history.back()}
                  type="button"
                  style={{ marginRight: 16 }}
                  className="btn white"
                >
                  Cancel
                </button>
                <button
                  value="six"
                  onClick={this.onChangeTab}
                  type="button"
                  className="btn neutral"
                >
                  Next
                </button>
              </div>
            </div>
            </TabPanel>

            <TabPanel tabId="six">
              {monetizationType && monetizationType.toUpperCase() === BANNER && (
                <AccordionItem uuid={"6"}>
                  <AccordionItemPanel>
                    <Creatives
                      formData={this.props.formData}
                      resolutions={this.props.resolutions}
                      campaign={campaign}
                      addCreative={addCreative}
                      modelPayment={modelPayment}
                      change={this.props.change}
                      tagUrl={formData.tagUrl}
                      tagEnable={formData.tagEnable}
                      renderTextAreaField={this.renderTextAreaField}
                    />
                  </AccordionItemPanel>
                </AccordionItem>
              )}
              {monetizationType &&
              [NATIVEADD, NATIVEADD_ALIAS].includes(
                monetizationType.toUpperCase()
              ) ? (
                <AccordionItem uuid={"5"}>
                  <AccordionItemPanel>
                    <NativePushPopAdCreatives
                      campaign={campaign}
                      change={this.props.change}
                      renderRegularTextField={this.renderRegularTextField}
                      renderTextAreaField={this.renderTextAreaField}
                      renderSelect={this.renderSelect}
                      firstSubmit={this.state.firstSubmit}
                      trackingUrl={formData.trackingUrl}
                      monetizationType={monetizationType}
                    />
                  </AccordionItemPanel>
                </AccordionItem>
              ) : null}
              {monetizationType &&
              [PUSH].includes(monetizationType.toUpperCase()) ? (
                <AccordionItem uuid={"5"}>
                  <AccordionItemHeading>
                    <AccordionItemButton>
                      <div className="card_header bordered">
                        <h3 className="subheading">
                          {
                            localization.createCampaignForm.creativesNativeAds
                              .title
                          }
                        </h3>
                        <span className="icon" />
                      </div>
                    </AccordionItemButton>
                  </AccordionItemHeading>
                </AccordionItem>
              ) : null}
              {monetizationType &&
              [VIDEOADD].includes(monetizationType.toUpperCase()) ? (
                <AccordionItem uuid={"5"}>
                  <AccordionItemPanel>
                    <VideoAdCreatives
                      campaign={campaign}
                      endCard={formData.endCard}
                      change={this.props.change}
                      renderCheckboxField={this.renderCheckboxField}
                      renderTextAreaField={this.renderTextAreaField}
                      renderRadioField={this.renderRadioField}
                      renderRegularTextField={this.renderRegularTextField}
                      tagEnable={formData.tagEnable}
                      renderSelect={this.renderSelect}
                      firstSubmit={this.state.firstSubmit}
                      monetizationType={monetizationType.toLowerCase()}
                    />
                  </AccordionItemPanel>
                </AccordionItem>
              ) : null}
              {monetizationType &&
              [CONNECTEDTV].includes(monetizationType.toUpperCase()) &&
              this.props.change("monetizationType", VIDEOADD) ? (
                <AccordionItem uuid={"5"}>
                  <AccordionItemPanel>
                    <VideoAdCreatives
                      campaign={campaign}
                      endCard={formData.endCard}
                      change={this.props.change}
                      renderCheckboxField={this.renderCheckboxField}
                      renderTextAreaField={this.renderTextAreaField}
                      renderRadioField={this.renderRadioField}
                      renderRegularTextField={this.renderRegularTextField}
                      tagEnable={formData.tagEnable}
                      renderSelect={this.renderSelect}
                      firstSubmit={this.state.firstSubmit}
                      monetizationType={VIDEOADD.toLowerCase()}
                    />
                  </AccordionItemPanel>
                </AccordionItem>
              ) : null}
              {monetizationType &&
              [AUDIOADD].includes(monetizationType.toUpperCase()) ? (
                <AccordionItem uuid={"5"}>
                  <AccordionItemPanel>
                    <AudioAdCreatives
                      campaign={campaign}
                      endCard={formData.endCard}
                      change={this.props.change}
                      renderCheckboxField={this.renderCheckboxField}
                      renderTextAreaField={this.renderTextAreaField}
                      renderRadioField={this.renderRadioField}
                      renderRegularTextField={this.renderRegularTextField}
                      tagEnable={formData.tagEnable}
                      renderSelect={this.renderSelect}
                      firstSubmit={this.state.firstSubmit}
                      monetizationType={AUDIOADD.toLowerCase()}
                    />
                  </AccordionItemPanel>
                </AccordionItem>
              ) : null}
              <div className="btn-cover_campaigns">
                <span
                  className="btn white"
                  style={{ paddingTop: 10, marginRight: 16 }}
                  onClick={() => window.history.back()}
                >
                  {localization.forms.cancel}
                </span>
                <button
                  type="submit"
                  className="btn neutral"
                  style={{ width: 230 }}
                  onClick={() => this.setState({ firstSubmit: true })}
                >
                  {this.props.submitInProgress ? (
                    <Spin size="small" />
                  ) : (
                    <span className="btn__spinner--justified-wrapper">
                      <span
                        className={classNames({
                          vh: this.props.isRequestPending,
                        })}
                      >
                        {localization.forms.save} AND{" "}
                        {localization.forms.continue}
                      </span>
                    </span>
                  )}
                </button>
              </div>
            </TabPanel>
          </Accordion>
        </Tabs>
      </form>
    );
  }
}

const valueSelector = formValueSelector("CreateForm");

const mapStateToProps = (state) => ({
  auth: state.auth,
  formData: {
    status: valueSelector(state, "status"),
    tagEnable: valueSelector(state, "tagEnable"),
    tagUrl: valueSelector(state, "tagUrl"),
    selectedBrowsers: valueSelector(state, "selectedBrowsers"),
    endCard: valueSelector(state, "endCard"),
    impressionUrl: valueSelector(state, "impressionUrl"),
    advertisingChannel: valueSelector(state, "advertisingChannel"),
    modelPayment: valueSelector(state, "modelPayment"),
    accessStatus: valueSelector(state, "accessStatus"),
    trackingUrl: valueSelector(state, "trackingUrl"),
    postbackUrl: valueSelector(state, "postbackUrl"),
    frequencyCapInterval: valueSelector(state, "frequencyCapInterval"),
    enableNotifications: valueSelector(state, "enableNotifications"),
    notificationsThreshold: valueSelector(state, "notificationsThreshold"),
    enableAntiFraudDetection: valueSelector(state, "enableAntiFraudDetection"),
    frequencyCapping: valueSelector(state, "frequencyCapping"),
    targetingAdvancedOptions: valueSelector(state, "targetingAdvancedOptions"),
    budgetAdvancedOptions: valueSelector(state, "budgetAdvancedOptions"),
    cap: valueSelector(state, "cap"),
    advancedOptions: valueSelector(state, "advancedOptions"),
    bidRequestParam: valueSelector(state, "bidRequestParam"),
    geography: valueSelector(state, "geography"),
    state: valueSelector(state, "state"),
    language: valueSelector(state, "language"),
    platform: valueSelector(state, "platform"),
    deviceType: valueSelector(state, "deviceType"),
    connections: valueSelector(state, "connections"),
    inventories: valueSelector(state, "inventories"),
    appLink: valueSelector(state, "appLink"),
    gender: valueSelector(state, "gender"),
    minIosVersion: valueSelector(state, "minIosVersion"),
    maxIosVersion: valueSelector(state, "maxIosVersion"),
    minAndroidVersion: valueSelector(state, "minAndroidVersion"),
    maxAndroidVersion: valueSelector(state, "maxAndroidVersion"),
    totalBudget: valueSelector(state, "totalBudget"),
    inventoryControl: valueSelector(state, "inventoryControl"),
    advertiserId: valueSelector(state, "advertiserId"),
    disableConversionTest: valueSelector(state, "disableConversionTest"),
    disableTestLink: valueSelector(state, "disableTestLink"),
    category: valueSelector(state, "category"),
    campaignId: valueSelector(state, "campaignId"),
    city: valueSelector(state, "city"),
    bidType: valueSelector(state, "bidType"),
    monetizationType: valueSelector(state, "monetizationType"),
    ageGroup: valueSelector(state, "ageGroup"),
    selectedCarriers: valueSelector(state, "selectedCarriers"),
    inExGeomode: valueSelector(state, "inExGeomode"),
    deliveryType: valueSelector(state, "deliveryType"),
    isDayPartingEnable: valueSelector(state, "isDayPartingEnable"),
    dayParting: valueSelector(state, "dayParting"),
    bidParams: valueSelector(state, "bidParams"),
    ageRange: valueSelector(state, "ageRange"),
    isPmpSupport: valueSelector(state, "isPmpSupport"),
    trafficType: valueSelector(state, "trafficType"),
    tagsList: valueSelector(state, "tagsList"),
    audiences: valueSelector(state, "audiences"),
    dataPartners : valueSelector(state, "dataPartners"),
    pagenationValue: valueSelector(state, "pagenationValue"),
    resolutionsList: valueSelector(state, "resolutionsList"),
    creativeTitle: valueSelector(state, "creativeTitle"),
    creativeDescription: valueSelector(state, "creativeDescription"),
    creatives: valueSelector(state, "creatives"),
    budget: valueSelector(state, "budget"),
    isBiddingOptimization: valueSelector(state, "isBiddingOptimization"),
    isIncludeGeo: valueSelector(state, "isIncludeGeo"),
    geoExclude: valueSelector(state, "geoExclude"),
    fqCapClick: valueSelector(state, "fqCapClick"),
    fqCapClickInterval: valueSelector(state, "fqCapClickInterval"),
    fqCapClickValue: valueSelector(state, "fqCapClickValue"),
    adTitle: valueSelector(state, "adTitle"),
    toggle: valueSelector(state, "toggle"),
  },
  advertiser: state.users.advertiser,
  citiesList: state.countries.citiesList,
  inventoryList: state.campaigns.inventoryList,
  languagesList: state.countries.languagesList,
  resolutions: state.dsp.resolutions,
  liveRampData: state.campaigns.liveRampData,
  paginationValue : state.campaigns.paginationValue,
  limit: state.campaigns.limit,
  digiseg: state.campaigns.digiseg,
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(
    {
      resetCurrentCampaign,
      loadInventories,
      loadCities,
      loadFilteredCities,
      loadBannerResolutions,
      loadDataPartners,
    },
    dispatch
  ),
});

CreateForm.propTypes = {
  formData: PropTypes.object,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(
  reduxForm({
    form: "CreateForm",
    enableReinitialize: true,
    fields: Field,
    onSubmitFail,
    validate,
  })(CreateForm)
);
