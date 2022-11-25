import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';
import PropTypes from 'prop-types';
import DisplayCheck from '../../permissions/index';
import * as userConstants from '../../constants/user';
import localization from '../../localization/index';
import CustomOptimizer from './CustomOptimizer';
import TopBar from '../common/TopBar/TopBar';

class SettingsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div>
        <TopBar title={localization.header.nav.settings}/>
        <CustomOptimizer {...this.props} />
      </div>
    );
  }
}

const mapStateToProps = ({auth}) => ({auth});

SettingsPage.propTypes = {
  auth: PropTypes.object,
};

export default connect(mapStateToProps, null)(SettingsPage);
