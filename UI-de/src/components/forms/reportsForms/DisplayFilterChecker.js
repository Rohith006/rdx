import React, { Fragment } from "react";
import Select from "react-select";
import {
  ADMIN,
  ACCOUNT_MANAGER,
  ADVERTISER,
  PUBLISHER,
  CAMPAIGN,
} from "../../../constants/app";
import { RTB, selectAdType } from "../../../constants/common";
import {
  PLACE,
  AD_TYPE,
  INVENTORY_TYPE,
  PROTOCOL_TYPE,
  BID_TYPE,
} from "../../../constants/reports";
import DisplayCheck from "../../../permissions";
import { styles } from "../../UI/selectStyles";

const DisplayFilterChecker = (props) => {
  const {
    filtersAdmin,
    filtersAdvertiser,
    filtersPublisher,
    type,
    tableType,
    switcherStatus,
    disable = [],
  } = props;
  const statics = {
    ADVERTISER: (
      <DisplayCheck
        roles={[ADMIN, ACCOUNT_MANAGER, ADVERTISER, PUBLISHER]}
        label={["ADVERTISERS"]}
      >
        <div
          className={`form-control ${
            disable.includes(ADVERTISER) && "disabled"
          }`}
        >
          <Select
            isMulti
            className="filter-form__select"
            placeholder="Advertiser"
            value={props.selectedAdvertiser}
            options={props.selectAdvertiserData}
            onChange={(val) => props.onSelectChange(val, "selectedAdvertiser")}
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
      </DisplayCheck>
    ),
    PUBLISHER: (
      <DisplayCheck
        roles={[ADMIN, ACCOUNT_MANAGER, ADVERTISER, PUBLISHER]}
        label={["PUBLISHERS"]}
      >
        <div
          className={`form-control ${
            disable.includes(PUBLISHER) && "disabled"
          }`}
        >
          <Select
            isMulti
            className="filter-form__select"
            placeholder="Publisher"
            value={props.selectedPublisher}
            options={props.selectPublisherData}
            onChange={(val) => props.onSelectChange(val, "selectedPublisher")}
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
      </DisplayCheck>
    ),
    PLACE: (
      <div className={`form-control ${disable.includes(PLACE) && "disabled"}`}>
        <Select
          isMulti
          className="filter-form__select"
          placeholder="Place"
          value={props.selectedPlace}
          options={props.selectPlaceData}
          onChange={(val) => props.onSelectChange(val, "selectedPlace")}
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
    ),
    CAMPAIGN: (
      <DisplayCheck
        roles={[ADMIN, ACCOUNT_MANAGER, ADVERTISER]}
        label={["ADVERTISERS"]}
      >
        <div
          className={`form-control ${disable.includes(CAMPAIGN) && "disabled"}`}
        >
          <Select
            isMulti
            className="filter-form__select"
            placeholder="Campaign"
            value={props.selectedCampaign}
            options={props.selectCampaignData}
            onChange={(val) => props.onSelectChange(val, "selectedCampaign")}
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
      </DisplayCheck>
    ),
    AD_TYPE: (
      <div
        className={`form-control ${disable.includes(AD_TYPE) && "disabled"}`}
      >
        <Select
          isMulti
          className="filter-form__select"
          placeholder="Ad Type"
          value={props.selectedAdType}
          options={selectAdType}
          onChange={(val) => props.onSelectChange(val, "selectedAdType")}
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
    ),
    INVENTORY_TYPE: (
      <div
        className={`form-control ${
          disable.includes(INVENTORY_TYPE) && "disabled"
        }`}
      >
        <Select
          isMulti
          className="filter-form__select"
          placeholder="Inventory"
          value={props.selectedInventoryType}
          options={props.selectInventoryTypeData}
          onChange={(val) => props.onSelectChange(val, "selectedInventoryType")}
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
    ),
    BID_TYPE: (
      <div
        className={`form-control ${disable.includes(BID_TYPE) && "disabled"}`}
      >
        <Select
          isMulti
          className="filter-form__select"
          placeholder="Payment"
          value={props.selectedBidType}
          options={props.selectedBidTypeData}
          onChange={(val) => props.onSelectChange(val, "selectedBidType")}
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
    ),
  };

  function result() {
    const { role, isInventoriesAllowed } = props.auth.currentUser;
    const data = [];
    let filters;
    if (type !== tableType) return;

    switch (role) {
      case ADMIN:
      case ACCOUNT_MANAGER:
        filters = filtersAdmin || [];
        break;
      case ADVERTISER:
        filters = filtersAdvertiser || [];
        break;
      case PUBLISHER:
        filters = filtersPublisher || [];
        break;
    }

    filters.forEach((el) => {
      if (!isInventoriesAllowed && role === ADVERTISER && el === PUBLISHER)
        return;
      _.forOwn(statics, (value, key) => {
        if (key === el) {
          data.push(value);
        }
      });
    });
    return data;
  }

  return <Fragment>{result()}</Fragment>;
};

export default DisplayFilterChecker;
