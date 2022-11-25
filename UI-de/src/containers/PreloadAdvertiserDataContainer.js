import React, {Fragment} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {loadCampaigns} from '../actions/campaigns&budgets';
import {loadSummary} from '../actions/summary';

class PreloadAdvertiserDataContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.props.actions.loadSummary();
    this.props.actions.loadCampaigns();
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
    loadSummary,
  }, dispatch),
});

export default connect(null, mapDispatchToProps)(PreloadAdvertiserDataContainer);
