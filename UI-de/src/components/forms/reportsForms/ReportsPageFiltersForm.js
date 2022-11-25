import React, { Component } from "react";
import { reduxForm, formValueSelector } from "redux-form";
import moment from "moment";
import upArrow from "../../../../assets/images/icons/filterup.svg";
import downArrow from "../../../../assets/images/icons/filterdown.svg";
import classNames from "classnames";
import DatePicker from "react-datepicker";
import {
  HOURLY,
  LAST_MONTH,
  LAST_WEEK,
  LAST_YEAR,
  THIS_WEEK,
} from "../../../constants/reports";
import * as campaignConstants from "../../../constants/campaigns";
import "react-datepicker/dist/react-datepicker.css";
import localization from "../../../localization";
import { SvgSearch } from "../../common/Icons";
import getPeriodDate from "../../../utils/getPeriodDate";
import DisplayFilterChecker from "./DisplayFilterChecker";
import filtersList from "./filtersList";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { changePaginationData } from "../../../actions/app";
import ExtraDatePicker from "../../UI/ExtraDatePicker/ExtraDatePicker";
import ExtraDatePicker2 from "../../UI/ExtraDatePicker2/ExtraDatePicker2";

const validate = ({ startDate, endDate }) => {
  const errors = {};

  if (!startDate) {
    errors.startDate = "Required";
  } else if (startDate && endDate && +startDate > +endDate) {
    errors.startDate = "Invalid date";
  }
  if (!endDate) {
    errors.endDate = "Required";
  }

  return errors;
};

class ReportsPageFiltersForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedAdvertiser: null,
      selectedPublisher: null,
      selectedCampaign: null,
      selectedPeriod: null,
      selectedCampaignStatus: null,
      selectedCountry: null,
      selectedOs: null,
      selectedPlace: null,
      selectedKpiType: null,
      selectedInventoryType: null,
      selectedProtocolType: null,
      selectedAdType: null,
      selectCampaignStatusData: [
        { value: campaignConstants.NEW, label: "New" },
        { value: campaignConstants.PAUSED, label: "Paused" },
        { value: campaignConstants.ACTIVE, label: "Active" },
      ],
      selectOsData: [
        { label: "iOS", value: campaignConstants.IOS },
        { label: "Android", value: campaignConstants.ANDROID },
      ],
      selectCampaignType: [
        { label: "cpm", value: campaignConstants.CPM },
        { label: "cpc", value: campaignConstants.CPC },
      ],
      selectKpiTypeData: [
        { label: "Soft", value: campaignConstants.SOFT },
        { label: "Hard", value: campaignConstants.HARD },
      ],
      selectPeriodData: [
        { label: "-", value: null },
        { label: "This week", value: THIS_WEEK },
        { label: "Last week", value: LAST_WEEK },
        { label: "Last month", value: LAST_MONTH },
        { label: "Last year", value: LAST_YEAR },
      ],
      selectPlaceData: [
        { label: "Bid Request", value: 1 },
        { label: "Bid Response", value: 2 },
      ],
      selectInventoryTypeData: [
        { label: "-", value: null },
        { label: "Web", value: campaignConstants.trafficType.WEB },
        { label: "In App", value: campaignConstants.trafficType.IN_APP },
      ],
      selectedBidTypeData: [
        { label: "-", value: null },
        { label: "CPM", value: "CPM" },
        { label: "CPC", value: "CPC" },
      ],
      filters: filtersList,
      showFilters: false,
    };
    this.renderDatePicker = this.renderDatePicker.bind(this);
    this.initSelectData = this.initSelectData.bind(this);
    this.setPeriodDateFormat = this.setPeriodDateFormat.bind(this);
    this.onSelectChange = this.onSelectChange.bind(this);
    this.onSelectTimeChange = this.onSelectTimeChange.bind(this);
    this.onShowFilters = this.onShowFilters.bind(this);
  }

  componentDidMount() {
    this.props.handleSubmit(this.props.onSubmit)();
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      tableType,
      users,
      campaigns,
      countries,
      formData: { selectedCampaign },
      initialValues,
    } = this.props;
    const { setPeriodDateFormat, filters } = this.state;
    // todo - needed comment
    if (tableType !== prevProps.tableType) {
      this.props.change("startDate", initialValues.startDate);
      this.props.change("endDate", initialValues.endDate);
      this.props.change("selectedAdvertiser", null);
      this.props.change("selectedCampaign", null);
      this.props.change("selectedCountry", null);
      this.props.change("selectedPublisher", null);
      this.props.actions.changePaginationData(prevProps.initialValues.limit, 0);
      // document.querySelector('.pagination-container').children[1].children[0].click();
      this.setState({
        selectedAdvertiser: null,
        selectedCampaign: null,
        selectedCountry: null,
        selectedPublisher: null,
      });
      const formData = { ...initialValues, keys: null };
      this.props.onSubmit(formData);
    }

    if (selectedCampaign !== prevProps.formData.selectedCampaign) {
      if (
        (Array.isArray(selectedCampaign) && !selectedCampaign.length) ||
        !selectedCampaign
      ) {
        this.setState({
          filters: filters.map((el) =>
            el.type[0] === tableType ? (el.disable = []) && el : el
          ),
        });
      }
    }
    if (
      prevProps.users.advertisers !== users.advertisers ||
      prevProps.users.publishers !== users.publishers ||
      prevProps.campaigns !== campaigns ||
      prevProps.countries !== countries
    ) {
      this.initSelectData();
    }
    if (prevState.selectedPeriod !== setPeriodDateFormat) {
      this.setPeriodDateFormat();
    }
  }

  initSelectData() {
    const { users, campaigns, countries } = this.props;
    const selectAdvertiserData = [
      ...(users.advertisers
        ? users.advertisers
            .filter((adv) => adv.status === 'ACTIVE' || adv.status === 'PAUSED' || adv.status === 'SUSPENDED')
            .map((advertiser) => ({
              value: advertiser.id,
              label: `(${advertiser.id}) ${
                advertiser.companyName || advertiser.name
              }`,
            }))
        : []),
    ]
    const selectPublisherData = [
      ...(users.publishers
        ? users.publishers
            .filter((pub) => pub.status === 'ACTIVE' || pub.status === 'PAUSED')
            .map((publisher) => ({
              value: publisher.id,
              label: `(${publisher.id}) ${
                publisher.companyName || publisher.name
              }`,
            }))
        : []),
    ]
    const selectCampaignData = [
      ...(campaigns.campaignsList
        ? campaigns.campaignsList
            .filter(
              (camp) => camp.status === 'ACTIVE' || camp.status === 'PAUSED' || camp.status === 'SUSPENDED'
            )
            .map((campaign) => ({
              value: campaign.id,
              label: `(${campaign.id}) ${campaign.campaignName}`,
            }))
        : []),
    ]
    const selectCountryData = [
      ...countries.countriesList.map((country) => ({
        value: country.alpha2Code,
        label: country.name,
      })),
    ];

    this.setState({
      selectAdvertiserData,
      selectCampaignData,
      selectCountryData,
      selectPublisherData,
    });
  }

  setPeriodDateFormat() {
    const { selectedPeriod } = this.state;
    const { change } = this.props;
    if (!selectedPeriod || selectedPeriod.value === null) {
      return;
    }

    const convertPeriod = getPeriodDate(selectedPeriod.value);
    change("startDate", convertPeriod.startDate);
    change("endDate", convertPeriod.endDate);
  }

  onSelectTimeChange(date, type) {
    this.props.change(type, date.format("YYYY-MM-DD"));
  }

  onShowFilters() {
    this.setState({ showFilters: !this.state.showFilters });
  }

  renderDatePicker({ input, onSelect, placeholder, meta: { touched, error } }) {
    return (
      <div
        className={classNames(
          "date-pickers-wrapper__picker input-error-wrapper",
          { "input-error-wrapper--with-border": touched && error }
        )}
      >
        <DatePicker
          selected={input.value ? moment(input.value) : null}
          onSelect={onSelect}
          value={
            input.value ? moment(input.value).utc().format("YYYY-MM-DD") : null
          }
          maxDate={moment().utc()}
          onChange={(e) => {
            this.props.touch(input.name);
            input.onChange(e);
          }}
          placeholderText={placeholder}
        />
        <div className="input-error-wrapper__error-container input-error-wrapper__error-container--static">
          <span>{touched && error}</span>
        </div>
      </div>
    );
  }

  onSelectChange(selectedValue, fieldName) {
    let value = [];
    selectedValue &&
      selectedValue.forEach((item) => {
        if (item.value === campaignConstants.ALL) {
          value = [item];
          return;
        }
        if (item.value === null) {
          value = null;
          return;
        }
        value.push(item);
      });
    // If more than one value selected filter data and remove 'ALL' value
    if (value && value.length > 1) {
      value = value.filter((item) => item.value !== campaignConstants.ALL);
    }
    this.setState({ [fieldName]: value });
    this.props.change(fieldName, value);
    if (fieldName === "selectedAdvertiser") {
      this.setState({
        selectedCampaign: null,
      });
      this.props.change("selectedCampaign", null);
    }
  }

  render() {
    const {
      tableType,
      formData: { startDate, endDate },
    } = this.props;
    return (
      <form
        className={"form_cover1 report_filters"}
        onSubmit={this.props.handleSubmit}
      >
        <div className="reports_cover">
          <div className="reports_apply">
            <button
              type="button"
              onClick={this.onShowFilters}
              className="btn white filter mr16"
            >
              <span>filters</span>
              <img
                className="filterImg"
                src={this.state.showFilters ? upArrow : downArrow}
              />
            </button>

            <div className="search_cover">
              <span className="icon" title="">
                <SvgSearch />
              </span>
              <input
                onChange={this.props.onSearchInputChange}
                type="text"
                className="outlining"
                placeholder={localization.forms.search}
                autoComplete="off"
              />
            </div>
          </div>
          <div
            className={this.state.showFilters ? "showFilters" : "hideFilters"}
          >
            <div className="toggled_filters mt28">
              {this.state.filters.map((el, idx) => (
                <DisplayFilterChecker
                  key={idx}
                  {...this.props}
                  {...this.state}
                  onSelectChange={this.onSelectChange}
                  filtersAdmin={el.filtersAdmin}
                  filtersAdvertiser={el.filtersAdvertiser}
                  filtersPublisher={el.filtersPublisher}
                  disable={el.disable}
                  type={el.type[0]}
                />
              ))}
            </div>
            <div className="reports_date mt28">
              <div className="mr16">
                {tableType === HOURLY ? (
                  <ExtraDatePicker2
                    startDate={startDate}
                    onSelectTimeChange={this.onSelectTimeChange}
                  />
                ) : (
                  <ExtraDatePicker
                    startDate={startDate}
                    endDate={endDate}
                    showRanges={true}
                    onSelectTimeChange={this.onSelectTimeChange}
                  />
                )}
              </div>
              <button type="submit" className="btn filter-blue">
                <span
                  className={classNames({ vh: this.props.isRequestPending })}
                >
                  {/* {localization.forms.applyFilters} */}
                  APPLY
                </span>
              </button>
            </div>
          </div>
        </div>
      </form>
    );
  }
}

const valueSelector = formValueSelector("ReportsPageFiltersForm");

const mapStateToProps = (state) => ({
  formData: {
    selectedCampaign: valueSelector(state, "selectedCampaign"),
    startDate: valueSelector(state, "startDate"),
    endDate: valueSelector(state, "endDate"),
  },
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(
    {
      changePaginationData,
    },
    dispatch
  ),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(
  reduxForm({
    form: "ReportsPageFiltersForm",
    validate,
  })(ReportsPageFiltersForm)
);
