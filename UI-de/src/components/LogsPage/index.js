import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import PropTypes from 'prop-types';
import moment from 'moment';

import {loadCampaigns} from '../../actions/campaigns&budgets';
import {loadAllUsers} from '../../actions/users';
import {loadUserActivityReports} from '../../actions/userActivity';

import ActivityFiltersForm from './ActivityFiltersForm';
import {UserActivityTable} from './UserActivityTable';
import {ActivityDetailsModal} from './DetailsModal';

import {EVENT_TYPES} from '../../constants/app';
import onOutsideElementClick from '../../utils/onOutsideElementClick';
import TopBar from '../common/TopBar/TopBar';
import localization from '../../localization';

class LogsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filters: {
        selectedUsers: [],
        eventType: [],
        selectedCampaignName: '',
      },
      campaigns: [],
      users: [],
      activityDetails: null,
      isOpenModal: false,
      eventType: null,
    };

    this.onFilterValueSelect = this.onFilterValueSelect.bind(this);
    this.handleFiltersSubmit = this.handleFiltersSubmit.bind(this);
    this.openDetailsModal = this.openDetailsModal.bind(this);
    this.onCloseModal = this.onCloseModal.bind(this);
  }

  componentDidMount() {
    this.props.actions.loadCampaigns();
    this.props.actions.loadAllUsers();
    this.props.actions.loadUserActivityReports();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.campaigns.length) {
      const campaigns = [
        {value: null, label: '-'},
        ...nextProps.campaigns.map(({id, campaignName}) => ({
          value: id,
          label: campaignName,
        })),
      ];

      this.setState({
        campaigns,
      });
    }
    if (nextProps.users.length) {
      const users = [
        {value: null, label: '-'},
        ...nextProps.users.map(({id, email}) => ({
          value: id,
          label: email,
        })),
      ];

      this.setState({
        users,
      });
    }
  }

  onFilterValueSelect(value, fieldName) {
    const {filters} = Object.assign({}, this.state);
    filters[fieldName] = value;
    this.setState(filters);
  }

  handleFiltersSubmit(formData) {
    if (formData.user && !formData.user.id) delete formData.user;
    if (formData.company && !formData.company.id) delete formData.company;
    const copy = Object.assign({}, formData);
    const dateRange = {
      startDate: copy.startDate.format('YYYY-MM-DD'),
      endDate: copy.endDate.format('YYYY-MM-DD'),
    };
    delete copy.startDate;
    delete copy.endDate;
    if (copy.user) {
      for (const item of this.props.users) {
        if (item.id === copy.user.id && item.email === copy.user.name) {
          copy.user = item;
          break;
        }
      }
    }
    this.props.actions.loadUserActivityReports({...copy, dateRange});
  }

  openDetailsModal(details,changeEvent) {
    if (details !== "[{}]") {
      this.setState({
        isOpenModal: true,
        activityDetails: details,
        eventType: changeEvent
      });
      window.scrollTo(0,0)
    }
  }

  onCloseModal() {
    this.setState({
      isOpenModal: false,
    });
  }

  render() {
    const {userActivityLogs, isRequestPending} = this.props;
    const {campaigns, users, isOpenModal, activityDetails, eventType} = this.state;
    return (
      <Fragment>
        <TopBar title={localization.header.nav.logs} />
        <div className="card logs">        
        <ActivityFiltersForm
          campaigns={campaigns} users={users} types={EVENT_TYPES} isRequestPending={isRequestPending}
          onFilterValueSelect={this.onFilterValueSelect} onSubmit={this.handleFiltersSubmit}
          initialValues={{startDate: moment().subtract(7, 'days'), endDate: moment()}}
        />
        <UserActivityTable
          userActivity={userActivityLogs}
          showLogDetails={this.openDetailsModal}
          onOutsideElementClick={onOutsideElementClick}
          isRequestPending={isRequestPending}
        />
        </div>
        <ActivityDetailsModal
          isOpenModal={isOpenModal}
          closeModal={this.onCloseModal}
          activityDetails={activityDetails}
          eventType={eventType}
        />
      </Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  campaigns: state.campaigns.campaignsList,
  users: state.users.usersList,
  userActivityLogs: state.userActivity.userActivityLogs,
  isRequestPending: state.userActivity.isRequestPending,
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    loadCampaigns,
    loadAllUsers,
    loadUserActivityReports,
  }, dispatch),
});

LogsPage.propTypes = {
  campaigns: PropTypes.array,
  users: PropTypes.array,
  userActivityLogs: PropTypes.array,
};

export default connect(mapStateToProps, mapDispatchToProps)(LogsPage);
