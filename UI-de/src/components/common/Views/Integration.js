import React, { Fragment } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { NotificationManager } from "react-notifications";
import classNames from "classnames";
import CustomSelect from "./Select";
import localization from "../../../localization";
import { ADMIN, OWNER, ACCOUNT_MANAGER } from "../../../constants/user";
import {
  AD_TYPES,
  FIRST_PRICE,
  IN_APP,
  ORTB,
  SECOND_PRICE,
  WEB,
} from "../../../constants/common";
import PopupRtb from "../PopupRtb";
import { Field } from "redux-form";
import { ALL, CPC, CPM } from "../../../constants/campaigns";
import RadioField from "../../UI/RadioField";
import { normalizeBoolean, normalizeNumber } from "../../../utils/normalizers";
import { setCaretInput } from "../../../utils/common";
import AppendMacros2 from "./AppendMacros2";
import {CapitalToLower} from "../../../utils/upperToLower"

const showNotification = () =>
  NotificationManager.success(localization.integration.copied);
const Integration = (props) => {
  const renderRadioField = ({ input, id, val, title, checked, disabled }) => {
    return (
      <div
        className={`radio-control pill-control${disabled ? "disabled" : ""}`}
      >
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
          <span className="radio-control__indicator" />
          {title}
        </label>
      </div>
    );
  };
  const formIsCreate = props.action === "create";
  // TODO move inline-style to scss file
  return (
    <div>
      {/* <div className="card_header bordered">
        <h2 className="heading">{localization.header.nav.integration}</h2>
      </div> */}
      <div className="card_body integration_cover">
        {/* API Keys */}
        <div
          className={classNames("integration_cover-item", {
            disabled: formIsCreate,
          })}
        >
          <h3 className="subheading">{localization.integration.keys}</h3>
          <p>{localization.integration.keysDesc}</p>
          <div className="text-input">
            <input
              value={(props.user && props.user.apiKey) || ""}
              type="text"
              autoComplete="off"
            />
          </div>
          {props.user ? (
            <Fragment>
              <CopyToClipboard
                onCopy={() => showNotification()}
                text={props.user.apiKey}
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
                onClick={async () => {
                  const result = await props.generatePublisherKey(
                    props.user.id
                  );
                  props.change("apiKey", result.apiKey);
                }}
              >
                <span>{localization.integration.regenerate}</span>
              </button>
            </Fragment>
          ) : (
            <button
              type="button"
              className="btn light-blue"
              onClick={props.generatePublisherKey}
            >
              <span>{localization.integration.generateKey}</span>
            </button>
          )}
        </div>
        {/* STATISTIC URL */}
        <div
          className={classNames("integration_cover-item", {
            disabled: formIsCreate,
          })}
        >
          <h3 className="subheading">{localization.integration.reportUrl}</h3>
          <p>{localization.integration.statsUrlDesc}</p>
          <div className="text-input">
            <input value={props.reportUrl} type="text" />
          </div>
          <span
            style={{
              display: "flex",
              width: "100%",
              justifyContent: "space-between",
            }}
          >
            <CopyToClipboard
              onCopy={() => showNotification()}
              text={props.reportUrl}
            >
              <button type="button" className="btn light-blue">
                <span className="">{localization.integration.clipboard}</span>
              </button>
            </CopyToClipboard>
          </span>
        </div>

        {/* SSP STATISTIC URL */}
        {[ADMIN, OWNER, ACCOUNT_MANAGER].includes(props.currentUser.role) && (
          <Fragment>
            <div
              className={classNames("integration_cover-item", {
                disabled: formIsCreate,
              })}
            >
              <p>{localization.integration.statsUrlDescFrom}</p>
              <div className="text-input">
                <Field
                  type="text"
                  name="sspStatisticUrl"
                  component="input"
                  onClick={(e) =>
                    setCaretInput(
                      e.nativeEvent,
                      props.handleChangeCaretForInsertMacros
                    )
                  }
                  onChange={(e) =>
                    setCaretInput(
                      e.nativeEvent,
                      props.handleChangeCaretForInsertMacros
                    )
                  }
                />
              </div>
              <AppendMacros2
                fieldName="sspStatisticUrl"
                appendMacros={props.appendMacros}
              />
            </div>
          </Fragment>
        )}

        {[ADMIN, OWNER, ACCOUNT_MANAGER].includes(props.currentUser.role) &&
          props.formData.isEnableRTB && (
            <Fragment>
              <div className={classNames({ hidden: formIsCreate })}>
                <div className="form-group">
                  <h3 className="form__text-field__name">
                    {localization.integration.openRTBVersions}
                  </h3>
                  <div className="form-group_row">
                    <div
                      className="form__text-field w25"
                      style={{ marginBottom: 0 }}
                    >
                      <CustomSelect
                        label={""}
                        options={props.rtbProtocolVersions}
                        value={props.rtbProtocolVersion}
                        onChange={(version) =>
                          props.elementChangeHandler(
                            "rtbProtocolVersion",
                            version
                          )
                        }
                      />
                    </div>
                    <div className="form__text-field w25 s-example">
                      <div className="form__text-field__wrapper">
                        <a className="ex-button" onClick={props.showRtbExample}>
                          SHOW EXAMPLE
                        </a>
                      </div>
                    </div>
                  </div>
                  <PopupRtb
                    isOpenModal={props.isOpenModal}
                    onCloseModal={props.showRtbExample}
                    rtbVersion={props.rtbProtocolVersion.value}
                  />
                </div>

                {/* Response timeout */}
                {
                  <div className="integration_cover-item">
                    <h3 className="form__text-field__name">
                      {localization.integration.tMax}
                    </h3>
                    <div className="form-group_field checkbox-control">
                      <div className="form-group_row">
                        <Field
                          name="timeoutSelection"
                          component={renderRadioField}
                          val={"auto"}
                          title={"Auto"}
                          checked={props.formData.timeoutSelection === "auto"}
                        />
                        <Field
                          name="timeoutSelection"
                          component={renderRadioField}
                          val={"manual"}
                          title={"Manual"}
                          checked={props.formData.timeoutSelection !== "auto"}
                        />
                      </div>
                    </div>
                    {props.formData.timeoutSelection !== "auto" && (
                      <Field
                        component={props.renderRegularText}
                        name="tmax"
                        className="w25"
                        normalize={normalizeNumber}
                      />
                    )}
                  </div>
                }

                {/* Ad Types  block */}
                <div className="integration_cover-item">
                  <h3 className="form__text-field__name">
                    {localization.integration.adType}
                  </h3>
                  <div>
                    {/* <input
                      type="checkbox"
                      name="All"
                      onChange={(e) => props.selectAdTypes(e)}
                    />{' '}
                    All <br /> */}
                    {AD_TYPES[props.formData.protocolType].map(
                      (item, index) => {
                        return (
                          <div
                            className={classNames("checkbox-control", {
                              disabled: !item.active,
                            })}
                            key={index}
                          >
                            <input
                              type="checkbox"
                              value={item.value}
                              autoComplete="off"
                              checked={
                                props.formData.adType &&
                                props.formData.adType.includes(item.value)
                              }
                              onChange={(e) => props.selectAdTypes(e)}
                            />
                            <label>
                              <div className="checkbox-control__indicator" />
                              <span>
                                {item.name}
                                <br />
                              </span>
                            </label>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
                {/* FALLBACK URL */}
                {props.formData.protocolType === ORTB && (
                  <Fragment>
                    {/* TRAFFIC TYPE */}
                    <div className="integration_cover-item">
                      <h3 className="form__text-field__name">
                        {localization.integration.trafficType}
                      </h3>
                      <div className="form-group_row">
                        {[ALL, WEB, IN_APP].map((item) => {
                          return (
                            <div className={`radio-control pill-control`}>
                              <input
                                type="radio"
                                onClick={(e) =>
                                  props.elementChangeHandler(
                                    "trafficType",
                                    e.target.value
                                  )
                                }
                                value={item}
                                checked={props.formData.trafficType === item}
                              />
                              <label>
                                <span className="radio-control__indicator" />
                                {CapitalToLower(item)}
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Make payments with */}
                    <div className="integration_cover-item">
                      <h3 className="form__text-field__name">
                        {localization.integration.makePaymentsWith}
                      </h3>
                      <div className="form-group_field checkbox-control">
                        <div
                          className={classNames("form-group_row", {
                            disabled: formIsCreate,
                          })}
                        >
                          {["ADM", "NURL", "BURL"].map((item, index) => {
                            return (
                              <Field
                                name="paymentsWith"
                                key={index}
                                component={renderRadioField}
                                title={item}
                                val={item.toLowerCase()}
                                checked={
                                  props.formData.paymentsWith ===
                                  item.toLowerCase()
                                }
                              />
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </Fragment>
                )}

                {/* Select Bid Types */}
                <div className={`integration_cover-item`}>
                  <h3 className="form__text-field__name">
                    {
                      localization.createCampaignForm.budgetSchedule.labels
                        .bidType
                    }
                  </h3>
                  <Fragment>
                    <div className="form-group_row">
                      {[CPM, CPC].map((item, index) => {
                        return (
                          <div
                            className="radio-control pill-control"
                            key={index}
                          >
                            <input
                              type="radio"
                              onClick={(e) =>
                                props.elementChangeHandler("bidType", item)
                              }
                              value={item}
                              checked={props.formData.bidType === item}
                            />
                            <label>
                              <span className="radio-control__indicator" />
                              {item}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </Fragment>
                </div>
                <Fragment>
                  {/* Select auction type */}
                  <div className="integration_cover-item">
                    <h3 className="form__text-field__name">
                      {localization.integration.auctionType}
                    </h3>
                    <div className="form-group_row">
                      {[FIRST_PRICE, SECOND_PRICE].map((item, index) => {
                        return (
                          <div
                            className="radio-control pill-control"
                            key={index}
                          >
                            <input
                              type="radio"
                              onClick={(e) =>
                                props.elementChangeHandler("auctionType", item)
                              }
                              value={item}
                              checked={props.formData.auctionType === item}
                            />
                            <label>
                              <span className="radio-control__indicator" />
                              {CapitalToLower(item)}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {/* BIDFLOOR */}
                  <div className="integration_cover-item">
                    <h3 className="form__text-field__name">Default bidfloor</h3>
                    <div className="input-md">
                      <Field
                        component={Input}
                        name="defaultBidfloor"
                        onNumberFieldChange={props.onNumberFieldChange}
                      />
                    </div>
                  </div>
                </Fragment>
                <div className="integration_cover-item">
                  <h3 className="form__text-field__name">
                    {localization.integration.autoConnectDemand}
                  </h3>
                  <div className="form-group_field checkbox-control">
                    <div className="form-group_row">
                      <Field
                        component={renderRadioField}
                        name="isAutoConnectDemands"
                        val={false}
                        title="Disable"
                        checked={!props.formData.isAutoConnectDemands}
                        normalize={normalizeBoolean}
                      />
                      <Field
                        component={renderRadioField}
                        name="isAutoConnectDemands"
                        val={true}
                        title="Enable"
                        checked={props.formData.isAutoConnectDemands}
                        normalize={normalizeBoolean}
                      />
                    </div>
                  </div>
                </div>

                <div className="integration_cover-item">
                  <h3 className="form__text-field__name">
                    {localization.integration.dataCenterLocation}
                  </h3>
                  <div className="input-md">
                    <CustomSelect
                      label={""}
                      options={props.location}
                      value={{ label: props.formData.location }}
                      onChange={props.changeLocation}
                    />
                  </div>
                </div>

                {/* BIDDER ENDPOINT */}
                <div className="integration_cover-item">
                  <h3 className="form__text-field__name">
                    {localization.integration.bidderUrl}
                  </h3>
                  <div className="text-input flex">
                    <input
                      value={props.bidderUrl}
                      onChange={props.editApiUrl}
                      type="text"
                      autoComplete="off"
                    />
                  </div>
                  <span
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <CopyToClipboard
                      onCopy={() => showNotification()}
                      text={props.bidderUrl}
                    >
                      <button type="button" className="btn light-blue">
                        <span className="">
                          {localization.integration.clipboard}
                        </span>
                      </button>
                    </CopyToClipboard>
                  </span>
                </div>
              </div>
            </Fragment>
          )}
      </div>
    </div>
  );
};

const Input = ({ input, onNumberFieldChange }) => (
  <input
    {...input}
    onChange={(e) => onNumberFieldChange(e, input.onChange)}
    type="text"
  />
);

export default Integration;
