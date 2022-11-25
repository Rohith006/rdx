import React from 'react';
import _ from 'lodash';

export default function({value}) {
  return <div>
    { _.get(this.props.campaigns.campaignsList.find((campaign) => campaign.id === value), 'campaignName', '') }
  </div>;
}
