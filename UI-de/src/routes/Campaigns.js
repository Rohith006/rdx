import React from 'react';
import {Switch, Route, Redirect} from 'react-router-dom';
import SelectCpmCampaignTypePage from '../components/CreateCampaign/SelectCpmCampaignTypePage';
import CreateCpmCampaignPage from '../components/CreateCampaign/CreateCpmCampaignPage';
import CampaignsListPage from '../components/Campaigns/CampaignsListPage';
import CampaignEditContainer from '../components/Campaigns/CampaignEditContainer';

export default () => (
  <Switch>
    <Route exact path="/campaigns" component={CampaignsListPage}/>
    <Route exact path="/campaigns/create/rtb" component={ SelectCpmCampaignTypePage } />
    <Route path="/campaigns/create/:campaignType" component={ CreateCpmCampaignPage } />
    <Route path="/campaigns/:campaignId/edit" component={CampaignEditContainer}/>
    <Route path="/campaigns/:campaignType/:campaignId/edit" component={CreateCpmCampaignPage}/>
    <Redirect exact from="/*" to="/campaigns"/>
  </Switch>
);
