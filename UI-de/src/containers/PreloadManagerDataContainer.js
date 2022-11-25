import React, {Fragment} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {loadCampaigns} from '../actions/campaigns&budgets';
import {loadAdvertisers, loadPublishers, loadPublishersListDropdown} from '../actions/users';
import {loadUserActivationSettings} from '../actions/platformSettings';
import {loadSummary} from '../actions/summary';

class PreloadManagerDataContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    const {actions} = this.props;
    actions.loadAdvertisers();
    actions.loadPublishers();
    actions.loadCampaigns();
    actions.loadUserActivationSettings();
    actions.loadPublishersListDropdown();
    actions.loadSummary();
    setInterval(actions.loadSummary, 60000);
  }

  render() {
    return (
      <Fragment>
        {this.props.children}
      </Fragment>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    loadCampaigns,
    loadAdvertisers,
    loadPublishers,
    loadUserActivationSettings,
    loadPublishersListDropdown,
    loadSummary,
  }, dispatch),
});

export default connect(null, mapDispatchToProps)(PreloadManagerDataContainer);
