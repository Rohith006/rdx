import React, { Fragment } from "react";
import Select from "react-select";
import { Field } from "redux-form";

import localization from "../../../../localization";
import makeAnimated from "react-select/animated/dist/react-select.esm";
import { PUSH, POP } from "../../../../constants/campaigns";
import { normalizeBoolean } from "../../../../utils/normalizers";
// import { RadioField } from "../../../UI";
import { styles } from "../../../UI/selectStyles";

export default function Location(props) {
  const { formData } = props;
  const { targeting } = localization;
  const animatedComponents = makeAnimated();
  const renderRadioField = ({input, id, val, title, checked, disabled}) => {
    return (
      <div className={`radio-control pill-control${disabled ? 'disabled' : ''}`}>
        <input
          {...input}
          type="radio"
          onChange={input.onChange}
          disabled={disabled}
          id={id}
          value={val}
          checked={checked === undefined ? input.value === val : checked}
        />
        <label htmlFor={id}>
          <span className="radio-control__indicator"/>
          {title}
        </label>
      </div>
    );
  };
  return (
    <Fragment>
      <div className="form-group1">
        <div className="form__text-field__name">
          {localization.createCampaignForm.targeting.labels.geography}
          <div className="tooltip info">
            <span className="tooltiptext">
              World wide when nothing selected
            </span>
          </div>
        </div>
        <div className="form-group_row">
        <Field
          name="isIncludeGeo"
          component={renderRadioField}
          title={targeting.include}
          val={true}
          checked={formData.isIncludeGeo}
          normalize={normalizeBoolean}
        />
        <Field
          name="isIncludeGeo"
          component={renderRadioField}
          title={targeting.exclude}
          val={false}
          checked={!formData.isIncludeGeo}
          normalize={normalizeBoolean}
        />
        </div>
      </div>
      {formData.isIncludeGeo ? (
        <div className="form-group">
          <div className="form__text-field__name" />
          <div className="form__text-field__name" style={{ marginTop: "20px" }}>
            {localization.createCampaignForm.targeting.labels.country}
          </div>
          <div className="w100">
            <Select
              className="country-select basic-multi-select"
              options={props.selectCountriesData}
              value={props.selectedCountries}
              onChange={props.onSelectCountryChange}
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
      ) : (
        <div className="form-group">
          <div className="form__text-field__name" />
          <div className="form__text-field__name" style={{ marginTop: "20px" }}>
            {localization.createCampaignForm.targeting.labels.country}
          </div>
          <div className="w100">
            <Select
              className="country-select basic-multi-select "
              options={props.selectCountriesData}
              value={props.selectedCountriesExclude}
              onChange={props.onSelectCountryChange}
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
      )}
      {props.monetizationType &&
        ![PUSH, POP].includes(props.monetizationType.toUpperCase()) &&
        formData.isIncludeGeo && (
          <div className="form-group">
            {/* City */}
            <div className="form-group_col">
              <div className="form__text-field__name">
                {localization.createCampaignForm.targeting.labels.city}
              </div>
              <div className="w100">
                <Select
                  className="country-select"
                  onInputChange={props.changeCity}
                  options={props.selectCitiesData}
                  value={props.selectedCities}
                  onChange={props.onSelectCityChange}
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
          </div>
        )}
    </Fragment>
  );
}
