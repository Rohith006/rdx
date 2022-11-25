import React from 'react';
import {Switch, Route} from 'react-router-dom';
import CampaignsListPage from '../../components/Campaigns/CampaignsListPage';
import NotFound from '../../components/NotFound';
import {protectNoMatch, protectPublisherDashboard} from '../../auth';

const ProtectedPublisherCampaignsListPage = protectPublisherDashboard(CampaignsListPage);
const ProtectedNoMatch = protectNoMatch(NotFound);

export default () => (
  <Switch>
    <Route exact path='/publisher/campaigns' component={ ProtectedPublisherCampaignsListPage }/>
    <Route path="*" component={ ProtectedNoMatch }/>
  </Switch>
);
