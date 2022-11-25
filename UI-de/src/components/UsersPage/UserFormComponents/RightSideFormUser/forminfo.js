import React, { Fragment } from "react";
import localization from "../../../../localization";
import { Field } from "redux-form";
import Select from "react-select";
import { styles } from "../../../UI/selectStyles";

const FormInfo = (props) => {
  const {
    selectCountryData,
    selectedCompanyCountry,
    onSelectCompanyCountryChange,
    renderField,
  } = props;
  return (
    <Fragment>
      <Field
        name="email"
        component={renderField}
        type="email"
        label={localization.forms.email}
      />
      <Field
        type="password"
        name="confirmPassword"
        component={renderField}
        label={localization.forms.confirmPassword}
      />
      <div className="form__text-field">
        <div className="form__text-field__wrapper">
          <div className="form__text-field__name-wrapper userSelectTitle">
            <span>{localization.billingDetails.form.companyCountry}</span>
          </div>
          <div className="form__text-field__input-wrapper">
            <Select
              options={selectCountryData}
              value={selectedCompanyCountry}
              onChange={onSelectCompanyCountryChange}
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
    </Fragment>
  );
};

export default FormInfo;
