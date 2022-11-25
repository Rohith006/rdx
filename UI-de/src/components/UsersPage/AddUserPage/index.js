import React from 'react';
import {bindActionCreators} from 'redux';
import connect from 'react-redux/es/connect/connect';
import {createAdmin, loadAdmins} from '../../../actions/users';
import Editor from './Editor';
import {getPermissions} from '../utils';
import {NotificationManager} from 'react-notifications';
import {ADD_ADMINS} from '../../../constants/app';

class AddUserContainer extends React.Component {
  constructor(props) {
    super(props);
    this.onAddUser = this.onAddUser.bind(this);
  }

  componentDidMount() {
    this.props.actions.loadAdmins();
  }

  async onAddUser(values) {
    const userRole = __WLID__ === '15' ? 'ADMIN' : values.role;
    const newObj = {
      email: values.email,
      name: values.name,
      password: values.password,
      skype: values.skype,
      role: userRole,
      permissions: [],
    };
    const entries = Object.entries(values);
    newObj.permissions = entries.filter((item) => item[1] === true).map((permission) => permission[0]);
    this.props.actions.createAdmin(newObj).then(async () => {
      await this.props.actions.loadAdmins();
      this.props.history.push('/users');
    }).catch((err) => {
      NotificationManager.error(`Error: ${err.response.data.errors[0].message}`);
    });
  }

  render() {
    return (
      !this.props.auth.currentUser.permissions.includes(ADD_ADMINS) ? null :
        <Editor
          {...this.props}
          onSubmit={this.onAddUser}
          countries={this.props.countries}
        />
    );
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  newUserValues: state.form.user && state.form.user.values,
  countries: state.countries,
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    createAdmin,
    loadAdmins,
  }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(AddUserContainer);
