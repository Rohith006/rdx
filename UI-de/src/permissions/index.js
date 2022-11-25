import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {ADVERTISER, PUBLISHER, ADMIN, OWNER} from '../constants/user';
import {APPS, SITES, SUB_ID} from '../constants/reports';
import {hasSubArray} from '../utils/common';

class DisplayCheck extends Component {
  constructor(props) {
    super(props);

    this.checkRole = this.checkRole.bind(this);
    this.checkPermissions = this.checkPermissions.bind(this);
  }

  checkRole() {
    const {user, roles} = this.props;
    return roles.includes(user.role);
  }

  checkPermissions() {
    // TODO temporary, will be permission check here
    const {user, label, type} = this.props;
    if (!label) {
      return true;
    }
    if (user.role === PUBLISHER || user.role === ADMIN || user.role === OWNER) {
      return true;
    } else if (user.role === ADVERTISER) {
      if (type === 'PERFORMANCE' && [SUB_ID, SITES, APPS].includes(label)) {
        return user.isCampaignsAllowed;
      } else {
        return true;
      }
    }
    // check perm for manager
    return user.permissions && hasSubArray(user.permissions, label);
  }

  render() {
    return this.checkRole() && this.checkPermissions() && this.props.children ? this.props.children : null;
  }
}

DisplayCheck.propTypes = {
  permission: PropTypes.string,
  label: PropTypes.array,
  roles: PropTypes.array.isRequired,
};

const mapStateToProps = (state) => ({
  user: state.auth.currentUser,
});

export default connect(mapStateToProps)(DisplayCheck);
