import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {getUserById, updateManager, loadAdmins, resetCurrentUser} from '../../../actions/users';
import connect from 'react-redux/es/connect/connect';
import Editor from './Editor';
import {NotificationManager} from 'react-notifications';
import {loadCountries} from '../../../actions/countries';
import {ADD_ADMINS} from '../../../constants/app';

class UserEditorContainer extends Component {
  constructor(props) {
    super(props);
    this.onUpdateUser = this.onUpdateUser.bind(this);
    this.initAdmins = this.initAdmins.bind(this);
  }

  componentDidMount() {
    this.initAdmins();
    this.props.actions.loadCountries();
  }

  componentWillUnmount() {
    this.props.actions.resetCurrentUser();
  };

  async initAdmins() {
    const {match: {params}} = this.props;
    await this.props.actions.loadAdmins();
    this.props.actions.getUserById(params.id);
  }

  async onUpdateUser(values) {
    const entries = Object.entries(values);
    const permissions = entries.filter((item) => item[1] === true).map((permission) => permission[0]);

    const userRole = __WLID__ === '15' ? 'ADMIN' : values.role;

    const newObj = {
      email: values.email,
      name: values.name,
      password: values.password,
      skype: values.skype,
      role: userRole,
      permissions: permissions,
    };

    const data = {
      id: values.id,
      ...newObj,
    };

    await this.props.actions.updateManager(data)
        .then(async () => {
          await this.props.actions.loadAdmins();
          this.props.history.push('/users');
        })
        .catch((err) => {
          NotificationManager.error(`Error: ${err.response.data.errors[0].message}`);
        });
  }

  render() {
    const {currentUser} = this.props;
    return (
      !currentUser || !this.props.auth.currentUser.permissions.includes(ADD_ADMINS) ? null :
        <Editor
          {...this.props}
          onSubmit={this.onUpdateUser}
          initialValues={currentUser}
          countries={this.props.countries}
        />
    );
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  currentUser: state.users.currentUser,
  newUserValues: state.form.user && state.form.user.values,
  countries: state.countries,
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    getUserById,
    loadCountries,
    updateManager,
    loadAdmins,
    resetCurrentUser,
  }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(UserEditorContainer);

