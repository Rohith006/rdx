import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import PlatformSettingsForm from './PlatformSettingsForm';
import {loadUserActivationSettings, updateUserActivationSettings} from '../../actions/platformSettings';

class PlatformSettingsContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  async handleSubmit(formData) {
    const {actions} = this.props;
    await actions.updateUserActivationSettings({
      newSetup: {...formData},
    });
    actions.loadUserActivationSettings();
  }

  render() {
    const {platformSettings} = this.props;
    const formInitialValues = {
      ...platformSettings.userActivation,
    };
    return (
      platformSettings.userActivation ? <PlatformSettingsForm onSubmit={this.handleSubmit} initialValues={formInitialValues}/> : null
    );
  }
}

const mapStateToProps = (state) => ({
  platformSettings: state.platformSettings,
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    updateUserActivationSettings,
    loadUserActivationSettings,
  }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(PlatformSettingsContainer);
