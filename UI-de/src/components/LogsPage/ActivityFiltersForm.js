import React, { Component } from "react";
import { reduxForm } from "redux-form";

import Select from "react-select";
import classNames from "classnames";
import moment from "moment";
import DatePicker from "react-datepicker";

import localization from "../../localization";
import PropTypes from "prop-types";
import { SvgSearch } from "../common/Icons";
import ExtraDatePicker from "../UI/ExtraDatePicker/ExtraDatePicker";
import { styles } from "../UI/selectStyles";

const validate = ({ startDate, endDate }) => {
  const errors = {};

  if (!startDate) {
    errors.startDate = localization.validate.required;
  }

  if (!endDate) {
    errors.endDate = localization.validate.required;
  }
};

class ActivityFiltersForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      startDate: moment().startOf("month").format("YYYY-MM-DD"),
      endDate: moment().format("YYYY-MM-DD"),
      selectPeriodData: [
        { label: "-", value: null },
        { label: "This week", value: "This week" },
        { label: "Last week", value: "Last week" },
        { label: "Last month", value: "Last month" },
        { label: "Last year", value: "Last year" },
      ],
      selectedUser: null
    };

    this.renderFilterDatePicker = this.renderFilterDatePicker.bind(this);
    this.onSelectTimeChange = this.onSelectTimeChange.bind(this);
  }

  onSelectChange(selectedValue, fieldName) {
    const value = { id: selectedValue.value, name: selectedValue.label };
    this.setState({
      selectedUser: selectedValue.value?selectedValue:null
    })
    this.props.change(fieldName, value);
  }

  onEventTypeSelect(selectedValue) {
    let stateValue = [];
    if (selectedValue != null) {
      stateValue = selectedValue.map((item) => item.value) || [];
    }
    this.props.change("eventType", stateValue);
  }

  onSelectTimeChange(date, type) {
    this.setState((prevState) => ({
      rowSelected: false,
      ...prevState,
      [type]: date.format("YYYY-MM-DD"),
    }));
  }

  render() {
    const { types, users, isRequestPending } = this.props;

    return (
      <div className="card-bd logs">
        {/* <div className="card_body"> */}
        <form onSubmit={this.props.handleSubmit} className="form_cover">
          <div className="alignSearch">
            <div className="boxstyle search_cover">
              <span className="icon" title="">
                <SvgSearch />
              </span>
              <input
                onChange={this.onSearchInputChange}
                type="text"
                className=""
                placeholder={localization.forms.search}
                autoComplete="off"
              />
            </div>
            <div className="form-control boxstyle">
              <Select
                className="filter-form__select"
                placeholder={localization.logs.filters.user}
                options={users}
                onChange={(val) => this.onSelectChange(val, "user")}
                value={this.state.selectedUser}
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

            <div className="form-control search__input boxstyle">
              <Select
                className="filter-form__select type"
                placeholder={localization.logs.filters.type}
                options={types}
                onChange={(val) => this.onEventTypeSelect(val)}
                isMulti={true}
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

              <ExtraDatePicker
                startDate={this.state.startDate}
                endDate={this.state.endDate}
                showRanges={true}
                onSelectTimeChange={this.onSelectTimeChange}
              />
            {/* <div className="form-control ">*/}
            {/* <Select className="filter-form__select" placeholder={localization.logs.filters.campaign}*/}
            {/* options={campaigns} onChange={val => this.onSelectChange(val, 'campaign')}/>*/}
            {/* </div>*/}
            <button
              type="submit"
              className="btn sign-blue"
              style={{ width: "78px", height: "40px" }}
            >
              <span className={classNames({ vh: isRequestPending })}>
                {localization.forms.applyFilters}
              </span>
            </button>
          </div>
        </form>
        {/* </div> */}
      </div>
    );
  }

  renderFilterDatePicker({
    input,
    onSelect,
    placeholder,
    meta: { touched, error },
  }) {
    return (
      <div
        className={classNames("date-pickers-wrapper__picker", {
          "input-error-wrapper--with-border": touched && error,
        })}
      >
        <DatePicker
          selected={input.value ? moment(input.value) : null}
          value={input.value ? moment(input.value).format("YYYY-MM-DD") : null}
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
}

ActivityFiltersForm.propTypes = {
  campaigns: PropTypes.array,
  types: PropTypes.array,
};

export default reduxForm({
  form: "ActivityFiltersForm",
  validate,
})(ActivityFiltersForm);
