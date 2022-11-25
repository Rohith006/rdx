import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { SubmissionError } from "redux-form";
import moment from "moment";
import _ from "lodash";

import CreateCpmCampaignForm from "../forms/Campaign/CreateForm";
import {
  SOFT,
  ONE_HOUR,
  TWELVE_HOURS,
  ONE_DAY,
  SEVEN_DAYS,
  THIRTY_DAYS,
  NEW,
  PAUSED,
  NO_CAP_ON_IMPRESSION,
  DISABLE,
  CARRIER_AND_WIFI,
  FEMALE_AND_MALE,
  SELECT_INVENTORY_SOURCE,
  CPM,
  ALL_AGE_GROUP,
  ALL,
  CONSISTENT_BIDDING,
  INCLUDE,
  PRIVATE,
  PUBLIC,
  NATIVEADD_ALIAS,
  NATIVEADD,
  VIDEOADD,
  trafficType,
  AUDIOADD,
  OR
} from "../../constants/campaigns";
import { UNLIMITED } from "../../constants/budgets";
import { loadLanguages } from "../../actions/countries";
import {
  createCampaign,
  getCampaignById,
  loadBudgets,
  loadCampaignAudiences,
  updateCampaign,
} from "../../actions/campaigns&budgets";
import { loadAdvertisers } from "../../actions/users";
import { loadCategories } from "../../actions/campaigns&budgets";
import "react-notifications/lib/notifications.css";
import { ADVERTISER } from "../../constants/user";
import localization from "../../localization";
import Duplicate from "../UI/Duplicate";
import BackTo from "../UI/BackTo";

const enumDate = [
  ONE_HOUR,
  TWELVE_HOURS,
  ONE_DAY,
  SEVEN_DAYS,
  THIRTY_DAYS,
  UNLIMITED,
];

class CreateCpmCampaignPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      campaign: "",
      creatives: [],
      budget: "",
      submitInProgress: false,
      dataPartner: [],
      pagination: null,
    };

    this.onFormSubmit = this.onFormSubmit.bind(this);
    this.onAddCreative = this.onAddCreative.bind(this);
    this.onDuplicateCampaign = this.onDuplicateCampaign.bind(this);
    this.setInitialValuesForForm = this.setInitialValuesForForm.bind(this);
  }

  componentDidMount() {
    const { dataPartner, pagination } = this.state
    const thirdPartyDataOptions = { dataPartner, pagination }
    const { campaignId } = this.props.match.params;
    this.props.actions.loadCategories();
    this.props.actions.loadLanguages();
    this.props.actions.getCampaignById(campaignId);
    this.props.actions.loadCampaignAudiences(campaignId);
    this.props.actions.loadAdvertisers();
    this.props.actions.loadBudgets();
  }

  componentDidUpdate(prevProps, prevState) {
    const campaignId = +this.props.match.params.campaignId;
    const { campaign } = this.props;

    if (campaign !== prevProps.campaign) {
      this.setState({
        campaign,
      });
    }

    if (
      this.props.budgets.budgetsList.length !==
      prevProps.budgets.budgetsList.length
    ) {
      const budget = this.props.budgets.budgetsList.find(
        (budget) => budget.campaignId === campaignId
      );

      this.setState({
        budget,
      });
    }
  }

  static getDerivedStateFromProps(nextProps) {
    if (nextProps.campaigns || nextProps.budget) {
      const campaignId = +nextProps.match.params.campaignId;

      const campaign = nextProps.campaign;

      const budget = nextProps.budgets.budgetsList.find(
        (budget) => budget.campaignId === campaignId
      );

      return {
        campaign,
        budget,
      };
    } else {
      return null;
    }
  }

  onDuplicateCampaign() {
    const currentCampaign = _.cloneDeep(this.props.campaign);
    const duplicate = currentCampaign;

    delete duplicate.startDate;
    delete duplicate.createdAt;
    delete duplicate.id;
    delete duplicate.updatedAt;
    delete duplicate.statusReason;
    duplicate.status = NEW;
    duplicate.isDuplicate = true;
    const campaign = { campaign: duplicate, creatives: [] };
    this.props.actions
      .createCampaign(campaign, this.props.history, this.props.history.push)
      .catch((e) => {
        throw new SubmissionError({
          serverError: "Server Error",
        });
      });
  }

  setInitialValuesForForm(action) {
    const {
      match: {
        path,
        params: { campaignType },
      },
      auth: { currentUser },
    } = this.props;
    const { campaign } = this.state;
    const startDate = moment().format("YYYY-MM-DD");
    const endDate = moment().add(1, "years").format("YYYY-MM-DD");

    let formInitialValues;
    if (action === "create") {
      const mtype = campaignType.toUpperCase().split("-")[0];
      formInitialValues = {
        category: [],
        status: PAUSED,
        kpiType: SOFT,
        frequencyCapping: NO_CAP_ON_IMPRESSION,
        clicksLifespan: ONE_HOUR,
        bidType: CPM,
        platform: [ALL],
        deviceType: ALL,
        isDayPartingEnable: false,
        dayParting: null,
        connections: CARRIER_AND_WIFI,
        bidRequestParam: DISABLE,
        gender: FEMALE_AND_MALE,
        monetizationType: mtype,
        modelPayment: CPM,
        accessStatus: currentUser.role === ADVERTISER ? PRIVATE : PUBLIC,
        inventoryControl: SELECT_INVENTORY_SOURCE,
        inventories: [],
        budgetAdvancedOptions: true,
        deliveryType: CONSISTENT_BIDDING,
        inExGeomode: INCLUDE,
        ageGroup: ALL_AGE_GROUP,
        trafficType: trafficType.ALL,
        startDate,
        endDate,
        budget: {},
        isIncludeGeo: true,
        impressionTtl: 20,
        clickTtl: 48,
        toggle: OR,
      };
    } else {
      formInitialValues =
        this.state.campaign && this.state.campaign.id && this.state.budget
          ? {
              ...this.state.campaign,
              ...this.state.budget,
              platform: this.state.campaign.platform,
              inventoryControl: SELECT_INVENTORY_SOURCE,
              budgetAdvancedOptions: campaign && campaign.deliveryType !== null,
              totalBudget:
                this.state.budget.totalBudget === UNLIMITED
                  ? null
                  : this.state.budget.totalBudget,
            }
          : {};
    }

    if (!_.isEmpty(campaign)) {
      formInitialValues.customLifespan = enumDate.includes(
        campaign.clicksLifespan
      )
        ? null
        : campaign.clicksLifespan;
    }

    formInitialValues.disableTestLink = true;
    return formInitialValues;
  }

  onAddCreative(data) {
    this.setState((prevState) => ({
      creatives: [...prevState.creatives, data],
    }));
  }

  onFormSubmit(submitData) {
    if (this.state.submitInProgress) {
      return;
    }
    const formData = { ...submitData };
    const {
      match: { path },
    } = this.props;
    const action = path.includes("create") ? "create" : "update";

    // For CPM campaigns if creatives are not uploaded, trackingUrl should be required
    if (
      !formData.tagEnable &&
      formData.modelPayment === CPM &&
      this.state.creatives.length === 0 &&
      !formData.trackingUrl
    ) {
      throw new SubmissionError({
        trackingUrl: localization.validate.required,
      });
    }

    const submitCampaign = () => {
      if (!Array.isArray(formData.platform)) {
        formData.platform = [formData.platform];
      }

      const data = {
        creatives: this.state.creatives,
      };

      if ([NATIVEADD, NATIVEADD_ALIAS].includes(formData.monetizationType)) {
        const creatives = [];
        const item = {};
        const params = [
          "creativeName",
          "creativeCta",
          "creativeDescription",
          "creativeSponsored",
          "creativeRating",
          "creativeMainImage",
          "creativeIconImage",
        ];

        if (
          !_.isPlainObject(formData.creativeMainImage) ||
          !_.isPlainObject(formData.creativeIconImage)
        ) {
          throw SubmissionError({
            creativeMainImage: "Required",
            creativeIconImage: "Required",
          });
        }

        params.forEach((param) => {
          item[param] = formData[param];
          delete formData[param];
        });

        creatives.push(item);

        data.creatives = creatives;
      }

      if ([VIDEOADD].includes(formData.monetizationType)) {
        const creatives = [];
        const item = {};
        const params = [
          "adTitle",
          "impressionUrl",
          "videoDuration",
          "startDelay",
          "endCard",
          "creativeVideo",
          "creativeImage",
        ];
        if (
          formData.monetizationType === VIDEOADD &&
          !_.isPlainObject(formData.creativeVideo)
        ) {
          throw SubmissionError({
            creativeVideo: "Required",
          });
        }

        if (formData.endCard && !_.isPlainObject(formData.creativeImage)) {
          throw SubmissionError({
            creativeImage: "Required",
          });
        }

        params.forEach((param) => {
          item[param] = formData[param];
          if (param !== "videoDuration") {
            delete formData[param];
          }
        });

        creatives.push(item);
        data.creatives = creatives;
      }

      if ([AUDIOADD].includes(formData.monetizationType)) {
        const creatives = [];
        const item = {};
        const params = [
          "adTitle",
          "impressionUrl",
          "audioDuration",
          "startDelay",
          "endCard",
          "creativeAudio",
          "creativeImage",
        ];
        if (
          formData.monetizationType === AUDIOADD &&
          !_.isPlainObject(formData.creativeAudio)
        ) {
          throw SubmissionError({
            creativeAudio: "Required",
          });
        }

        if (formData.endCard && !_.isPlainObject(formData.creativeImage)) {
          throw SubmissionError({
            creativeImage: "Required",
          });
        }

        params.forEach((param) => {
          item[param] = formData[param];
          if (param !== "audioDuration") {
            delete formData[param];
          }
        });

        creatives.push(item);
        data.creatives = creatives;
      }
      this.setState({
        submitInProgress: true,
      });

      if (action === "create") {
        const editedFormData = {
          ...formData,
          // status: NEW,
          advertisingChannel: null,
          monetizationType: formData.monetizationType.toUpperCase(),
        };

        if (formData.startDate) {
          editedFormData.startDate = moment(formData.startDate)
            .startOf("day")
            .format();
        }
        if (formData.endDate) {
          editedFormData.endDate = moment(formData.endDate)
            .endOf("day")
            .format();
        }
        if (this.props.auth.currentUser.role === ADVERTISER) {
          editedFormData.advertiserId = this.props.auth.currentUser.id;
        }

        data.campaign = editedFormData;
        return this.props.actions
          .createCampaign(
            data,
            this.props.auth.currentUser.role,
            this.props.history.push
          )
          .final(() => {
            this.setState({
              submitInProgress: false,
            });
          })
          .catch((e) => {
            const errors = {};

            e.response.data.errors.forEach((error) => {
              errors[error.path] = error.message;
            });

            throw new SubmissionError(errors);
          });
      } else if (formData.id) {
        data.campaign = {
          ...formData,
          totalBudget: !formData.totalBudget ? UNLIMITED : formData.totalBudget,
        };
        return this.props.actions
          .updateCampaign(data)
          .final(() => {
            this.setState({
              submitInProgress: false,
            });
          })
          .catch(() => {
            throw SubmissionError({
              serverError: "Server Error",
            });
          });
      }
    };

    submitCampaign();
  }

  render() {
    const {
      match: { path },
      campaign,
    } = this.props;
    const action = path.includes("create") ? "create" : "update";
    const formInitialValues = this.setInitialValuesForForm(action);
    return (
      <div className="create-campaign-page">
        <div className="back_to_wrapper">
          <BackTo path="/campaigns" text="campaigns" />
          {/* <Duplicate onClick={this.onDuplicateCampaign} /> */}
        </div>
        <CreateCpmCampaignForm
          categoriesList={this.props.campaigns.categoriesList}
          onSubmit={this.onFormSubmit}
          auth={this.props.auth}
          countries={this.props.countries}
          users={this.props.users}
          audiences={this.props.audiences}
          initialValues={formInitialValues}
          action={action}
          match={this.props.match}
          isRequestPending={this.props.campaigns.isRequestPending}
          submitInProgress={this.state.submitInProgress}
          campaign={campaign}
          inventoryList={this.props.inventoryList}
          addCreative={this.onAddCreative}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  countries: state.countries,
  campaign: state.campaigns.currentCampaign,
  audiences: state.campaigns.audiences,
  campaigns: state.campaigns,
  budgets: state.budgets,
  users: state.users.advertisers,
  publishers: state.users.publishers,
  inventoryList: state.campaigns.inventoryList,
  dataPartners: state.campaigns.dataPartners
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(
    {
      loadLanguages,
      createCampaign,
      getCampaignById,
      loadBudgets,
      updateCampaign,
      loadAdvertisers,
      loadCategories,
      loadCampaignAudiences,
    },
    dispatch
  ),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreateCpmCampaignPage);
