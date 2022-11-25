import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { AgGridReact } from "ag-grid-react";
import _, { sortedLastIndex } from "lodash";
import moment from "moment";
import copy from "copy-to-clipboard";
import arraySort from "array-sort";
import { BiMoveHorizontal } from "react-icons/bi";
import download from "../../../assets/images/icons/download-button.svg"
// import Modal from 'react-modal';

import {
  ADMIN,
  ACCOUNT_MANAGER,
  ADVERTISER,
  PUBLISHER,
  OWNER,
} from "../../constants/user";
import ReportsPageFiltersForm from "../forms/reportsForms/ReportsPageFiltersForm";
import ReportsPageTableTypeForm from "../forms/reportsForms/ReportsPageTableTypeForm";
import Summary from "../common/Summary";
import PendingContainer from "../UI/PendingContainer2";
import * as reportsConstants from "../../constants/reports";
import { loadAdvertisers, loadPublishers } from "../../actions/users";
import { loadCampaigns } from "../../actions/campaigns&budgets";
import {
  loadReports,
  resetReportsState,
  filterReportCampaigns,
  reportsSettings,
  dropDownData,
} from "../../actions/reports";
import { logActivity } from "../../actions/userActivity";
import DisplayCheck from "../../permissions";
import dateCellRenderer from "../../utils/agGrid/renderers/dateCellRenderer";
import countryCellRenderer from "../../utils/agGrid/renderers/countryCellRenderer";
import customToFixed from "../../utils/agGrid/renderers/customToFixed";
import amountCellRenderer from "../../utils/agGrid/renderers/amountCellRenderer";
import profitCellRenderer from "../../utils/agGrid/renderers/profitCellRenderer";
import customNumberFormat from "../../utils/agGrid/renderers/customNumberFormat";
import numberCellRenderer from "../../utils/agGrid/renderers/numberCellRenderer";
import postbackCellRenderer from "../../utils/agGrid/renderers/postbackCellRenderer";
import { normalizeGroupBy } from "../../utils/normalizers";
import getReports2ColumnDefs from "../../utils/agGrid/columnDefs/reports2";
import calculateRowSpanning from "../../utils/agGrid/calculateRowSpanning";
import deleteCellRenderer from "../../utils/agGrid/renderers/deleteCellRenderer";
import campaignCellRenderer from "../../utils/agGrid/renderers/campaignCellRenderer";
import advertiserCellRenderer from "../../utils/agGrid/renderers/advertiserCellRenderer";
import { clicksIdCellRenderer } from "../../utils/agGrid/renderers/clicksCellRenderer";
import publisherCellRenderer from "../../utils/agGrid/renderers/publisherCellRenderer";
import impressionRejectedCellRenderer from "../../utils/agGrid/renderers/impressionRejectedCellRenderer";
import conversionStatusCellRenderer from "../../utils/agGrid/renderers/conversionStatusCellRenderer";
import statusRenderer from "../../utils/agGrid/renderers/statusRenderer";
import getGroupNames from "../../utils/getGroupNames";
import summarizeData from "../../utils/summarizeData";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-balham.css";
import { conversionIdCellRenderer } from "../../utils/agGrid/renderers/conversionIdRenderer";
import { impressionIdCellRenderer } from "../../utils/agGrid/renderers/impressionIdCellRenderer";
import { NotificationManager } from "react-notifications";
import localization from "../../localization";
import PaginationContainer from "../UI/ShowLinesDropdown";
import publisherNameCellRenderer from "../../utils/agGrid/renderers/publisherNameCellRenderer";
import advertiserNameCellRenderer from "../../utils/agGrid/renderers/advertiserNameCellRenderer";
import { HOURLY, PUBLISHERS } from "../../constants/reports";
import ModalData from "./modalData";
import { changePaginationData } from "../../actions/app";
import CsvReport from "../forms/reportsForms/CsvReport";
import { DAILY } from "../../constants/reports";
import { APPS } from "../../constants/reports";
import { SUB_ID } from "../../constants/reports";
import { SITES } from "../../constants/reports";
import TopBar from "../common/TopBar/TopBar";

class ReportsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pageCount: 1,
      startDate: moment().utc().startOf("day").format("YYYY-MM-DD"),
      endDate: moment().utc().format("YYYY-MM-DD"),
      columnDefs: [],
      filterForPagination: {},
      switcherStatus: "performance",
      reportVersion: "V2",
      gridOptions: {
        rowBuffer: 100,
        rowHeight: 52,
        suppressRowClickSelection: true,
        domLayout: "autoHeight",
        onCellClicked: (cell) => {
          copy(cell.value);
          NotificationManager.success(localization.integration.copied);
        },
        onGridReady: (params) => {
          this.gridApi = params.api;
          this.columnApi = params.columnApi;
          //setTimeout(()=>this.autoSizeAll(false), 400)
          // params.api.autoSizeColumns()
        },
        onFirstDataRendered: (params) => {
          // params.api.sizeColumnsToFit();
          const allColumnIds = [];
          // tslint:disable-next-line:only-arrow-functions
          this.columnApi.getAllColumns().forEach(function (column) {
            allColumnIds.push(column.colId);
          });
          this.columnApi.autoSizeColumns(allColumnIds, false);
        },
        // onRowDataChanged: (params) => {
        //   params.api.sizeColumnsToFit();
        // },
        // onGridSizeChanged: (params) => {
        //   params.api.sizeColumnsToFit();
        // },
        getRowStyle: (params) => {
          if (params.node.rowPinned) {
            return { borderBottom: "1px solid #d8d8d8" };
          }
        },
        rowClassRules: {
          'bold-total':
            'data.day === "Total:" || data.h === "Total:" || data.createdAt === "Total:" || data.name === "Total:" ||  data.size === "Total:" || data.crId === "Total:" || data.id === "Total:" || data.publisher === "Total:" || data.geo === "Total:" || data.os === "Total:" || data.appid === "Total:" || data.subidLabel === "Total:" || data.siteidLabel === "Total:"',
        },
        frameworkComponents: {
          customToFixed,
          customNumberFormat,
          numberCellRenderer,
          dateCellRenderer: dateCellRenderer({ extended: false }),
          conversionIdCellRenderer: conversionIdCellRenderer.bind(this),
          impressionIdCellRenderer: impressionIdCellRenderer.bind(this),
          extendedDateCellRenderer: dateCellRenderer({ extended: true }),
          impressionRejectedCellRenderer:
            impressionRejectedCellRenderer.bind(this),
          countryCellRenderer,
          clicksIdCellRenderer: clicksIdCellRenderer.bind(this),
          postbackCellRenderer: postbackCellRenderer({ jsx: true }),
          campaignCellRenderer: campaignCellRenderer.bind(this),
          statusRenderer: statusRenderer.bind(this),
          advertiserCellRenderer: advertiserCellRenderer.bind(this),
          advertiserNameCellRenderer: advertiserNameCellRenderer.bind(this),
          publisherCellRenderer: publisherCellRenderer.bind(this),
          publisherNameCellRenderer: publisherNameCellRenderer.bind(this),
          conversionStatusCellRenderer,
          amountCellRenderer,
          profitCellRenderer,
        },
        suppressDragLeaveHidesColumns: true,
        suppressRowTransform: true,
        animateRows: true,
      },
      groupByGridOptions: {
        frameworkComponents: {
          deleteCellRenderer,
        },
        onCellClicked: (params) => {
          switch (params.colDef.field) {
            case "delete": {
              this.setState((prevState) => ({
                modalGroupBy: prevState.modalGroupBy.filter(
                  (groupName) => groupName !== params.data.groupName
                ),
              }));
            }
          }
        },
      },
      reportByColumnDefs: [
        {
          headerName: "Added columns",
          field: "groupName",
          headerClass: "ag-grid-header-cell",
          width: 145,
        },
        {
          headerName: "",
          field: "delete",
          headerClass: "ag-grid-header-cell",
          cellRenderer: "deleteCellRenderer",
          width: 35,
        },
      ],
      tableType: reportsConstants.DAILY,
      groupBy: [reportsConstants.DAILY],
      modalGroupBy: [],
      isOpenModal: false,
      showColsDropdown: false,
      colLabel: "Select",
      isOpenDropdown: false,
    };
    this.autoSizeAll = this.autoSizeAll.bind(this);
    this.handleTableTypeFormSubmit = this.handleTableTypeFormSubmit.bind(this);
    this.handleFiltersFormSubmit = this.handleFiltersFormSubmit.bind(this);
    this.onSearchInputChange = this.onSearchInputChange.bind(this);
    this.exportDataAsCsv = this.exportDataAsCsv.bind(this);
    this.editReports = this.editReports.bind(this);
    this.onCloseModal = this.onCloseModal.bind(this);
    this.openModal = this.openModal.bind(this);
    this.onModalFormSubmit = this.onModalFormSubmit.bind(this);
    this.onModalSubmit = this.onModalSubmit.bind(this);
    this.changeBufferSize = this.changeBufferSize.bind(this);
    this.setOffsetPagination = this.setOffsetPagination.bind(this);
    this.changeState = this.changeState.bind(this);
    this.calculatePageCount = this.calculatePageCount.bind(this);
  }

  async componentDidMount() {
    const {
      auth: { currentUser },
    } = this.props;
    this.props.actions.loadAdvertisers();
    this.props.actions.loadPublishers();
    this.props.actions.loadCampaigns();
    await this.calculatePageCount();
    if (currentUser.role === ADVERTISER) {
      this.setState({
        switcherStatus: "performance",
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { limit, offset, reports } = this.props;
    const { startDate, endDate, switcherStatus, reportVersion } = this.state;
    if (switcherStatus !== prevState.switcherStatus) {
      this.calculatePageCount();
      this.setState(
        {
          tableType: reportsConstants.DAILY,
        },
        () => {
          this.props.actions.loadReports(
            {
              ...this.props.reports.settings,
              startDate,
              endDate,
              keys: ModalData.getState,
            },
            this.state.tableType,
            limit,
            offset,
            switcherStatus,
            reportVersion
          );
        }
      );
    }
    if (limit !== prevProps.limit) {
      this.calculatePageCount();
    }
    if (prevProps.reports.countReports !== reports.countReports) {
      this.calculatePageCount();
    }
  }

  componentWillUnmount() {
    this.props.actions.resetReportsState();
    ModalData.setState = [];
  }

  async calculatePageCount() {
    const { limit } = this.props;
    if (!this.props.reports.reportsList.length) return;
    this.setState({
      pageCount: this.props.reports.countReports / limit,
    });
  }

  async setOffsetPagination({ selected }) {
    const { filterForPagination, switcherStatus, reportVersion } = this.state;
    const { limit, actions } = this.props;
    const offset = selected * limit;
    await actions.loadReports(
      {
        ...filterForPagination,
        keys: ModalData.getState,
      },
      this.state.tableType,
      limit,
      offset,
      switcherStatus,
      reportVersion
    );

    actions.changePaginationData(limit, offset);
  }

  changeState(state, value) {
    this.setState({
      [state]: value,
    });
  }

  changeBufferSize(size) {
    const { state, props } = this;
    const columnDefs = getReports2ColumnDefs(props, state);
    this.setState(
      {
        gridOptions: {
          ...this.state.gridOptions,
          rowBuffer: size,
        },
      },
      () => this.gridApi.setColumnDefs(columnDefs)
    );
  }

  onCloseModal() {
    this.setState({
      isOpenModal: false,
    });
  }

  openModal() {
    this.setState((prevState) => ({
      modalGroupBy: [...prevState.groupBy],
    }));
    !this.props.reports.isRequestPending &&
      this.setState({
        isOpenModal: true,
      });
  }

  onModalSubmit() {
    const { state, props } = this;
    const columnDefs = getReports2ColumnDefs(props, state);
    this.setState((prevState) => ({
      groupBy: prevState.modalGroupBy,
    }));
    this.gridApi.setColumnDefs(columnDefs);
    this.onCloseModal();
  }

  async onModalFormSubmit(formData) {
    const { state } = this;

    if (!state.modalGroupBy.includes(formData.reportsType)) {
      const insertAfter = await new Promise((resolve) => {
        const reversedModalGroupBy = [...state.modalGroupBy].reverse();
        reversedModalGroupBy.forEach((groupName, i) => {
          const allowedGroupNames = getGroupNames(
            reversedModalGroupBy.slice(i)
          );
          if (allowedGroupNames.includes(formData.reportsType)) {
            resolve(groupName);
          }
        });
      });

      const modalGroupBy = state.modalGroupBy;

      const insertIndex = modalGroupBy.indexOf(insertAfter) + 1;
      modalGroupBy.splice(insertIndex, 0, formData.reportsType);

      this.setState({ modalGroupBy });
    }
  }

  async handleTableTypeFormSubmit(formData) {
    this.props.actions.resetReportsState();
    this.setState(
      {
        tableType: formData.tableType,
        pageCount: this.props.reports.countReports / this.props.limit || 1,
      },
      () => {
        if (this.state.tableType === reportsConstants.CONVERSIONS) {
          this.changeBufferSize(10);
        } else this.changeBufferSize(1000000);
      }
    );
    await this.setState({
      groupBy: [formData.tableType],
    });
  }

  async handleFiltersFormSubmit(formData) {
    const { tableType, switcherStatus, reportVersion } = this.state;
    const { limit, offset } = this.props;
    let columnDefs = getReports2ColumnDefs(this.props, this.state);
    columnDefs = columnDefs.map((el) => Object.values(el));
    columnDefs = columnDefs.flat(Infinity);
    ModalData.set = ModalData.get.map((el) => {
      if (!columnDefs.includes(el.name)) {
        return { ...el, checked: !el.checked };
      } else {
        return el;
      }
    });

    if (formData.keys === null) {
      ModalData.setState = [];
    }

    if (_.isEmpty(formData)) {
      formData.startDate = this.state.startDate;
      formData.endDate = this.state.endDate;
    }

    this.setState({
      startDate: formData.startDate,
      endDate: formData.endDate,
      filterForPagination: {
        ...formData,
        startDate: formData.startDate,
        endDate: formData.endDate,
      },
    });

    this.props.actions.reportsSettings({
      ...formData,
      startDate: formData.startDate,
      endDate: formData.endDate,
      reportsType: tableType,
      groupBy: [tableType],
      tableType,
      limit,
      offset,
    });

    await this.props.actions.loadReports(
      {
        ...formData,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reportsType: tableType,
        keys: ModalData.getState,
        groupBy: [tableType],
      },
      tableType,
      limit,
      offset,
      switcherStatus,
      reportVersion
    );

    this.setState({
      pageCount: this.props.reports.countReports / this.props.limit,
    });
  }

  editReports(reports) {
    const { users, campaigns, countries, auth, actions } = this.props;
    const { tableType } = this.state;
    const role = auth.currentUser.role;
    // this.setState({filterForPagination: []});
    const sortValues = normalizeGroupBy(this.state.groupBy);
    // pinned rows
    if (tableType === reportsConstants.CAMPAIGNS) {
      sortValues.push("advertiserId");
    }
    // pinned rows

    reports = arraySort(reports, ...sortValues);
    reports = reports.map((report, i) => ({
      ...report,
      index: i,
    }));

    const summarizeOptions = [
      "requests",
      "bidrequests",
      "bidresponses",
      "responses",
      "impressions",
      "impressionsImage",
      "impressionsImage",
      "impressionsIcon",
      "approvedImpressionsImage",
      "approvedImpressionsIcon",
      "approvedImpressions",
      "rejectedImpressions",
      "duplicateImpressions",
      "expiredImpressions",
      "expiredImpressions",
      "remoteImpressions",
      "impressionsCount",
      "blacklisted",
      "errors",
      "forbidden",
      "auctionType",
      "inventoryType",
      "parse",
      "adType",
      "geo",
      "ip",
      "geoMatch",
      "os",
      "bidfloor",
      "serverErrors",
      "totalNoMatch",
      // AVG
      "bidFloor",
      "ctr",
      "eCPM",
      "bidRate",
      "percentApproved",
      "percentApprovedIcon",
      "percentApprovedImage",
      "percentApprovedClicks",
      "fillRate",
      "winRate",
      "bidPrice",
      "percentDuplicateImpressions",
      "percentExpiredImpressions",
      "percentMismatchImpressions",
      "percentRejectedImpressions",
      "perApprovedPayout",
      "perApprovedImpressions",
      "perApprovedClicks",
      "percentBlacklisted",
      "percentErrors",
      "percentForbidden",
      "percentAuctionType",
      "percentInventoryType",
      "percentParse",
      "percentAdType",
      "percentTmax",
      "percentGeo",
      "percentIp",
      "percentGeoMatch",
      "percentOs",
      "percentServerErrors",
      "mismatchImpressions",
      "tmax",
      "percentBidfloor",
      "percentNoMatch",
      "percentBidFloor",
      "percentTrafficType",
      "percentCategory",
      "percentDeviceType",
      "percentPlatform",
      "percentMinOS",
      "percentMaxOS",
      "percentSize",
      "percentRequiredParams",
      "percentCarrier",
      "percentBrowser",
      "percentLanguage",
      "percentGender",
      "percentAge",
      "percentConnectionType",
      "perRejectedImpressions",
      "sizes",
      "geos",
      // AVG
      "trafficType",
      "category",
      "deviceType",
      "platform",
      "minOS",
      "maxOS",
      "size",
      "requiredParams",
      "connectionType",
      "carrier",
      "browser",
      "language",
      "age",
      "gender",
      "clicksCount",
      "clicks",
      "approvedClicks",
      "revenue",
      "revenueNet",
      "remoteRevenue",
      "payout",
      "approvedPayout",
      "payoutNet",
      "conversionsCount",
      "profit",
      "profitNet",
      "status204",
      "timeout",
      "status499",
      "status400",
    ];
    if ([ADMIN, ACCOUNT_MANAGER, ADVERTISER].includes(role)) {
      summarizeOptions.push("spentAdvertiser");
    }
    if ([ADMIN, ACCOUNT_MANAGER, PUBLISHER].includes(role)) {
      summarizeOptions.push("ownerSpent");
    }
    if ([ADMIN, ACCOUNT_MANAGER].includes(role)) {
      summarizeOptions.push("ownerEarnings");
    }

    switch (this.state.tableType) {
      case reportsConstants.DAILY:
        calculateRowSpanning.call(this, reports)
        ModalData.setDataAtType(DAILY)
        this.gridApi &&
          this.gridApi.setPinnedBottomRowData([
            { day: 'Total:', ...summarizeData(reports, summarizeOptions) },
          ])
        return reports
      case reportsConstants.HOURLY:
        calculateRowSpanning.call(this, reports)
        ModalData.setDataAtType(HOURLY)
        this.gridApi &&
          this.gridApi.setPinnedBottomRowData([
            { h: 'Total:', ...summarizeData(reports, summarizeOptions) },
          ])
        return reports
      case reportsConstants.IMPRESSIONS: {
        this.gridApi && this.gridApi.setPinnedBottomRowData([])
        return reports.map((report) => ({
          ...report,
          publisherName: _.get(
            users.publishers.find((user) => user.id === report.publisherId),
            'name',
            report.publisherId,
          ),
          campaignName: _.get(
            campaigns.campaignsList.find(
              (campaign) => campaign.id === parseInt(report.campaignId),
            ),
            'campaignName',
            'unknown',
          ),
          country: _.get(
            countries.countriesList.find(
              (country) => country.alpha2Code === report.countryCode,
            ),
            'alpha2Code',
            'unknown',
          ),
          status: report.status ? report.status.toLowerCase() : '',
        }))
      }
      case reportsConstants.CLICKS: {
        this.gridApi && this.gridApi.setPinnedBottomRowData([])
        ModalData.setDataAtType()
        return reports.map((report) => ({
          ...report,
          publisherName: _.get(
            users.publishers.find((user) => user.id === report.publisherId),
            'name',
            report.publisherId,
          ),
          campaignName: _.get(
            campaigns.campaignsList.find(
              (campaign) => campaign.id === parseInt(report.campaignId),
            ),
            'campaignName',
            'unknown',
          ),
          country: _.get(
            countries.countriesList.find(
              (country) => country.alpha2Code === report.countryCode,
            ),
            'alpha2Code',
            'unknown',
          ),
          status: report.status ? report.status.toLowerCase() : '',
        }))
      }
      case reportsConstants.CONVERSIONS: {
        this.gridApi && this.gridApi.setPinnedBottomRowData([])
        ModalData.setDataAtType()
        return reports.map((report) => ({
          ...report,
          publisherName: _.get(
            users.publishers.find((user) => user.id === report.publisherId),
            'name',
            report.publisherId,
          ),
          campaignName: _.get(
            campaigns.campaignsList.find(
              (campaign) => campaign.id === parseInt(report.campaignId),
            ),
            'campaignName',
            'unknown',
          ),
          country: _.get(
            countries.countriesList.find(
              (country) => country.alpha2Code === report.countryCode,
            ),
            'alpha2Code',
            'unknown',
          ),
          status: report.status ? report.status.toLowerCase() : '',
        }))
      }
      case reportsConstants.ADVERTISERS: {
        calculateRowSpanning.call(this, reports)
        ModalData.setDataAtType()
        this.gridApi &&
          this.gridApi.setPinnedBottomRowData([
            { id: 'Total:', ...summarizeData(reports, summarizeOptions) },
          ])
        return reports
      }
      case reportsConstants.COUNTRY: {
        calculateRowSpanning.call(this, reports)
        ModalData.setDataAtType()
        this.gridApi &&
          this.gridApi.setPinnedBottomRowData([
            { geo: 'Total:', ...summarizeData(reports, summarizeOptions) },
          ])
        return reports
      }
      case reportsConstants.OS: {
        calculateRowSpanning.call(this, reports)
        ModalData.setDataAtType()
        this.gridApi &&
          this.gridApi.setPinnedBottomRowData([
            { os: 'Total:', ...summarizeData(reports, summarizeOptions) },
          ])
        return reports
      }
      case reportsConstants.APPS: {
        calculateRowSpanning.call(this, reports)
        ModalData.setDataAtType(APPS)
        this.gridApi &&
          this.gridApi.setPinnedBottomRowData([
            {
              appid: 'Total:',
              ...summarizeData(reports, summarizeOptions),
            },
          ])
        return reports
      }
      case reportsConstants.SITES: {
        calculateRowSpanning.call(this, reports)
        ModalData.setDataAtType(SITES)
        this.gridApi &&
          this.gridApi.setPinnedBottomRowData([
            {
              siteidLabel: 'Total:',
              ...summarizeData(reports, summarizeOptions),
            },
          ])
        return reports
      }
      case reportsConstants.CAMPAIGNS: {
        calculateRowSpanning.call(this, reports)
        ModalData.setDataAtType()
        this.gridApi &&
          this.gridApi.setPinnedBottomRowData([
            { name: 'Total:', ...summarizeData(reports, summarizeOptions) },
          ])
        return reports
      }
      case reportsConstants.CAMPAIGNS_CPM: {
        calculateRowSpanning.call(this, reports)
        ModalData.setDataAtType()
        this.gridApi &&
          this.gridApi.setPinnedBottomRowData([
            { id: 'Total:', ...summarizeData(reports, summarizeOptions) },
          ])
        return reports
      }
      case reportsConstants.DEVICES: {
        calculateRowSpanning.call(this, reports)
        ModalData.setDataAtType()
        this.gridApi &&
          this.gridApi.setPinnedBottomRowData([
            { device: 'Total:', ...summarizeData(reports, summarizeOptions) },
          ])
        return reports
      }
      case reportsConstants.SUB_ID: {
        calculateRowSpanning.call(this, reports)
        ModalData.setDataAtType(SUB_ID)
        this.gridApi &&
          this.gridApi.setPinnedBottomRowData([
            {
              subidLabel: 'Total:',
              ...summarizeData(reports, summarizeOptions),
            },
          ])
        return reports.map((report) => ({
          ...report,
          publisherName: _.get(
            users.publishers.find((user) => user.id === report.publisherId),
            'name',
            report.publisherId,
          ),
          campaignName: _.get(
            campaigns.campaignsList.find(
              (campaign) => campaign.id === parseInt(report.campaignId),
            ),
            'campaignName',
            'unknown',
          ),
          country: _.get(
            countries.countriesList.find(
              (country) => country.alpha2Code === report.countryCode,
            ),
            'alpha2Code',
            'unknown',
          ),
          status: report.status ? report.status.toLowerCase() : '',
        }))
      }
      case reportsConstants.PUBLISHERS: {
        calculateRowSpanning.call(this, reports)
        ModalData.setDataAtType(PUBLISHERS)
        this.gridApi &&
          this.gridApi.setPinnedBottomRowData([
            { name: 'Total:', ...summarizeData(reports, summarizeOptions) },
          ])
        return reports
      }
      case reportsConstants.GOALS: {
        calculateRowSpanning.call(this, reports)
        ModalData.setDataAtType()
        this.gridApi &&
          this.gridApi.setPinnedBottomRowData([
            {
              createdAt: 'Total:',
              ...summarizeData(reports, summarizeOptions),
            },
          ])
        return reports
      }
      case reportsConstants.ERRORS: {
        ModalData.setDataAtType()
        this.gridApi &&
          this.gridApi.setPinnedBottomRowData([
            { id: 'Total:', ...summarizeData(reports, summarizeOptions) },
          ])
        return reports
      }
      case reportsConstants.PUBLISHER_ERRORS: {
        ModalData.setDataAtType()
        this.gridApi &&
          this.gridApi.setPinnedBottomRowData([
            { name: 'Total:', ...summarizeData(reports, summarizeOptions) },
          ])
        return reports
      }
      case reportsConstants.PUBLISHER_ERRORS_XML: {
        ModalData.setDataAtType()
        this.gridApi &&
          this.gridApi.setPinnedBottomRowData([
            { id: 'Total:', ...summarizeData(reports, summarizeOptions) },
          ])
        return reports
      }
      case reportsConstants.PUB_NO_MATCH_CAMPAIGN: {
        ModalData.setDataAtType()
        this.gridApi &&
          this.gridApi.setPinnedBottomRowData([
            {
              publisher: 'Total:',
              ...summarizeData(reports, summarizeOptions),
            },
          ])
        return reports
      }
      case reportsConstants.CREATIVES: {
        ModalData.setDataAtType()
        this.gridApi &&
          this.gridApi.setPinnedBottomRowData([
            { crId: 'Total:', ...summarizeData(reports, summarizeOptions) },
          ])
        return reports
      }
      case reportsConstants.SIZES: {
        ModalData.setDataAtType()
        this.gridApi &&
          this.gridApi.setPinnedBottomRowData([
            { size: 'Total:', ...summarizeData(reports, summarizeOptions) },
          ])
        return reports
      }
    }
  }

  onSearchInputChange(e) {
    this.gridApi.setQuickFilter(e.target.value);
  }

  exportDataAsCsv() {
    try {
      if (this.gridApi.getDisplayedRowCount()) {
        this.gridApi.exportDataAsCsv();
        this.props.actions.logActivity({ type: "USER_REPORTS_EXPORT" });
      }
    } catch (e) {
      console.log(e);
    }
  }
  async autoSizeAll(shiftheader) {
    const allColumnIds = [];
    // tslint:disable-next-line:only-arrow-functions
    this.columnApi.getAllColumns().forEach(function (column) {
      allColumnIds.push(column.colId);
    });
    this.columnApi.autoSizeColumns(allColumnIds, shiftheader);
  }

  render() {
    const { state, props } = this;
    const role = props.auth.currentUser.role;
    const currentUser = props.auth.currentUser;
    const editedReports = this.editReports(props.reports.reportsList) || [];
    const columnDefs = getReports2ColumnDefs(props, state);
    //setTimeout(()=>this.autoSizeAll(false), 400)

    return (
      <div className="reports-page">
        <TopBar title={localization.header.nav.reports} subtitle="Today" />
        <DisplayCheck
          roles={[ADMIN, OWNER, ADVERTISER, ACCOUNT_MANAGER, PUBLISHER]}
        >
          <Summary />
        </DisplayCheck>
        <div className="card ">
          <div className="card_body">
            <ReportsPageTableTypeForm
              onSubmit={this.handleTableTypeFormSubmit}
              isRequestPending={props.reports.isRequestPending}
              switcherStatus={state.switcherStatus}
              initialValues={{ tableType: reportsConstants.DAILY }}
              tableType={state.tableType}
            />
            <ReportsPageFiltersForm
              openModal={this.openModal}
              tableType={state.tableType}
              auth={this.props.auth}
              groupBy={state.groupBy}
              switcherStatus={state.switcherStatus}
              onSubmit={this.handleFiltersFormSubmit}
              onSearchInputChange={this.onSearchInputChange}
              exportDataAsCsv={this.exportDataAsCsv}
              users={props.users}
              campaigns={props.campaigns}
              countries={props.countries}
              isRequestPending={props.reports.isRequestPending}
              initialValues={{
                startDate: this.state.startDate,
                endDate: this.state.endDate,
                limit: props.limit,
              }}
            />
          </div>

          {/* <Modal> */}
          {/* {*/}
          {/*  ['APPS'].includes(state.tableType) &&*/}
          {/*  props.form ?*/}
          {/*      <div className="reports_control">*/}
          {/*        <CsvReport startDate={props.form.ReportsPageFiltersForm.values.startDate.format('YYYY-MM-DD')}*/}
          {/*          endDate={props.form.ReportsPageFiltersForm.values.endDate.format('YYYY-MM-DD')}*/}
          {/*          groupBy={state.groupBy[0]}/>*/}
          {/*      </div> :*/}
          {/*  null*/}
          {/* }*/}
          {
            // ['DAILY', 'ADVERTISERS', 'PUBLISHERS', 'IMPRESSIONS', 'OS', 'CLICKS', 'COUNTRY', 'APPS'].includes(state.tableType) && (
            <div className="reports_control">
              <img src={download} className="line_download-reports" onClick={this.exportDataAsCsv} />
              {/* </span> */}
            </div>
            // )
          }

          <PendingContainer isPending={props.reports.isRequestPending}>
            <div
              className="ag-theme-balham reports"
              style={{
                width: "100%",
              }}
            >
              <AgGridReact
                columnDefs={columnDefs && columnDefs.length ? columnDefs : []}
                rowData={editedReports}
                gridOptions={state.gridOptions}
                enableSorting
                pagination={true}
                enableColResize
              />
              {/* <PaginationContainer
                changeState={this.changeState}
                setOffsetPagination={this.setOffsetPagination}
                count={this.props.reports.countReports}
                {...this.state}
                page="reports"
                {...this.props}
                gridApi={this.gridApi}
              /> */}
            </div>
          </PendingContainer>

          {/* </Modal> */}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  users: state.users,
  campaigns: state.campaigns,
  countries: state.countries,
  reports: state.reports,
  limit: state.pagination.limit,
  offset: state.pagination.offset,
  form: state.form,
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(
    {
      loadAdvertisers,
      loadPublishers,
      loadCampaigns,
      loadReports,
      logActivity,
      resetReportsState,
      reportsSettings,
      changePaginationData,
      filterReportCampaigns,
      dropDownData,
    },
    dispatch
  ),
});

ReportsPage.propTypes = {
  actions: PropTypes.object,
  auth: PropTypes.object,
  users: PropTypes.object,
  campaigns: PropTypes.object,
  countries: PropTypes.object,
  reports: PropTypes.object,
};

export default connect(mapStateToProps, mapDispatchToProps)(ReportsPage);
