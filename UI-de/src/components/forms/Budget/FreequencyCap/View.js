import React, { Fragment, useState } from "react";
import { Field } from "redux-form";
import Select from "react-select";
import {
  CAP_PER_DEVICE,
  CAP_PER_IP,
  CAP_PER_IP_USER_AGENT,
  NO_CAP_ON_IMPRESSION,
} from "../../../../constants/campaigns";

import { RadioField, TextField } from "../../../UI";

import { selectFreqCapTypeData } from "../../../../constants/common";
import { isInteger, maxLength } from "../../../../utils/validatorUtils";
import localization from "../../../../localization";

export default function FrequencyCapView(props) {
  const { frequencyCapInterval, frequencyCapping, type, change, mType } = props;

  const [types, setType] = useState(null);
  const {
    campaignTracking: { fields },
  } = localization.createCampaignForm;
  const fqCap = type === 1 ? "frequencyCapping" : "fqCapClick";
  const fqCapInterval =
    type === 1 ? "frequencyCapInterval" : "fqCapClickInterval";
  const fqCapValue = type === 1 ? "frequencyCapValue" : "fqCapClickValue";
  const header = type === 1 ? "Impressions" : "Clicks";
  const noCapTitle = type === 1 ? "Impression" : "Click";
  return (
    <Fragment>
      <div className="form-group">
        <p className="form__text-field__name">{`Frequency capping per ${header}`}</p>
        <div className="wrapper">
          <Field
            name={fqCap}
            component={RadioField}
            id="noCap"
            title={`No cap on ${noCapTitle}`}
            val={NO_CAP_ON_IMPRESSION}
            checked={frequencyCapping === NO_CAP_ON_IMPRESSION}
          />
          <Field
            name={fqCap}
            component={RadioField}
            id="capIp"
            title={fields.capIp}
            val={CAP_PER_IP}
            checked={frequencyCapping === CAP_PER_IP}
          />
          <Field
            name={fqCap}
            component={RadioField}
            id="capPerIp"
            title="Cap per IP + User agent"
            val={CAP_PER_IP_USER_AGENT}
            checked={frequencyCapping === CAP_PER_IP_USER_AGENT}
          />
          {mType && (
            <Field
              name={fqCap}
              component={RadioField}
              id="capDevice"
              title={fields.capDevice}
              val={CAP_PER_DEVICE}
              checked={frequencyCapping === CAP_PER_DEVICE}
            />
          )}
        </div>
        {[CAP_PER_IP, CAP_PER_IP_USER_AGENT, CAP_PER_DEVICE].includes(
          frequencyCapping
        ) && (
          <div className="mt2 w50">
            {/* <div className="form__text-field__name">{fields.impressionPer}</div> */}
            <div
              className="form__text-field__name"
              style={{ marginBottom: "0", marginTop: "1rem" }}
            >
              {fields.capDuration}
            </div>
            <div className="form-group_row align-end">
              <Select
                className="input-md"
                placeholder="Frequency"
                options={selectFreqCapTypeData}
                value={{
                  value: frequencyCapInterval,
                  label: frequencyCapInterval,
                }}
                onChange={(e) => {
                  change(fqCapInterval, e.value), setType(e.value);
                }}
                styles={{
                  option: (
                    provided,
                    { isFocused, isSelected, isDisabled }
                  ) => ({
                    ...provided,
                    backgroundColor: isDisabled
                      ? null
                      : isSelected
                      ? "#fdd0d5"
                      : isFocused
                      ? "#fee8eb"
                      : null,
                    color: isSelected ? "black" : "black",
                  }),
                }}
                theme={(theme) => ({
                  ...theme,
                  colors: {
                    ...theme.colors,
                    primary: "#000000",
                  },
                })}
              />
              <Field
                name={fqCapValue}
                component={TextField}
                validate={[maxLength(7), isInteger]}
                placeholder={
                  types ? `Number of ${types.toLowerCase()}s` : "Duration"
                }
              />
            </div>
          </div>
        )}
      </div>
    </Fragment>
  );
}
