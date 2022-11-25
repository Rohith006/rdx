import React, { Component, Fragment } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import Select from "react-select";
import { SubmissionError } from "redux-form";
import classNames from "classnames";
import Link from "react-router-dom/es/Link";
import { Tabs, Tab, TabPanel, TabList } from "react-web-tabs";

import CustomOptimizerForm from "../forms/CustomOptimizerForm";
import { loadPublishers } from "../../actions/users";
import { loadCampaigns } from "../../actions/campaigns&budgets";
import {
  addSubIdsToList,
  loadSubIds,
  deleteSubIdsFromList,
} from "../../actions/subIdWhiteBlackLists";
import * as subIdWhiteBlackListsConstants from "../../constants/subIdWhiteBlackLists";
import localization from "../../localization/index";
import { SvgDelete } from "../common/Icons";
import {
  ADMIN,
  OWNER,
  ACCOUNT_MANAGER,
  ADVERTISER,
} from "../../constants/user";
import DisplayCheck from "../../permissions";
import BlackList from "./CampaignWhiteBlackList/BaclkList";
import PendingContainer from "../UI/PendingContainer";
import { ALL } from "../../constants/campaigns";

class CustomOptimizer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedCategory: "campaign",
      tab: "BLACKLIST",
      showActionsBlackList: false,
      showActionsWhiteList: false,
      selectedFilters: {},
      blacklistGridOptions: {
        rowHeight: 52,
        onGridReady: (params) => {
          this.blacklistGridApi = params.api;
        },
        domLayout: "autoHeight",
        onFirstDataRendered: (params) => {
          params.api.sizeColumnsToFit();
        },
        onRowDataChanged: (params) => {
          params.api.sizeColumnsToFit();
        },
        onSelectionChanged: this.onSelectionChanged.bind(
          this,
          "showActionsBlackList"
        ),
        frameworkComponents: {
          deleteCellRenderer: this.deleteCellRenderer,
          idCellRenderer: this.idCellRenderer,
        },
        suppressDragLeaveHidesColumns: true,
        rowSelection: "multiple",
      },
      whitelistGridOptions: {
        rowHeight: 52,
        onGridReady: (params) => {
          this.whitelistGridApi = params.api;
        },
        domLayout: "autoHeight",
        onFirstDataRendered: (params) => {
          params.api.sizeColumnsToFit();
        },
        onRowDataChanged: (params) => {
          params.api.sizeColumnsToFit();
        },
        onSelectionChanged: this.onSelectionChanged.bind(
          this,
          "showActionsWhiteList"
        ),
        frameworkComponents: {
          deleteCellRenderer: this.deleteCellRenderer,
          idCellRenderer: this.idCellRenderer,
        },
        suppressDragLeaveHidesColumns: true,
        rowSelection: "multiple",
      },
      isRowSelectable: function (node) {
        return node.data ? node.data.campaignId !== ALL : false;
      },
    };

    this.handleCustomOptimizerFormSubmit =
      this.handleCustomOptimizerFormSubmit.bind(this);
    this.updateFilters = this.updateFilters.bind(this);
    this.onLoadSubIds = this.onLoadSubIds.bind(this);
    this.onFilterWhitelistChange = this.onFilterWhitelistChange.bind(this);
    this.onCategoryTypeSelect = this.onCategoryTypeSelect.bind(this);
    this.deleteSubIdBlackListItem = this.deleteSubIdBlackListItem.bind(this);
    this.deleteSubIdWhiteListItem = this.deleteSubIdWhiteListItem.bind(this);
    this.exportDataAsCsv = this.exportDataAsCsv.bind(this);
  }

  onSelectionChanged(showActionsKey, e) {
    const rowCount = e.api.getSelectedNodes().length;
    this.setState({
      rowSelected: rowCount > 0,
      [showActionsKey]: rowCount !== 0,
    });
  }

  updateFilters(params) {
    this.setState({
      selectedFilters: params,
    });
  }

  async deleteSubIdBlackListItem(params) {
    const { selectedCategory, selectedFilters } = this.state;
    const data = {
      ...params,
      category: selectedCategory,
      list: "BLACKLIST",
      type: selectedFilters.type,
      publisher: selectedFilters.publisherId,
      campaign: selectedFilters.campaign,
    };
    await this.props.actions.deleteSubIdsFromList(data);
    await this.props.actions.loadSubIds({
      list: data.list,
      campaignId: data.campaign,
      publisherId: data.publisher,
      type: data.type,
      category: selectedCategory,
    });
    this.setState({
      showActionsBlackList: false,
    });
  }

  async deleteSubIdWhiteListItem(params) {
    const { selectedCategory, selectedFilters } = this.state;
    const data = {
      ...params,
      category: selectedCategory,
      list: "WHITELIST",
      type: selectedFilters.type,
      publisher: selectedFilters.publisherId,
      campaign: selectedFilters.campaign,
    };
    await this.props.actions.deleteSubIdsFromList(data);

    await this.props.actions.loadSubIds({
      list: data.list,
      campaignId: data.campaign,
      publisherId: data.publisher,
      type: data.type,
      category: selectedCategory,
    });
    this.setState({
      showActionsWhiteList: false,
    });
  }

  prepareTableColumnDefsProps(selectedCategory) {
    const columnDefs = [
      {
        headerName: localization.tools.custom.publisherId,
        field: "publisherId",
        headerClass: "ag-grid-header-cell",
        cellRenderer: "idCellRenderer",
      },
      {
        headerName: localization.tools.custom.type,
        field: "type",
        headerClass: "ag-grid-header-cell",
      },
      {
        headerName: localization.tools.custom.value,
        field: "value",
        headerClass: "ag-grid-header-cell",
      },
    ];
    if (selectedCategory === "campaign") {
      columnDefs.unshift({
        headerName: localization.tools.custom.campaignId,
        field: "campaignId",
        headerClass: "ag-grid-header-cell",
        cellRenderer: "idCellRenderer",
      });
      columnDefs.unshift({
        headerClass: "ag-grid-header-cell",
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        checkboxSelection: true,
        minWidth: 70,
        width: 70,
        maxWidth: 95,
      });
    }

    return columnDefs;
  }

  componentDidMount() {
    this.props.actions.loadCampaigns();
    this.props.actions.loadPublishers();
  }

  onLoadSubIds(data) {
    this.props.actions.loadSubIds(data);
  }

  handleCustomOptimizerFormSubmit(formData) {
    const demand = formData.campaignId && formData.campaignId.value;
    const publisherId = formData.publisherId && formData.publisherId.value;
    const type = formData.type && formData.type.value;
    const data = {
      demand,
      publisherId,
      type: type || "subId",
      subId: formData.subId,
      list: this.state.tab,
      category: this.state.selectedCategory,
    };

    return this.props.actions.addSubIdsToList(data).catch((error) => {
      const errors = error.response.data.errors;

      if (errors) {
        const error = {};
        errors.forEach((err) => {
          error[err.path] = err.message;
        });
        throw new SubmissionError(error);
      } else {
        console.error(error);
      }
    });
  }
  renderSelectField({
    meta: { touched, error },
    selectPublisherData,
    selectedPublisher,
  }) {
    return (
      <div className={classNames({ "input-error-wrapper": touched && error })}>
        <span className="form__text-field__name mb2">Select publisher</span>
        <Select
          options={selectPublisherData}
          value={selectedPublisher}
          onChange={this.onSelectPublisherChange}
          placeholder="Select..."
        />
        <div className="input-error-wrapper__error-container">
          <span>{touched && error}</span>
        </div>
      </div>
    );
  }

  onCategoryTypeSelect(e) {
    this.setState({
      selectedCategory: e.target.value,
    });

    this.props.actions.loadSubIds({ category: e.target.value });
  }

  onFilterWhitelistChange(e) {
    this.whitelistGridApi.setQuickFilter(e.target.value);
  }

  deleteCellRenderer() {
    return (
      <div className="ag-root__cell-icon">
        <span className="editor-control">
          <SvgDelete />
        </span>
      </div>
    );
  }

  idCellRenderer(props) {
    const key = props.colDef.field;
    const id = props.data[key];
    return <span>{id || "All"}</span>;
  }

  exportDataAsCsv(isBlack) {
    try {
      const api = isBlack ? this.blacklistGridApi : this.whitelistGridApi;
      if (api.getDisplayedRowCount()) {
        api.exportDataAsCsv();
      }
    } catch (e) {
      console.error(e);
    }
  }

  render() {
    let selectOptionsData;
    let whitelistTitle;

    if (this.state.selectedCategory === "campaign") {
      whitelistTitle = localization.tools.custom.campaignWhiteList;
      selectOptionsData =
        this.props.auth.currentUser.role !== ADMIN
          ? []
          : [{ value: null, label: "All" }];

      selectOptionsData = [
        ...selectOptionsData,
        ...this.props.campaigns.campaignsList.map((campaign) => ({
          value: campaign.id,
          label: `(${campaign.id}) ${campaign.campaignName}`,
        })),
      ];
    }

    // TODO Don't load all publishers
    const selectPublisherData = [
      { value: null, label: "All" },
      ...this.props.users.publishers
        .filter((publisher) => publisher.status === "ACTIVE")
        .map((publisher) => ({
          value: publisher.id,
          label: publisher.name,
        })),
    ];

    const { selectedCategory } = this.state;
    const blacklist = this.props.subIdWhiteBlackLists.subIds.filter(
      (item) => item.list === "BLACKLIST"
    );
    const whitelist = this.props.subIdWhiteBlackLists.subIds.filter(
      (item) => item.list === "WHITELIST"
    );

    const columnDefs = this.prepareTableColumnDefsProps(selectedCategory);
    return (
      <Fragment>
        <PendingContainer
          isPending={
            this.props.subIdWhiteBlackLists.isSubIdWhiteListRequestPending
          }
          className={true}
        >
          <div className="card settings">
            <Tabs
              defaultTab="BLACKLIST"
              onChange={(tabId) => {
                this.setState({ tab: tabId });
              }}
            >
              <TabList>
                <Tab type="button" tabFor="BLACKLIST" className="settingsTabs">
                  {localization.tools.custom.blacklist}
                </Tab>
                <Tab type="button" tabFor="WHITELIST" className="settingsTabs">
                  {localization.tools.custom.whitelist}
                </Tab>
              </TabList>
              <TabPanel type="button" tabId="BLACKLIST">
                <div className="settingsTabContainer">
                  <div>
                    <CustomOptimizerForm
                      onSubmit={this.handleCustomOptimizerFormSubmit}
                      onLoadSubIdList={this.onLoadSubIds}
                      onUpdateFilters={this.updateFilters}
                      category={this.state.selectedCategory}
                      options={selectOptionsData}
                      selectPublisherData={selectPublisherData}
                      initialValues={{
                        list: subIdWhiteBlackListsConstants.BLACKLIST,
                        type: "subId",
                        subId: null,
                      }}
                    />
                  </div>
                </div>
                <hr className="settingsLine"></hr>

                {/* Black List Table */}
                <div>
                  <BlackList
                    list={blacklist}
                    columnDefs={columnDefs}
                    title={localization.tools.custom.blacklist}
                    listGridOptions={this.state.blacklistGridOptions}
                    listGridApi={this.blacklistGridApi}
                    showActionsList={this.state.showActionsBlackList}
                    deleteSubIdListItem={this.deleteSubIdBlackListItem}
                    exportDataAsCsv={() => this.exportDataAsCsv(1)}
                    isRowSelectable={this.state.isRowSelectable}
                    auth={this.props.auth}
                  />
                </div>
              </TabPanel>
              <TabPanel type="button" tabId="WHITELIST">
                <div className="settingsTabContainer">
                  <div>
                    <CustomOptimizerForm
                      onSubmit={this.handleCustomOptimizerFormSubmit}
                      onLoadSubIdList={this.onLoadSubIds}
                      onUpdateFilters={this.updateFilters}
                      category={this.state.selectedCategory}
                      options={selectOptionsData}
                      selectPublisherData={selectPublisherData}
                      initialValues={{
                        list: subIdWhiteBlackListsConstants.BLACKLIST,
                        type: "subId",
                        subId: null,
                      }}
                    />
                  </div>
                </div>
                <hr className="settingsLine"></hr>
                {/* White List Table */}
                <div>
                  <BlackList
                    list={whitelist}
                    columnDefs={columnDefs}
                    title={localization.tools.custom.whitelist}
                    listGridOptions={this.state.whitelistGridOptions}
                    listGridApi={this.whitelistGridApi}
                    showActionsList={this.state.showActionsWhiteList}
                    deleteSubIdListItem={this.deleteSubIdWhiteListItem}
                    exportDataAsCsv={() => this.exportDataAsCsv(0)}
                    isRowSelectable={this.state.isRowSelectable}
                    auth={this.props.auth}
                  />
                </div>
              </TabPanel>
            </Tabs>
          </div>
        </PendingContainer>
      </Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  campaigns: state.campaigns,
  users: state.users,
  auth: state.auth,
  subIdWhiteBlackLists: state.subIdWhiteBlackLists,
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(
    {
      loadCampaigns,
      loadPublishers,
      addSubIdsToList,
      deleteSubIdsFromList,
      loadSubIds,
    },
    dispatch
  ),
});

CustomOptimizer.propTypes = {
  actions: PropTypes.object,
};

export default connect(mapStateToProps, mapDispatchToProps)(CustomOptimizer);
