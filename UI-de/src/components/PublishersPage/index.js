import React, { Component } from "react";
import Select from "react-select";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { AgGridReact } from "ag-grid-react";
import moment from "moment";
import {
  ADMIN,
  REJECTED,
  MEDIA_BUYING_TEAM,
  AD_NETWORK,
  AFFILIATE_NETWORK,
  AD_AGENCY,
  ACTIVE,
  PENDING,
  REMOVED,
  PAUSED,
  OWNER,
  ACCOUNT_MANAGER,
} from "../../constants/user";
import {
  loadPublishers,
  updatePublisherStatus,
  deletePublisher,
  clearPublishers,
} from "../../actions/users";
import { loadBillingDetails } from "../../actions/billingDetails";
import "react-notifications/lib/notifications.css";
import classNames from "classnames";
import onOutsideElementClick from "../../utils/onOutsideElementClick";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-balham.css";
import { Link } from "react-router-dom";
import customToFixed from "../../utils/agGrid/renderers/customToFixed";
import customNumberFormat from "../../utils/agGrid/renderers/customNumberFormat";
// import dateCellRenderer from '../../utils/agGrid/renderers/dateCellRenderer';
import localization from "../../localization";
import { confirmAlert } from "react-confirm-alert";
import CustomConfirm from "../common/Views/Confirm";
import { SvgEdit, SvgSearch } from "../common/Icons";
import { signInAs } from "../../actions/auth";
import columnDefs from "../../utils/agGrid/columnDefs/publishers";
import PaginationContainer from "../UI/ShowLinesDropdown";
import "react-confirm-alert/src/react-confirm-alert.css";
import DisplayCheck from "../../permissions";
import amountCellRenderer from "../../utils/agGrid/renderers/amountCellRenderer";
import { changePaginationData } from "../../actions/app";
import { selectAdType, selectInventoryType } from "../../constants/common";
import { ALL } from "../../constants/campaigns";
import ExtraDatePicker from "../UI/ExtraDatePicker/ExtraDatePicker";
import axios from "axios";
import PopupRtbData from "../common/PopupRtbData";
import TopBar from "../common/TopBar/TopBar";
import { styles } from "../UI/selectStyles";
import PendingContainer from "../UI/PendingContainer2";

class PublishersPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columnDefs: [],
      publishers: [],
      filteredPublishersList: "INITIAL_FILTERED_PUBLISHERS",
      gridOptions: {
        rowHeight: 52,
        paginationNumberFormatter: function (params) {
          return params.value.toLocaleString();
        },
        suppressRowClickSelection: false,
        domLayout: "autoHeight",
        onGridReady: (params) => {
          this.gridApi = params.api;
        },
        rowSelection: "multiple",
        frameworkComponents: {
          descriptionRenderer: this.descriptionRenderer.bind(this),
          statusRenderer: this.statusRenderer.bind(this),
          channelRenderer: this.channelRenderer.bind(this),
          dateCellRenderer: this.dateCellRenderer.bind(this),
          advPubRenderer: this.advPubRenderer.bind(this),
          amountCellRenderer,
          customToFixed,
          customNumberFormat,
          renderEditor: (props) => (
            <RenderEditor
              {...this.props}
              {...props}
              showRtbData={this.openDetailsModal}
            />
          ),
        },
        onSelectionChanged: this.onSelectionChanged.bind(this),
        onFirstDataRendered: (params) => {
          params.api.sizeColumnsToFit();
        },
        suppressDragLeaveHidesColumns: true,
      },
      defaultColDef: { sortable: true },
      filters: {
        startDate: null,
        endDate: null,
        selectPublisherData: [],
        selectTypeData: [
          { label: "-", value: null },
          { label: "All", value: ALL },
          { label: "Banner", value: "BANNER" },
          { label: "Pop", value: "POP" },
          { label: "Video", value: "VIDEO" },
          { label: "Push", value: "PUSH" },
          { label: "Native", value: "NATIVE" },
        ],
        selectStatusData: [
          { label: "-", value: null },
          { label: "Active", value: ACTIVE },
          { label: "Pending", value: PENDING },
          { label: "Paused", value: PAUSED },
          { label: "Rejected", value: REJECTED },
          { label: "Removed", value: REMOVED },
        ],
        selectOrderTypeData: [
          { label: "-", value: null },
          { label: "Asc", value: "ASC" },
          { label: "Desc", value: "DESC" },
        ],
        selectUserData: [],
        selectedTypeName: null,
        selectedProtocol: null,
        selectedInventory: null,
        channel: "",
        deviceType: "",
        connectionType: "null",
      },
      summary: {
        pending: null,
        active: null,
        paused: null,
      },
      reportingFrom: moment().startOf("day").subtract(30, "day").format(),
      reportingLabel: "Last 30 days",
      showActionsDropdown: false,
      rowSelected: false,
      showActions: false,
      showReportingDropdown: false,
      pageCount: 0,
      isOpenModal: false,
    };

    this.toggleActionsDropdown = this.toggleActionsDropdown.bind(this);
    this.toggleReportingDropdown = this.toggleReportingDropdown.bind(this);
    this.onSearchInputChange = this.onSearchInputChange.bind(this);
    this.onSelectOrderTypeChange = this.onSelectOrderTypeChange.bind(this);
    this.updatePublishersStatus = this.updatePublishersStatus.bind(this);
    this.deletePublishers = this.deletePublishers.bind(this);
    this.submitFilter = this.submitFilter.bind(this);
    this.setOffsetPagination = this.setOffsetPagination.bind(this);
    this.changeState = this.changeState.bind(this);
    this.onSelectTimeChange = this.onSelectTimeChange.bind(this);
    this.onCloseModal = this.onCloseModal.bind(this);
    this.openDetailsModal = this.openDetailsModal.bind(this);
    this.refreshBidreqFormat = this.refreshBidreqFormat.bind(this);
    this.disableActionButtons = this.disableActionButtons.bind(this);
  }

  async componentDidUpdate(prevProps, prevState) {
    const { count, limit, offset } = this.props;
    const { filters } = this.state;
    if (count !== prevProps.count) {
      this.setState({
        pageCount: count / limit || 1,
      });
    }

    if (this.props.users !== prevProps.users) {
      this.setState({ publishers: this.props.users });
    }

    if (limit !== prevProps.limit) {
      this.setState({
        pageCount: count / limit || 1,
      });

      const publishers = await this.props.actions.loadPublishers({
        limit,
        offset,
        ...filters,
      });
      this.setState({ publishers });
    }
  }

  async componentDidMount() {
    const { filters } = this.state;
    const { count, limit } = this.props;
    this.props.actions.loadBillingDetails();
    await this.props.actions.clearPublishers();
    const publishers = await this.props.actions.loadPublishers({
      limit: 100,
      offset: 0,
      ...filters,
    });
    this.setState({ publishers });
    // document
    //   .querySelector(".pagination-container")
    //   .children[1].children[0].click();
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

  static getDerivedStateFromProps(nextProps, prevState) {
    const {
      auth: { currentUser },
      users,
    } = nextProps;
    if (
      nextProps.auth.currentUser.role &&
      users &&
      users.length &&
      (nextProps.auth.currentUser.role === ADMIN
        ? nextProps.users.length
        : true)
    ) {
      const constantsToSelectData = (constants) =>
        constants.map((constant) => ({
          value: constant,
          label: constant.replace(/_/g, " ").toLowerCase(),
        }));

      const publishers = nextProps.users;

      const selectPublisherData = publishers.map((publisher) => ({
        value: publisher.id,
        label: publisher.name,
      }));
      const selectManagerData = nextProps.managers
        .filter((manager) => manager.id)
        .map((accountManager) => {
          return {
            value: accountManager.id,
            label: accountManager.name,
          };
        });
      const toSet = {
        columnDefs: [OWNER, ADMIN].includes(currentUser.role)
          ? columnDefs[ADMIN]
          : columnDefs[ACCOUNT_MANAGER],
        filters: {
          ...prevState.filters,
          selectPublisherData: [
            { label: "-", value: null },
            ...selectPublisherData,
          ],
          selectDescriptionData: [
            { label: "-", value: null },
            ...constantsToSelectData([
              MEDIA_BUYING_TEAM,
              AD_NETWORK,
              AFFILIATE_NETWORK,
              AD_AGENCY,
            ]),
          ],
          selectManagerData: [
            { label: "-", value: null },
            ...selectManagerData,
          ],
        },
      };

      if (prevState.filteredPublishersList === "INITIAL_FILTERED_PUBLISHERS") {
        toSet.filteredPublishersList = publishers.map((publisher) => ({
          ...publisher,
          ...nextProps.publishersStatistics.publishersStatisticsList.find(
            (stats) => stats.publisherId === publisher.id
          ),
        }));
      }
      return toSet;
    } else {
      return null;
    }
  }

  async setOffsetPagination({ selected }) {
    const { filters } = this.state;
    const { limit, actions } = this.props;
    const offset = selected * limit;
    this.setState({ offset });
    const publishers = await this.props.actions.loadPublishers({
      limit,
      offset,
      ...filters,
    });
    this.setState({ publishers });
    actions.changePaginationData(limit, offset);
  }

  changeState(state, value) {
    this.setState({
      [state]: value,
    });
  }

  async openDetailsModal(pid) {
    const { data } = await axios.get(`/publishers/publisher-rtb/${pid}`);
    this.setState({
      isOpenModal: true,
      selectedPublisher: pid,
      rtbData: data,
    });
  }

  async refreshBidreqFormat() {
    const { selectedPublisher } = this.state;
    this.setState({ getBidreqPending: true });

    const { data } = await axios.get(`/publisher-bidreq/${selectedPublisher}`);
    this.setState({
      rtbData: data,
      getBidreqPending: false,
    });
  }

  onCloseModal() {
    this.setState({
      isOpenModal: false,
    });
  }

  dateCellRenderer({ value }) {
    return <span>{moment(value).format(`YYYY-MM-DD`)}</span>;
  }

  channelRenderer(params) {
    const valueFormatted =
      (params.valueFormatted && params.valueFormatted.toLowerCase()) || "";
    return (
      <span className={`channel  ${valueFormatted}`}>{valueFormatted}</span>
    );
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

  async submitFilter(e) {
    e && e.preventDefault();
    const { filters } = this.state;
    const { limit, offset } = this.props;
    const publishers = await this.props.actions.loadPublishers({
      limit,
      offset,
      ...filters,
    });
    this.setState({ publishers });
    document
      .querySelector(".pagination-container")
      .children[1].children[0].click();
  }

  toggleActionsDropdown() {
    this.setState((prevState) => ({
      showActionsDropdown: !prevState.showActionsDropdown,
    }));
  }

  toggleReportingDropdown() {
    this.setState((prevState) => ({
      showReportingDropdown: !prevState.showReportingDropdown,
    }));
  }

  onSearchInputChange(e) {
    this.gridApi.setQuickFilter(e.target.value);
    this.gridApi.deselectAll();
    this.setState({
      rowSelected: false,
    });
  }

  onSelectOrderTypeChange(selectedOrderType) {
    this.setState((prevState) => ({
      filters: {
        ...prevState.filters,
        selectedOrderType: selectedOrderType.value ? selectedOrderType : null,
      },
    }));
  }

  deletePublishers() {
    const publishersIds = this.gridApi
      .getSelectedRows()
      .map((publisher) => publisher.id);
    this.props.actions.deletePublisher({ ids: publishersIds });
    this.toggleActionsDropdown();
    this.setState({
      rowSelected: false,
      showActions: false,
    });
  }

  async updatePublishersStatus(status) {
    const { limit, offset } = this.props;
    const { filters } = this.state;
    const publishersIds = this.gridApi
      .getSelectedRows()
      .map((publisher) => publisher.id);
    await this.props.actions.updatePublisherStatus({
      ids: publishersIds,
      status,
    });
    this.props.actions.loadPublishers({ limit, offset, ...filters });
    this.toggleActionsDropdown();
    this.setState({
      rowSelected: false,
      showActions: false,
    });
  }

  descriptionRenderer(params) {
    return (
      <span className="capitalize">
        {params.value ? params.value.replace(/_/g, " ").toLowerCase() : ""}
      </span>
    );
  }

  statusRenderer(params) {
    return (
      <span className={`status ${params.value.toLowerCase()}`}>
        {params.value.replace(/_/g, " ").toLowerCase()}
      </span>
    );
  }

  advPubRenderer(params) {
    return (
      <Link
        to={`/publishers/${params.node.data.id}/edit`}
        className="adv-pub-name"
      >
        {params.node.data.name}
      </Link>
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
    }
    return false;
  }

  render() {
    const {
      selectTypeData,
      selectedTypeName,
      selectStatusData,
      selectedStatus,
      startDate,
      endDate,
      selectedInventory,
    } = this.state.filters;
    const { pending, active, paused, auth } = this.props;
    const { isOpenModal, selectedPublisher, rtbData, getBidreqPending } =
      this.state;
    return (
      <div className="publishers-page">
        <TopBar title={localization.header.nav.publishers} subtitle="Today" />
        <div className="stats users">
          <div className="statistic_item card card_body">
            <div className="value_cover">
              <span className="icon pending" />
              <div>
                <span className="statistic_item-title">
                  {localization.status.pending}
                </span>
                <span className="statistic_item-value">{pending || 0}</span>
              </div>
            </div>
            {/* <span className="growth positive">+22.8%</span>*/}
          </div>
          <div className="statistic_item card card_body">
            <div className="value_cover">
              <span className="icon new" />
              <div>
                <span className="statistic_item-title">
                  {localization.status.active}
                </span>
                <span className="statistic_item-value">{active || 0}</span>
              </div>
            </div>
            {/* <span className="growth positive">+11.7%</span>*/}
          </div>
          <div className="statistic_item card card_body">
            <div className="value_cover">
              <span className="icon paused" />
              <div>
                <span className="statistic_item-title">
                  {localization.status.paused}
                </span>
                <span className="statistic_item-value">{paused || 0}</span>
              </div>
            </div>
            {/* <span className="growth negative">-0.25%</span>*/}
          </div>
        </div>
        <div className="card">
          <div>
            <form className="form_cover">
              <div className="search_cover">
                <span className="icon" title="">
                  <SvgSearch />
                </span>
                <input
                  onChange={this.onSearchInputChange}
                  type="text"
                  className=""
                  placeholder={localization.forms.search}
                  autoComplete="off"
                />
              </div>
              <div className="form-control">
                <div className="search__input">
                  <Select
                    className="filter-form__select filter-form__select--under"
                    placeholder={localization.publishers.filters.type}
                    options={selectAdType}
                    value={selectedTypeName}
                    onChange={(e) => this.onSelectChange("selectedTypeName", e)}
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
              <div className="form-control">
                <div className="search">
                  <Select
                    className="filter-form__select filter-form__select--under capitalize"
                    placeholder={localization.publishers.filters.status}
                    options={selectStatusData}
                    value={selectedStatus}
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
              </div>
              <div className="form-control">
                <Select
                  className="filter-form__select filter-form__select--disabled"
                  placeholder="Inventory"
                  options={selectInventoryType}
                  value={selectedInventory}
                  onChange={(e) => this.onSelectChange("selectedInventory", e)}
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
                  startDate
                    ? startDate
                    : moment().startOf("month").format("YYYY-MM-DD")
                }
                endDate={endDate ? endDate : moment().format("YYYY-MM-DD")}
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
                onClick={() => this.props.history.push(`/publishers/create`)}
                type="submit"
                className="btn neutral add"
              >
                <span className="btn_text">{localization.forms.addNew}</span>
              </button>
            </form>
          </div>
          <PendingContainer isPending={this.props.billingDetails.isRequestPending}>
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
                onClick={() => this.updatePublishersStatus(ACTIVE)}
              >
                <span>Activate</span>
              </button>

              <button
                disabled={this.disableActionButtons(PAUSED)}
                className="actions_cover-item pause"
                onClick={() => this.updatePublishersStatus(PAUSED)}
              >
                <span>Pause</span>
              </button>
              <button
                className="actions_cover-item remove"
                onClick={this.deletePublishers}
              >
                <span>Remove</span>
              </button>
            </div>
            <AgGridReact
              columnDefs={this.state.columnDefs}
              rowData={this.state.publishers}
              gridOptions={this.state.gridOptions}
              enableSorting={true}
              enableFilter={true}
              groupSelectsChildren={false}
              suppressRowClickSelection={true}
              enableColResize={true}
              resizable={true}
              animateRows={true}
              pagination={true}
              paginationNumberFormatter={this.state.paginationNumberFormatter}
            ></AgGridReact>
            {/* <PaginationContainer
              changeState={this.changeState}
              setOffsetPagination={this.setOffsetPagination}
              {...this.state}
              page={"publisher"}
              count={this.props.count}
              {...this.props}
              gridApi={this.gridApi}
            /> */}
          </div>
          </PendingContainer>
        </div>
        <PopupRtbData
          isOpenModal={isOpenModal}
          onCloseModal={this.onCloseModal}
          entity="publisher"
          entityId={selectedPublisher}
          rtbData={rtbData}
          refreshBidreqFormat={this.refreshBidreqFormat}
          pending={getBidreqPending}
          auth={auth}
        />
      </div>
    );
  }
}

export class RenderEditor extends Component {
  constructor(props) {
    super(props);
    this.onEdit = this.onEdit.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.submit = this.submit.bind(this);
    this.onSignInAs = this.onSignInAs.bind(this);
    this.onOpenRtbFormat = this.onOpenRtbFormat.bind(this);
  }

  submit() {
    const { data } = this.props;
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <CustomConfirm
            onConfirm={this.onDelete}
            onClose={onClose}
            msg={localization.formatString(
              localization.confirm.deactivateUser,
              data.name
            )}
          />
        );
      },
    });
  }

  onDelete() {
    const { data } = this.props;
    const obj = {};
    obj.ids = [data.id];
    this.props.actions.deletePublisher(obj);
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

  onEdit() {
    const { data, history, auth } = this.props;
    history.push(`/publishers/${data.id}/edit`);
  }

  onSignInAs() {
    const currentUser = this.props.auth.currentUser;
    const userAccount = this.props.data;
    const { actions, history } = this.props;
    if (userAccount.status !== REMOVED) {
      actions.signInAs(currentUser, userAccount, history);
    }
  }

  onOpenRtbFormat() {
    const {
      data: { id },
      showRtbData,
    } = this.props;
    showRtbData(id);
  }

  render() {
    const { data } = this.props;
    const user = this.props.data;
    return data.status !== PENDING ? (
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
        <span className="editor-control" onClick={this.onOpenRtbFormat}>
          <SvgSearch />
        </span>
      </div>
    ) : null;
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  users: state.users.publishers,
  count: state.users.count,
  active: state.users.active,
  pending: state.users.pending,
  paused: state.users.paused,
  billingDetails: state.billingDetails,
  managers: state.users.managers,
  publishersStatistics: state.publishersStatistics,
  limit: state.pagination.limit,
  offset: state.pagination.offset,
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(
    {
      loadPublishers,
      loadBillingDetails,
      updatePublisherStatus,
      deletePublisher,
      changePaginationData,
      signInAs,
      clearPublishers,
    },
    dispatch
  ),
});

export default connect(mapStateToProps, mapDispatchToProps)(PublishersPage);
