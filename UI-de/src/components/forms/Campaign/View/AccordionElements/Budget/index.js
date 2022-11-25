import React, { Fragment } from "react";
import { Field } from "redux-form";
import classNames from "classnames";
import {
  AccordionItem,
  AccordionItemButton,
  AccordionItemHeading,
  AccordionItemPanel,
} from "react-accessible-accordion";

import {
  CONSISTENT_BIDDING,
  CPC,
  CPM,
  EAGER_BIDDING,
  POP,
  PUSH,
} from "../../../../../../constants/campaigns";
import { TextField } from "../../../../../UI";
import { required, isNumber } from "../../../../../../utils/validatorUtils";
import localization from "../../../../../../localization";
import { onNumberFieldChange, toNumber } from "../../../../../../utils/common";
import FrequencyCap from "../../../../Budget/FreequencyCap";

export default (props) => {
  const {
    formData: { monetizationType, isBiddingOptimization },
    formData,
  } = props;
  const {
    campaignTracking: { fields, labels },
  } = localization.createCampaignForm;
  const classNameBudgetOptions = classNames({
    "": true,
    disabled: !props.budgetAdvancedOptions,
  });
  const classBiddingOptimization = classNames({
    "form-group": true,
    disabled: !isBiddingOptimization,
  });
  return (
    <AccordionItem uuid={"2"}>
      {/* <AccordionItemHeading>
        <AccordionItemButton>
          <div className="card_header bordered">
            <h3 className="subheading">
              {localization.createCampaignForm.budgetSchedule.titleBudget}
            </h3>
            <span className="icon" />
          </div>
        </AccordionItemButton>
      </AccordionItemHeading> */}
      <AccordionItemPanel>
        <div className="card_body" style={{ marginBottom: "4rem" }}>
          <div className="card_body-item">
            {monetizationType &&
              ![PUSH, POP].includes(monetizationType.toUpperCase()) && (
                <Fragment>
                  <div className="form-group">
                    <div className="form__text-field__name">
                      {
                        localization.createCampaignForm.budgetSchedule.labels
                          .bidType
                      }
                      <div className="tooltip info">
                        <span className="tooltiptext">
                          This option filters available Inventories according to
                          the supported Bid Type
                        </span>
                      </div>
                    </div>
                    <div className="form-group_col-2">
                      {[CPM, CPC].map((item, index) => (
                        <Field
                          component={props.renderRadioField}
                          name="modelPayment"
                          title={item}
                          key={index}
                          val={item}
                          onChange={(event, newValue, prevValue) =>
                            props.onOpenConfirmationDialog(
                              event,
                              item,
                              prevValue
                            )
                          }
                          checked={formData.modelPayment === item}
                        />
                      ))}
                    </div>
                  </div>
                </Fragment>
              )}
            <div className="form-group ">
              <Field
                name="budget.bid"
                type="text"
                className="input-budget"
                validate={[required]}
                title={
                  localization.createCampaignForm.budgetSchedule.labels.bid
                }
                component={props.renderRegularTextField}
                onNumberFieldChange={props.onNumberFieldChange}
                normalize={toNumber}
              />
            </div>
            <div className="form-group">
              <Field
                name="budget.totalBudget"
                type="text"
                className="input-budget"
                title={
                  <span>
                    {
                      localization.createCampaignForm.budgetSchedule.labels
                        .totalBudget
                    }
                    <span className="budget_subtitles">
                      {" "}
                      (Must be lesser than balance)
                    </span>
                  </span>
                }
                component={props.renderRegularTextField}
                onNumberFieldChange={props.onNumberFieldChange}
                normalize={toNumber}
              />
              {/* <span className="pt2">( Must be lesser than balance )</span> */}
            </div>
            <div className="form-group">
              <Field
                name="budget.dailyBudget"
                type="text"
                className="input-budget"
                title={
                  <span>
                    {
                      localization.createCampaignForm.budgetSchedule.labels
                        .dailyBudget
                    }
                    <span className="budget_subtitles">
                      {" "}
                      (Must be lesser than balance)
                    </span>
                  </span>
                }
                component={props.renderRegularTextField}
                onNumberFieldChange={props.onNumberFieldChange}
                normalize={toNumber}
              />
              {/* <span className="pt3">( Must be lesser than balance )</span> */}
            </div>
            <div className="form-group">
              <Field
                name="budget.hourlyBudget"
                title={
                  <span>
                    {labels.hourlyBudget}
                    <span className="budget_subtitles">
                      {" "}
                      (Must be lesser than balance)
                    </span>
                  </span>
                }
                className="input-budget"
                component={props.renderRegularTextField}
                onNumberFieldChange={props.onNumberFieldChange}
                normalize={toNumber}
              />
              {/* <span className="pt4">( Must be lesser than balance )</span> */}
            </div>
          </div>
          <div className="card_body-item">
            {/* campaign life*/}
            <div className="form-group">
              <div className="form-group_row">
                <Field
                  name="startDate"
                  title={fields.start}
                  component={props.renderDatePicker}
                  placeholder="YYYY-MM-DD"
                />
                <Field
                  name="endDate"
                  title="Until"
                  component={props.renderDatePicker}
                  placeholder="YYYY-MM-DD"
                />
              </div>
            </div>
            {/* ctr */}
            {/* frequency cap */}
            <FrequencyCap {...props} />
            {monetizationType &&
              ![PUSH, POP].includes(monetizationType.toUpperCase()) && (
                <Fragment>
                  <div className={classNameBudgetOptions}>
                    <div className="form-group">
                      <div className="form__text-field__name">
                        {labels.deliveryType}
                        <div className="tooltip info">
                          <span
                            className="tooltiptext"
                            style={{ top: "-180%" }}
                          >
                            {fields.deliveryTooltip}
                          </span>
                        </div>
                      </div>
                      <div className="form-group_row">
                        <Field
                          name="deliveryType"
                          component={props.renderRadioField}
                          id="eager"
                          title={fields.eager}
                          val={EAGER_BIDDING}
                          checked={formData.deliveryType === EAGER_BIDDING}
                        />
                        <Field
                          name="deliveryType"
                          component={props.renderRadioField}
                          id="consistent"
                          title={fields.consistent}
                          val={CONSISTENT_BIDDING}
                          checked={formData.deliveryType === CONSISTENT_BIDDING}
                          defaultChecked={true}
                        />
                      </div>
                    </div>
                  </div>
                </Fragment>
              )}
          </div>
        </div>
      </AccordionItemPanel>
    </AccordionItem>
  );
};

