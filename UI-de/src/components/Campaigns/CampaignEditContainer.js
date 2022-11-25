import React from 'react';
import {connect} from 'react-redux';

import CreateCpmCampaignPage from '../CreateCampaign/CreateCpmCampaignPage';

class CampaignEditContainer extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
        <CreateCpmCampaignPage {...this.props}/>
    );
  }
}

const mapStateToProps = (state) => ({
  campaigns: state.campaigns,
});

export default connect(mapStateToProps, null)(CampaignEditContainer);
