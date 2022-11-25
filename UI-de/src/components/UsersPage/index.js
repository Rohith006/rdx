import React, {Component, Fragment} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {filterByName, loadAdmins, deleteAdmin, updateAdminStatus} from '../../actions/users';
import Search from './Search';
import Grid from './Grid';
import {ACCOUNT_MANAGER, ADMIN} from '../../constants/app';
import {OWNER} from '../../constants/user';
import TopBar from '../common/TopBar/TopBar';
import localization from '../../localization';

class UsersPage extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const {users} = this.props;
    !users.length && this.props.actions.loadAdmins();
  }

  filterUsers() {
    const users = _.cloneDeep(this.props.users);
    users.forEach((user) => {
      if (user.role === OWNER) user.role = 'Owner';
      if (user.role === ADMIN) user.role = 'Administrator';
      if (user.role === ACCOUNT_MANAGER) user.role = 'Manager';
    });
    return users;
  }

  render() {
    const {filterList, history, actions, auth, isRequestPending} = this.props;
    const users = this.filterUsers();
    return (
      <Fragment>
        <TopBar title={localization.header.nav.users} />
        <div className= "card users">
        <Search {...this.props} users={filterList || users} history={history} actions={actions}/>
        <Grid
          users={filterList || users}
          history={history}
          actions={actions}
          auth={auth}
          isRequestPending={isRequestPending}
        />
        </div>
      </Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  users: state.users.admins,
  filterList: state.users.filterList,
  filterValue: state.users.filterValue,
  isRequestPending:state.users.isRequestPending
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    loadAdmins,
    filterByName,
    updateAdminStatus,
    deleteAdmin,
  }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(UsersPage);
