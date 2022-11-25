import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { Link } from "react-router-dom";
import { confirmAlert } from "react-confirm-alert";
import PropTypes from "prop-types";
import Select from "react-select";
import connect from "react-redux/es/connect/connect";
import classNames from "classnames";
import moment from "moment";
// AgGrid imports
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-balham.css";
// Actions
import { signInAs } from "../../actions/auth";
import {
  changePaginationData,
  setFormStateValueToEdit,
} from "../../actions/app";
import { loadCampaigns } from "../../actions/campaigns&budgets";
import {
  loadAdvertisers,
  deleteAdvertiser,
  updateAdvertiserStatus,
} from "../../actions/users";
// Constants & Utils
import { ACTIVE, NEW } from "../../constants/campaigns";
import { PAUSED, REMOVED, PENDING, OWNER, ADMIN } from "../../constants/user";
import onOutsideElementClick from "../../utils/onOutsideElementClick";
import { ADVERTISERS_COLUMN_DEFS } from "../../utils/agGrid/columnDefs/advertisers";
import localization from "../../localization";
// UI components
import PaginationContainer from "../UI/ShowLinesDropdown";
import CustomConfirm from "../common/Views/Confirm";
import { SvgEdit, SvgSearch } from "../common/Icons";
import DisplayCheck from "../../permissions";
import ExtraDatePicker from "../UI/ExtraDatePicker/ExtraDatePicker";
import TopBar from "../common/TopBar/TopBar";
import { styles } from "../UI/selectStyles";
import { filter } from "rxjs";
import PendingContainer from '../UI/PendingContainer2'

class AdvertisersPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      columnDefs: [],
      advertisers: [],
      filteredAdvertisersList: "INITIAL_FILTERED_ADVERTISERS",
      pageCount: 1,
      gridOptions: {
        rowHeight: 52,
        paginationNumberFormatter: function (params) {
          return params.value.toLocaleString();
        },
        resizable: true,
        rowData: null,
        suppressRowClickSelection: false,
        domLayout: "autoHeight",
        onGridReady: (params) => {
          this.gridApi = params.api;
        },
        rowSelection: "multiple",
        frameworkComponents: {
          countryRenderer: this.countryRenderer.bind(this),
          statusRenderer: this.statusRenderer.bind(this),
          advPubRenderer: this.advPubRenderer.bind(this),
          balanceRenderer: this.balanceRenderer.bind(this),
          dateCellRenderer: this.dateCellRenderer.bind(this),
          customToFixed: ({ value }) => <div>$ {value}</div>,
          renderEditor: (props) => <RenderEditor {...this.props} {...props} />,
        },
        onSelectionChanged: this.onSelectionChanged.bind(this),
        onFirstDataRendered: (params) => {
          params.api.sizeColumnsToFit();
        },
        suppressDragLeaveHidesColumns: true,
      },
      filters: {
        selectedAdvertiserName: null,
        selectedCompanyName: null,
        selectStatusData: [
          { label: "-", value: null },
          { label: "Active", value: ACTIVE },
          { label: "Pending", value: PENDING },
          { label: "Paused", value: PAUSED },
          { label: "Removed", value: REMOVED },
        ],
        selectedCountry: null,
        selectedManager: null,
        selectedStatus: null,
        selectAdvertiserNameData: [],
        selectCompanyData: [],
        selectCountryData: [],
        selectManagerData: [],
        // startDate: moment().startOf("month").format("YYYY-MM-DD"),
        // endDate: moment().format("YYYY-MM-DD"),
        startDate: null,
        endDate: null,
      },
      rowSelected: false,
      showActionsDropdown: false,
      showActions: false,
      linesLabel: 100,
    };

    this.onSearchInputChange = this.onSearchInputChange.bind(this);
    this.submitFilter = this.submitFilter.bind(this);
    this.toggleActionsDropdown = this.toggleActionsDropdown.bind(this);
    this.deleteAdvertisers = this.deleteAdvertisers.bind(this);
    this.updateAdvertiserStatus = this.updateAdvertiserStatus.bind(this);
    this.toggleDropdown = this.toggleDropdown.bind(this);
    this.onSelectClose = this.onSelectClose.bind(this);
    this.setOffsetPagination = this.setOffsetPagination.bind(this);
    this.confirmDeleteAdvertiser = this.confirmDeleteAdvertiser.bind(this);
    this.changeState = this.changeState.bind(this);
    this.onSelectTimeChange = this.onSelectTimeChange.bind(this);
    this.disableActionButtons = this.disableActionButtons.bind(this);
  }

  render() {
    const {
      filters: { selectStatusData },
      filters,
    } = this.state;
    const { pending, active, paused } = this.props;
    return (
      <div className="advertisers-page">
        <TopBar title={localization.header.nav.advertisers} subtitle="Today" />
        <div className="stats users">
          <div className="statistic_item card card_body">
            <div className="value_cover">
              <span className="icon active" />
              <div>
                <span className="statistic_item-title">
                  {localization.status.pending}
                </span>
                <span className="statistic_item-value">{pending}</span>
              </div>
            </div>
            {/* <span className="growth default">0%</span>*/}
          </div>
          <div className="statistic_item card card_body">
            <div className="value_cover">
              <span className="icon new" />
              <div>
                <span className="statistic_item-title">
                  {localization.status.active}
                </span>
                <span className="statistic_item-value">{active}</span>
              </div>
            </div>
            {/* <span className="growth ">0%</span>*/}
          </div>
          <div className="statistic_item card card_body">
            <div className="value_cover">
              <span className="icon paused" />
              <div>
                <span className="statistic_item-title">
                  {localization.status.paused}
                </span>
                <span className="statistic_item-value">{paused}</span>
              </div>
            </div>
            {/* <span className="growth ">0%</span>*/}
          </div>
        </div>
        <div className="card">
          <form className="form_cover">
            <div className="search_cover">
              <span className="icon" title="">
                <SvgSearch />
              </span>
              <input
                onChange={this.onSearchInputChange}
                type="text"
                className=""
                placeholder={localization.advertisers.filters.search}
                autoComplete="off"
              />
            </div>

            <DisplayCheck roles={[OWNER, ADMIN]}>
              <div className="form-control">
                <Select
                  className="filter-form__select "
                  placeholder={localization.advertisers.filters.manager}
                  options={filters.selectManagerData}
                  value={filters.selectedManager}
                  onChange={(e) => this.onSelectChange("selectedManager", e)}
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
                className="filter-form__select "
                placeholder={localization.advertisers.filters.status}
                options={selectStatusData}
                value={filters.selectedStatus}
                onChange={(e) => this.onSelectChange("selectedStatus", e)}
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
                className="filter-form__select"
                placeholder={localization.advertisers.filters.country}
                options={filters.selectCountryData}
                value={filters.selectedCountry}
                onChange={(e) => this.onSelectChange("selectedCountry", e)}
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
                filters.startDate
                  ? filters.startDate
                  : moment().startOf("month").format("YYYY-MM-DD")
              }
              endDate={
                filters.endDate
                  ? filters.endDate
                  : moment().format("YYYY-MM-DD")
              }
              showRanges={true}
              onSelectTimeChange={this.onSelectTimeChange}
            />
            <button
              onClick={this.submitFilter}
              type="submit"
              className="btn sign-blue apply"
            >
              <span className="btn_text">
                {localization.forms.applyFilters}
              </span>
            </button>
            <button
              onClick={() => this.props.history.push(`/advertisers/create`)}
              type="submit"
              className="btn neutral add"
            >
              {localization.forms.addNew}
            </button>
          </form>
          <PendingContainer isPending={this.props.campaigns.isRequestPending}>
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
                onClick={() => this.updateAdvertiserStatus(ACTIVE)}
              >
                <span>Activate</span>
              </button>
              <button
                disabled={this.disableActionButtons(PAUSED)}
                className="actions_cover-item pause"
                onClick={() => this.updateAdvertiserStatus(PAUSED)}
              >
                <span>Pause</span>
              </button>
              <button
                className="actions_cover-item remove"
                onClick={this.deleteAdvertisers}
              >
                <span>Remove</span>
              </button>
            </div>
            <div>
              <AgGridReact
                columnDefs={this.state.columnDefs}
                rowData={this.state.advertisers}
                gridOptions={this.state.gridOptions}
                enableSorting
                enableFilter
                enableColResize
                resizable
                animateRows
                pagination={true}
                paginationNumberFormatter={this.state.paginationNumberFormatter}
              ></AgGridReact>
              {/* <PaginationContainer
                changeState={this.changeState}
                setOffsetPagination={this.setOffsetPagination}
                {...this.state}
                page={"advertiser"}
                count={this.props.count}
                {...this.props}
                gridApi={this.gridApi}
              /> */}
            </div>
          </div>
          </PendingContainer>
        </div>
      </div>
    );
  }

  disableActionButtons(status){
    let statusArr = [];
    if(this.gridApi){
        this.gridApi.getSelectedRows().forEach(item => {
          if(!statusArr.includes(item.status)){
            statusArr.push(item.status);
          }
        });
        if(statusArr.length > 1) return false;
        if(statusArr.includes(status)) return true;
        if(((statusArr && statusArr[0]) === "PENDING" || (statusArr && statusArr[0]) === "SUSPENDED" || (statusArr && statusArr[0]) === "PAUSED") && status === "PAUSED") return true;
    }
    return false;
  }

  async setOffsetPagination({ selected }) {
    const { filters } = this.state;
    const { limit, actions } = this.props;
    const offset = selected * limit;
    const advertisers = await actions.loadAdvertisers({
      limit,
      offset,
      ...filters,
    });
    this.setState({ advertisers });
    actions.changePaginationData(limit, offset);
  }

  changeState(state, value) {
    this.setState({
      [state]: value,
    });
  }

  onSelectTimeChange(date, type) {
    if (this.state.filters.startDate === null) {
      if (type === "endDate") {
        this.setState({
          filters: {
            startDate: moment().startOf("month").format("YYYY-MM-DD"),
          },
        });
      }
    }
    if (this.state.filters.endDate === null) {
      if (type === "startDate") {
        this.setState({
          filters: {
            endDate: moment().format("YYYY-MM-DD"),
          },
        });
      }
    }
    this.setState((prevState) => ({
      rowSelected: false,
      filters: {
        ...prevState.filters,
        [type]: date.format("YYYY-MM-DD"),
      },
    }));
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.users.length) {
      const selectAdvertiserNameData = nextProps.users.map((advertiser) => ({
        value: advertiser.id,
        label: advertiser.companyName || advertiser.name,
      }));
      const selectCompanyData = nextProps.users
        .filter((item) => item.companyName)
        .map((advertiser) => ({
          value: advertiser.id,
          label: advertiser.companyName,
        }));

      const selectManagerData = nextProps.managers
        .filter((manager) => manager.id)
        .map((accountManager) => {
          return {
            value: accountManager.id,
            label: accountManager.name,
          };
        });
      const selectCountryData = nextProps.countries.countriesList.map(
        (country) => ({
          value: country.alpha2Code,
          label: country.name,
        })
      );

      const { currentUser } = nextProps.auth;

      const toSet = {
        columnDefs: ADVERTISERS_COLUMN_DEFS[currentUser.role],
        filters: {
          ...prevState.filters,
          selectAdvertiserNameData: [
            { label: "-", value: null },
            ...selectAdvertiserNameData,
          ],
          selectCompanyData: [
            { label: "-", value: null },
            ...selectCompanyData,
          ],
          selectCountryData: [
            { label: "-", value: null },
            ...selectCountryData,
          ],
          selectManagerData: [
            { label: "-", value: null },
            ...selectManagerData,
          ],
        },
      };

      if (
        prevState.filteredAdvertisersList === "INITIAL_FILTERED_ADVERTISERS"
      ) {
        toSet.filteredAdvertisersList = nextProps.users.map((advertiser) => {
          return {
            ...advertiser,
            offersCount: nextProps.campaigns.campaignsList.filter(
              (campaign) => campaign.userId === advertiser.id
            ).length,
          };
        });
      }

      return toSet;
    } else {
      return null;
    }
  }

  toggleDropdown(name) {
    this.setState((prevState) => ({
      [name]: !prevState[name],
    }));
  }

  onSelectClose(element) {
    setTimeout(() => {
      this.setState({
        [element]: false,
      });
    }, 300);
  }

  toggleActionsDropdown() {
    this.setState((prevState) => ({
      showActionsDropdown: !prevState.showActionsDropdown,
    }));
  }

  onSelectChange(attribute, filter) {
    this.setState((prevState) => ({
      rowSelected: false,
      filters: {
        ...prevState.filters,
        [attribute]: filter.value ? filter : null,
      },
    }));
  }

  onSelectionChanged(event) {
    const rowCount = event.api.getSelectedNodes().length;
    this.setState({
      rowSelected: rowCount > 0,
      showActions: rowCount !== 0,
    });
  }

  deleteAdvertisers() {
    const count = this.gridApi.getSelectedRows().length;
    let deleteAdvertiserSingle;
    let deleteAdvertiserMulti;
    if (count > 1) {
      const advers = this.gridApi.getSelectedRows();
      const str = advers.map((el) => `(${el.id}) ${el.name}`).join(", ");
      deleteAdvertiserMulti = `Are you sure you want to delete Adveriser “${str}”. All Campaigns associated with it will be deleted as well`;
    } else {
      const adver = this.gridApi.getSelectedRows()[0];
      deleteAdvertiserSingle = `Are you sure you want to delete Adveriser “(${adver.id}) ${adver.name}”. All Campaigns associated with it will be deleted as well`;
    }

    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <CustomConfirm
            onConfirm={this.confirmDeleteAdvertiser}
            onClose={onClose}
            msg={count > 1 ? deleteAdvertiserMulti : deleteAdvertiserSingle}
          />
        );
      },
    });
  }

  confirmDeleteAdvertiser() {
    const advertisersIds = this.gridApi
      .getSelectedRows()
      .map((advertiser) => advertiser.id);
    this.props.actions.deleteAdvertiser({ ids: advertisersIds });
    this.toggleActionsDropdown();
    this.setState({
      rowSelected: false,
      showActions: false,
    });
  }

  async updateAdvertiserStatus(status) {
    const { limit, offset } = this.props;
    const advertisersIds = this.gridApi
      .getSelectedRows()
      .map((advertiser) => advertiser.id);
    await this.props.actions.updateAdvertiserStatus({
      ids: advertisersIds,
      status,
    });
    const advertisers = await this.props.actions.loadAdvertisers({
      limit,
      offset,
      ...this.state.filters,
    });
    this.setState({ advertisers });
    this.toggleActionsDropdown();
    this.setState({
      rowSelected: false,
      showActions: false,
    });
  }

  async componentDidUpdate(prevProps, prevState) {
    const { count, limit, offset } = this.props;
    if (count !== prevProps.count) {
      this.setState({
        pageCount: count / limit || 2,
      });
    }

    if (this.props.users !== prevProps.users) {
      this.setState({ advertisers: this.props.users });
    }

    if (limit !== prevProps.limit) {
      this.setState({
        pageCount: count / limit || 1,
      });

      const advertisers = await this.props.actions.loadAdvertisers({
        limit,
        offset,
        ...this.state.filters,
      });
      this.setState({ advertisers });
    }
  }

  async componentDidMount() {
    this.props.actions.loadCampaigns();
    const advertisers = await this.props.actions.loadAdvertisers({
      limit: 100,
      offset: 0,
      ...this.state.filters,
    });

    this.setState({
      advertisers,
    });

    onOutsideElementClick(this.actionsDropdown, () => {
      if (this.state.showActionsDropdown) {
        this.setState({
          showActionsDropdown: false,
        });
      }
    });
  }

  onSearchInputChange(e) {
    this.gridApi.setQuickFilter(e.target.value);
    this.gridApi.deselectAll();
    this.setState({
      rowSelected: false,
    });
  }

  dateCellRenderer({ value }) {
    return <span>{moment(value).format(`YYYY-MM-DD`)}</span>;
  }

  async submitFilter(e) {
    e && e.preventDefault();
    const { filters } = this.state;
    const { limit, offset } = this.props;
    const advertisers = await this.props.actions.loadAdvertisers({
      limit,
      offset,
      ...filters,
    });
    this.setState({ advertisers });
  }

  countryRenderer(params) {
    const country = this.props.countries.countriesList.find(
      (country) => country.alpha2Code === params.value
    );
    return country ? country.name : params.value ? params.value : "";
  }

  advPubRenderer(params) {
    const { actions } = this.props;
    return (
      <Link
        to={`/advertisers/${params.node.data.id}/edit`}
        className="adv-pub-name"
        onClick={actions.setFormStateValueToEdit}
      >
        {params.node.data.name}
      </Link>
    );
  }

  balanceRenderer(params) {
    return <span className="item">$ {params.node.data.balance}</span>;
  }

  statusRenderer(params) {
    return (
      <span className={`status ${params.value.toLowerCase()}`}>
        {params.value.replace(/_/g, " ").toLowerCase()}
      </span>
    );
  }
}

class RenderEditor extends Component {
  constructor(props) {
    super(props);
    this.onSignInAs = this.onSignInAs.bind(this);
    this.onEdit = this.onEdit.bind(this);
    this.onConfirmDeletion = this.onConfirmDeletion.bind(this);
  }

  onOpenConfirmationDialog(onConfirmAction, title) {
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <CustomConfirm
            onConfirm={onConfirmAction}
            onClose={onClose}
            msg={title}
          />
        );
      },
    });
  }

  onSignInAs() {
    const currentUser = this.props.auth.currentUser;
    const userAccount = this.props.data;
    const { history } = this.props;
    if (userAccount.status !== REMOVED) {
      this.props.actions.signInAs(currentUser, userAccount, history);
    }
  }

  onConfirmDeletion() {
    const { data } = this.props;
    const obj = {};
    obj.ids = [data.id];
    this.props.actions.deleteAdvertiser(obj);
  }

  onEdit() {
    const { data, history, actions } = this.props;
    actions.setFormStateValueToEdit();
    history.push(`/advertisers/${data.id}/edit`);
  }

  render() {
    const user = this.props.data;
    return (
      <div className="icon_cover">
        <span
          className={classNames("btn sign-blue", {
            disabled: user.status === REMOVED,
          })}
          onClick={(e) =>
            this.onOpenConfirmationDialog(
              this.onSignInAs,
              localization.formatString(
                localization.confirm.signInAs,
                user.name
              )
            )
          }
        >
          {localization.forms.signIn}
        </span>
        <span className="editor-control" onClick={this.onEdit}>
          <SvgEdit />
        </span>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  users: state.users.advertisers,
  managers: state.users.managers,
  campaigns: state.campaigns,
  countries: state.countries,
  count: state.users.advertisersCount,
  limit: state.pagination.limit,
  offset: state.pagination.offset,
  active: state.users.advertiserActive,
  pending: state.users.advertiserPending,
  paused: state.users.advertiserPaused,
});
const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(
    {
      setFormStateValueToEdit,
      loadAdvertisers,
      loadCampaigns,
      deleteAdvertiser,
      updateAdvertiserStatus,
      changePaginationData,
      signInAs,
    },
    dispatch
  ),
});

AdvertisersPage.propTypes = {
  actions: PropTypes.object,
  auth: PropTypes.object,
  campaigns: PropTypes.object,
  countries: PropTypes.object,
};

export default connect(mapStateToProps, mapDispatchToProps)(AdvertisersPage);
