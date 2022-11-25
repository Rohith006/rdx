import React, { Component, Fragment } from "react";
import { Link } from "react-router-dom";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import classNames from "classnames";
import { AgGridReact } from "ag-grid-react";
import Select from "react-select";
import moment from "moment";

import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-balham.css";

import {
  deleteCampaigns,
  updateCampaignStatus,
  getCountCampaigns,
  loadCampaignTagsList,
} from "../../actions/campaigns&budgets";
import { loadAdvertisers } from "../../actions/users";

import {
  ACCOUNT_MANAGER,
  ADMIN,
  ADVERTISER,
  OWNER,
  PUBLISHER,
} from "../../constants/user";
import {
  os,
  ACTIVE,
  NEW,
  PAUSED,
  SUSPENDED,
  REMOVED,
  CPM,
} from "../../constants/campaigns";
import { CAMPAIGNS_COLUMN_DEFS } from "../../utils/agGrid/columnDefs/campaigns";
import { loadCampaignsStatistics } from "../../actions/campaignsStatistics";
import localization from "../../localization";
import DisplayCheck from "../../permissions";
import { SvgEdit, SvgSearch } from "../common/Icons";
import onOutsideElementClick from "../../utils/onOutsideElementClick";
import customToFixed from "../../utils/agGrid/renderers/customToFixed";
import amountCellRenderer from "../../utils/agGrid/renderers/amountCellRenderer";
import tagsCellRenderer from "../../utils/agGrid/renderers/tagsCellRenderer";
import customNumberFormat from "../../utils/agGrid/renderers/customNumberFormat";
import { reduxForm } from "redux-form";
import Summary from "../UI/Summary";
import ExtraDatePicker from "../UI/ExtraDatePicker/ExtraDatePicker";
import TopBar from "../common/TopBar/TopBar";
import PaginationContainer from "../UI/ShowLinesDropdown";
import { changePaginationData } from "../../actions/app";
import { loadCampaigns } from "../../actions/campaigns&budgets";
import { styles } from "../UI/selectStyles";
import PendingContainer from "../UI/PendingContainer2";

class CampaignsListPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      startDate: null,
      endDate: null,
      columnDefs: [],
      campaigns: [],
      offset: 0,
      filteredCampaignsList: "INITIAL_FILTERED_CAMPAIGNS",
      gridOptions: {
        pagination: false,
        rowHeight: 52,
        // paginationPageSize: 100,
        paginationNumberFormatter: function (params) {
          return params.value.toLocaleString();
        },
        suppressRowClickSelection: false,
        domLayout: "autoHeight",
        onGridReady: (params) => {
          this.gridApi = params.api;
        },
        onFirstDataRendered: (params) => {
          params.api.sizeColumnsToFit();
        },
        onRowDataChanged: (params) => {
          params.api.sizeColumnsToFit();
        },
        rowSelection: "multiple",
        frameworkComponents: {
          campaignStatusRenderer: this.campaignStatusRenderer,
          campaignChannelRenderer: this.campaignChannelRenderer,
          campaignNameRenderer: this.campaignNameRenderer.bind(this),
          kpiRenderer: this.kpiRenderer.bind(this),
          tagsCellRenderer,
          platformRenderer: this.platformRenderer.bind(this),
          modelRenderer: this.modelRenderer.bind(this),
          renderEditor: (props) => (
            <RenderEditor
              {...this.props}
              {...props}
              loadCampaignsStatistic={this.loadCampaignsStatistic}
            />
          ),
          customToFixed,
          amountCellRenderer,
          customNumberFormat,
        },
        onSelectionChanged: this.onSelectionChanged.bind(this),
        suppressDragLeaveHidesColumns: true,
      },
      filters: {
        selectedCountry: null,
        selectedCountries: [],
        selectTagData: [],
        selectedOs: null,
        selectedModel: null,
        selectedTags: null,
        selectedCampaignType: null,
        selectedUser: null,
        selectedStatus: null,
        selectedTag: null,
        selectCountriesData: [],
        selectOsData: [
          { label: "-", value: null },
          { label: "iOS", value: os.mobile.IOS },
          { label: "Android", value: os.mobile.ANDROID },
        ],
        selectCampaignTypeData: [
          { label: "-", value: null },
          { label: "CPM", value: CPM },
          // { label: "CPC", value: CPC }
        ],
        selectStatusData: [
          { label: "-", value: null },
          { label: "New", value: NEW },
          { label: "Active", value: ACTIVE },
          { label: "Paused", value: PAUSED },
          { label: "Suspended", value: SUSPENDED },
          { label: "Removed", value: REMOVED },
        ],
        selectUserData: [],
        channel: "",
        deviceType: "",
        connectionType: "null",
      },
      summary: {
        newCount: 0,
        activeCount: 0,
        pausedCount: 0,
      },
      showActionsDropdown: false,
      rowSelected: false,
      showReportingDropdown: false,
      showActions: false,
      pageCount: 1,
    };

    this.toggleActionsDropdown = this.toggleActionsDropdown.bind(this);
    this.onSearchInputChange = this.onSearchInputChange.bind(this);
    this.deleteCampaigns = this.deleteCampaigns.bind(this);
    this.onSelectCountryChange = this.onSelectCountryChange.bind(this);
    this.onSelectClose = this.onSelectClose.bind(this);
    this.toggleDropdown = this.toggleDropdown.bind(this);
    this.deleteSelectedCountry = this.deleteSelectedCountry.bind(this);
    this.submitFilter = this.submitFilter.bind(this);
    this.updateCampaignStatus = this.updateCampaignStatus.bind(this);
    this.loadCampaignsStatistic = this.loadCampaignsStatistic.bind(this);
    this.getCampaignsStatistic = this.getCampaignsStatistic.bind(this);
    this.setCountCampaigns = this.setCountCampaigns.bind(this);
    this.exportDataAsCsv = this.exportDataAsCsv.bind(this);
    this.onSelectTimeChange = this.onSelectTimeChange.bind(this);
    this.changeState = this.changeState.bind(this);
    this.setOffsetPagination = this.setOffsetPagination.bind(this);
    this.disableActionButtons = this.disableActionButtons.bind(this);
  }

  async componentDidMount() {
    const { startDate, endDate } = this.state;
    const options = {
      // startDate,
      // endDate,
    };
    const { filters } = this.state;
    const { count, limit } = this.props;
    this.props.actions.loadCampaignsStatistics(options);
    this.props.actions.loadCampaignTagsList();

    // onOutsideElementClick(this.actionsDropdown, () => {
    //   if (this.state.showActionsDropdown) {
    //     this.setState({
    //       showActionsDropdown: false,
    //     })
    //   }
    // })
    onOutsideElementClick(this.reportingDropdown, () => {
      if (this.state.showReportingDropdown) {
        this.setState({
          showReportingDropdown: false,
        });
      }
    });

    // const campaigns = await this.props.actions.campaignsStatisticsList({
    //   limit: 100,
    //   offset: 0,
    //   ...filters,
    // })
    // this.setState({ campaigns })
    // document
    //   .querySelector('.pagination-container')
    //   .children[1].children[0].click()
    onOutsideElementClick(this.actionsDropdown, () => {
      if (this.state.showActionsDropdown) {
        this.setState({
          showActionsDropdown: false,
        });
      }
    });
    if (!this.state.pageCount) {
      this.setState({
        pageCount: count / limit || 1,
      });
    }
  }

  async componentDidUpdate(prevProps, prevState) {
    const {
      campaignsStatistics: { campaignsStatisticsList },
      tagsList,
    } = this.props;
    if (
      campaignsStatisticsList !==
      prevProps.campaignsStatistics.campaignsStatisticsList
    ) {
      this.setState({
        filteredCampaignsList: campaignsStatisticsList,
      });
      this.setState({
        summary: {
          newCount: campaignsStatisticsList.filter(
            (c) => c.campaign.status === NEW
          ).length,
          activeCount: campaignsStatisticsList.filter(
            (c) => c.campaign.status === ACTIVE
          ).length,
          pausedCount: campaignsStatisticsList.filter(
            (c) => c.campaign.status === PAUSED
          ).length,
        },
      });
    }
    if (tagsList !== prevProps.tagsList) {
      this.setState({
        filters: {
          ...this.state.filters,
          selectTagData: tagsList.map((el) => ({
            value: el.id,
            label: el.name,
          })),
        },
      });
    }

    const { count, limit, offset } = this.props;
    const { filters } = this.state;
    if (count !== prevProps.count) {
      this.setState({
        pageCount: count / limit || 1,
      });
    }

    if (this.props.users !== prevProps.users) {
      this.setState({ campaigns: this.props.users });
    }

    if (limit !== prevProps.limit) {
      this.setState({
        pageCount: count / limit || 1,
      });

      const campaigns = await this.props.actions.campaignsStatisticsList({
        limit,
        offset,
        ...filters,
      });
      this.setState({ campaigns });
    }
  }

  onSelectTimeChange(date, type) {
    if (this.state.startDate === null) {
      if (type === "endDate") {
        this.setState({
          startDate: moment().startOf("month").format("YYYY-MM-DD"),
        });
      }
    }
    if (this.state.endDate === null) {
      if (type === "startDate") {
        this.setState({
          endDate: moment().format("YYYY-MM-DD"),
        });
      }
    }
    this.setState((prevState) => ({
      rowSelected: false,
      ...prevState,
      [type]: date.format("YYYY-MM-DD"),
    }));
  }

  exportDataAsCsv() {
    try {
      if (this.gridApi.getDisplayedRowCount()) {
        this.gridApi.exportDataAsCsv();
      }
    } catch (e) {
      console.log(e);
    }
  }

  async setCountCampaigns() {
    const { auth } = this.props;
    const {
      startDate,
      endDate,
      filters: {
        selectedOs,
        selectedUser,
        selectedCampaignType,
        selectedCountries,
        selectedStatus,
      },
    } = this.state;

    const options = {
      startDate,
      endDate,
      os: selectedOs && selectedOs.value,
      advertiserId: selectedUser && selectedUser.value,
      campaignType: selectedCampaignType && selectedCampaignType.value,
      countries:
        selectedCountries && selectedCountries.map((item) => item.value),
      status: selectedStatus && selectedStatus.value,
    };

    if (auth.currentUser.role === ADVERTISER) {
      options.advertiserId = auth.currentUser.id;
    }

    const countRes = await getCountCampaigns(options);
    this.setState({ countCampaigns: countRes.data.count });
  }

  getCampaignsStatistic(offset) {
    const { auth } = this.props;
    const { startDate, endDate } = this.state;

    const options = {
      startDate,
      endDate,
      offset,
    };
    if (auth.currentUser.role === ADVERTISER) {
      options.advertiserId = auth.currentUser.id;
    }

    this.props.actions.loadCampaignsStatistics(options);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const {
      auth: {
        currentUser: { role, permissions },
      },
    } = nextProps;
    if (
      nextProps.auth.currentUser.role &&
      (nextProps.auth.currentUser.role === ADMIN
        ? nextProps.users.length
        : true)
    ) {
      const selectCountriesData = nextProps.countries.countriesList.map(
        (country) => ({
          value: country.alpha2Code,
          label: country.name,
        })
      );

      const selectUserData = nextProps.users
        .filter((user) => user.role !== PUBLISHER)
        .map((user) => ({
          value: user.id,
          label: user.name,
        }));

      let columnDefs = _.cloneDeep(CAMPAIGNS_COLUMN_DEFS[role]);

      columnDefs = columnDefs.filter((item) => {
        if (
          permissions &&
          !permissions.includes("PUBLISHERS") &&
          item.field === "payout"
        ) {
          return false;
        }
        if (
          permissions &&
          !permissions.includes("SEE_PROFIT") &&
          item.field === "profit"
        ) {
          return false;
        }
        return true;
      });

      const toSet = {
        columnDefs: columnDefs,
        filters: {
          ...prevState.filters,
          // selectCampaignsData,
          selectCountriesData: [
            { label: "-", value: null },
            ...selectCountriesData,
          ],
          selectUserData: [{ label: "-", value: null }, ...selectUserData],
        },
      };

      toSet.filteredCampaignsList =
        nextProps.campaignsStatistics.campaignsStatisticsList;

      return toSet;
    } else {
      return null;
    }
  }

  onSelectChange(selectedValue, fieldName) {
    const value = { id: selectedValue.value, name: selectedValue.label };

    this.props.change(fieldName, value);
  }

  campaignNameRenderer(params) {
    const campaign = params.node.data.campaign;
    return (
      <Link to={`/campaigns/${campaign.id}/edit`}>{campaign.campaignName}</Link>
    );
  }

  toggleActionsDropdown() {
    this.setState((prevState) => ({
      showActionsDropdown: !prevState.showActionsDropdown,
    }));
  }

  onSearchInputChange(e) {
    this.gridApi.setQuickFilter(e.target.value);
  }

  onSelectionChanged(event) {
    const rowCount = event.api.getSelectedNodes().length;

    this.setState({
      rowSelected: rowCount > 0,
      showActions: rowCount !== 0,
    });
  }

  onSelectCountryChange(selectedCountry) {
    if (this.state.filters.selectedCountries.length < 15) {
      if (selectedCountry.value) {
        this.setState((prevState) => {
          const setToState = {
            filters: {
              ...prevState.filters,
            },
          };

          if (
            !prevState.filters.selectedCountries.find(
              (country) => country.value === selectedCountry.value
            )
          ) {
            setToState.filters.selectedCountries = [
              ...prevState.filters.selectedCountries,
              selectedCountry,
            ];
          }

          return setToState;
        });
      } else {
        this.setState((prevState) => ({
          filters: {
            ...prevState.filters,
            selectedCountry: null,
          },
        }));
      }
    }
  }

  onSelectChange(attribute, filter) {
    this.setState((prevState) => ({
      filters: {
        ...prevState.filters,
        [attribute]: filter.value ? filter : null,
      },
    }));
  }

  onSelectChange2(attribute, filter) {
    this.setState((prevState) => ({
      filters: {
        ...prevState.filters,
        [attribute]: filter ? filter : null,
      },
    }));
  }

  deleteSelectedCountry(val) {
    this.setState((prevState) => ({
      filters: {
        ...prevState.filters,
        selectedCountries: prevState.filters.selectedCountries.filter(
          (country, i) => i !== val
        ),
      },
    }));
  }

  loadCampaignsStatistic() {
    const { startDate, endDate } = this.state;
    const options = {
      startDate,
      endDate,
    };

    this.props.actions.loadCampaignsStatistics(options);
  }

  async deleteCampaigns() {
    const campaignsIds = this.gridApi
      .getSelectedRows()
      .map((data) => data.campaign.id);
    await this.props.actions.deleteCampaigns(campaignsIds);
    await this.loadCampaignsStatistic();
    this.setState({ filteredRowData: "" });
    this.toggleActionsDropdown();
    this.setState({
      rowSelected: false,
      showActions: false,
    });
  }

  async updateCampaignStatus(status) {
    const campaignsIds = this.gridApi
      .getSelectedRows()
      .map((campaigns) => campaigns.campaign.id);
    await this.props.actions.updateCampaignStatus({
      ids: campaignsIds,
      status,
    });
    await this.loadCampaignsStatistic();
    this.toggleActionsDropdown();
    this.setState({
      rowSelected: false,
      filteredCampaignsList: "INITIAL_FILTERED_CAMPAIGNS",
      showActions: false,
    });
  }

  submitFilter() {
    const { auth } = this.props;
    const {
      startDate,
      endDate,
      filters: {
        selectedOs,
        selectedUser,
        selectedCampaignType,
        selectedCountries,
        selectedStatus,
        selectedModel,
        selectedTag,
      },
    } = this.state;

    const options = {
      startDate,
      endDate,
      os: selectedOs && selectedOs.value,
      advertiserId: selectedUser && selectedUser.value,
      campaignType: selectedCampaignType && selectedCampaignType.value,
      countries:
        selectedCountries && selectedCountries.map((item) => item.value),
      status: selectedStatus && selectedStatus.value,
      modelPayment: selectedModel && selectedModel.value,
      selectedTag: selectedTag && selectedTag.map((el) => el.label),
    };

    if (auth.currentUser.role === ADVERTISER) {
      options.advertiserId = auth.currentUser.id;
    }
    this.props.actions.loadCampaignsStatistics(options);
    this.setCountCampaigns();
  }

  campaignChannelRenderer(params) {
    const valueFormatted =
      (params.valueFormatted && params.valueFormatted.toLowerCase()) ||
      params.value;
    return (
      <span className={`channel  ${valueFormatted}`}>{valueFormatted}</span>
    );
  }

  campaignStatusRenderer(params) {
    return (
      <span className={`status ${params.value.toLowerCase()}`}>
        {params.value.toLowerCase()}
      </span>
    );
  }

  platformRenderer(params) {
    return params.value
      .map((v) => v.replace(/_/g, " ").toLowerCase())
      .join(", ");
  }

  kpiRenderer(params) {
    return params.value ? params.value.toLowerCase() : "";
  }

  modelRenderer(params) {
    return params.value;
  }

  onSelectClose(element) {
    setTimeout(() => {
      this.setState({
        [element]: false,
      });
    }, 300);
  }

  toggleDropdown(name) {
    this.setState((prevState) => ({
      [name]: !prevState[name],
    }));
  }

  changeState(state, value) {
    this.setState({
      [state]: value,
    });
  }

  async setOffsetPagination({ selected }) {
    const { filters } = this.state;
    const { limit, actions } = this.props;
    const offset = selected * limit;
    this.setState({ offset });
    const campaigns = await this.props.actions.loadCampaigns({
      limit,
      offset,
      ...filters,
    });
    this.setState({ campaigns });
    actions.changePaginationData(limit, offset, "campaigns");
  }

  disableActionButtons(status){
    let statusArr = [];
    if(this.gridApi){
        this.gridApi.getSelectedRows().forEach(item => {
          if(!statusArr.includes(item.campaign.status)){
            statusArr.push(item.campaign.status);
          }
        });
        if(statusArr.length > 1) return false;
        if(statusArr.includes(status)) return true;
    }
    return false;
  }

  render() {
    const { summary } = this.state;
    const  {props} = this;

    return (
      <Fragment>
        <TopBar title={localization.header.nav.campaigns} subtitle="Today" />
        <Summary count={summary} />
        <div className="card">
          {/* <div className="card_header bordered">
            <div className="subheading_cover">
              <h2 className="heading">{localization.campaigns.title}</h2>
              
            </div>
          </div> */}
          <div>
            <form className="form_cover">
              <div className="search_cover width">
                <span className="icon" title="">
                  <SvgSearch />
                </span>
                <input
                  onChange={this.onSearchInputChange}
                  type="text"
                  className=""
                  placeholder={localization.campaigns.search}
                  autoComplete="off"
                />
              </div>

              <DisplayCheck roles={[ADMIN, OWNER, ACCOUNT_MANAGER]}>
                <div className="form-control width">
                  <Select
                    className="filter-form__select filter-form__select--disabled"
                    placeholder={localization.campaigns.filters.advertisers}
                    options={this.state.filters.selectUserData}
                    onChange={(e) => this.onSelectChange("selectedUser", e)}
                    value={this.state.filters.selectedUser}
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
              <div className="form-control">
                <Select
                  className="filter-form__select filter-form__select--disabled"
                  placeholder="Type"
                  options={this.state.filters.selectCampaignTypeData}
                  onChange={(e) =>
                    this.onSelectChange("selectedCampaignType", e)
                  }
                  value={this.state.filters.selectedCampaignType}
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
              <div className="form-control">
                <Select
                  className="filter-form__select filter-form__select--disabled"
                  placeholder="Labels"
                  options={this.state.filters.selectTagData}
                  onChange={(e) => this.onSelectChange2("selectedTag", e)}
                  value={this.state.filters.selectedTag}
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

              <div className="form-control">
                <Select
                  className="filter-form__select filter-form__select--disabled"
                  placeholder={localization.campaigns.filters.status}
                  options={this.state.filters.selectStatusData}
                  onChange={(e) => this.onSelectChange("selectedStatus", e)}
                  value={this.state.filters.selectedStatus}
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
                startDate={
                  this.state.startDate
                    ? this.state.startDate
                    : moment().startOf("month").format("YYYY-MM-DD")
                }
                endDate={
                  this.state.endDate
                    ? this.state.endDate
                    : moment().format("YYYY-MM-DD")
                }
                showRanges={true}
                onSelectTimeChange={this.onSelectTimeChange}
              />
              <button
                onClick={this.submitFilter}
                type="button"
                className="btn sign-blue apply"
                style={{
                  marginRight: 50,
                }}
                title=""
              >
                {localization.forms.applyFilters}
              </button>
              <DisplayCheck roles={[ADMIN, OWNER, ADVERTISER, ACCOUNT_MANAGER]}>
                <Link to={`/campaigns/create/rtb`}>
                  <button type="button" className="btn neutral add" title="">
                    {localization.forms.addNew}
                  </button>
                </Link>
              </DisplayCheck>
            </form>
            
            <PendingContainer isPending={props.campaignsStatistics.isRequestPending}>
            <div
              className="ag-theme-balham"
              style={{
                boxSizing: "border-box",
                width: "100%",
                borderTop: "1px solid rgba(68, 68, 68, 0.3)",
              }}
            >
              <div
                className={classNames("actions_cover", {
                  active: this.state.showActions,
                })}
              >
                <button
                  disabled={this.disableActionButtons(ACTIVE)}
                  className="actions_cover-item activate"
                  onClick={() => this.updateCampaignStatus(ACTIVE)}
                >
                  <span>Activate</span>
                </button>
                <button
                  disabled={this.disableActionButtons(PAUSED)}
                  className="actions_cover-item pause"
                  onClick={() => this.updateCampaignStatus(PAUSED)}
                >
                  <span>Pause</span>
                </button>
                <button
                  className="actions_cover-item remove"
                  onClick={this.deleteCampaigns}
                >
                  <span>Remove</span>
                </button>
              </div>
              <AgGridReact
                columnDefs={this.state.columnDefs}
                rowData={
                  this.state.filteredCampaignsList ===
                  "INITIAL_FILTERED_CAMPAIGNS"
                    ? []
                    : this.state.filteredCampaignsList
                }
                gridOptions={this.state.gridOptions}
                enableSorting={true}
                enableFilter={true}
                enableColResize={true}
                resizable={true}
                animateRows={true}
                pagination={true}
                paginationNumberFormatter={this.state.paginationNumberFormatter}
              />
              {/* <PaginationContainer
                changeState={this.changeState}
                setOffsetPagination={this.setOffsetPagination}
                {...this.state}
                page={"campaigns"}
                count={this.props.count}
                {...this.props}
                gridApi={this.gridApi}
              /> */}
            </div>
            </PendingContainer>
          </div>
        </div>
      </Fragment>
    );
  }
}

class RenderEditor extends Component {
  constructor(props) {
    super(props);
    this.onEdit = this.onEdit.bind(this);
  }

  onEdit() {
    const {
      data: { campaign },
      history,
    } = this.props;
    const url = `/campaigns/${campaign.id}/edit`;
    history.push(url);
  }

  render() {
    return (
      <div className="icon_cover">
        <span className="editor-control" onClick={this.onEdit}>
          {" "}
          <SvgEdit />
        </span>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  campaigns: state.campaigns,
  countries: state.countries,
  auth: state.auth,
  users: state.users.advertisers,
  publishers: state.users.publishers,
  count: state.campaignsStatistics.campaignsStatisticsList
    ? state.campaignsStatistics.campaignsStatisticsList.length
    : 0,
  campaignsStatistics: state.campaignsStatistics,
  tagsList: state.campaigns.tagsList,
  limit: state.pagination.limit,
  offset: state.pagination.offset,
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(
    {
      getCountCampaigns,
      deleteCampaigns,
      loadAdvertisers,
      loadCampaignsStatistics,
      updateCampaignStatus,
      loadCampaignTagsList,
      loadCampaigns,
      changePaginationData,
      getCountCampaigns,
    },
    dispatch
  ),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(
  reduxForm({
    form: "CampaignsListPage",
  })(CampaignsListPage)
);
