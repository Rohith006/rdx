import React, {Fragment} from 'react';
import {Switch, Route, Redirect} from 'react-router-dom';
import Dashboard from '../../components/Dashboard';
import CreateCampaignRouter from './CreateCampaign';
import ReportsPage from '../../components/ReportsPage';
import NotFound from '../../components/NotFound';
import MyAccount from '../../components/MyAccount';
import SettingsRouter from './Settings';
import AudiencesRouter from '../Audiences';

export default (props) => (
  <Switch>
    <Redirect exact from="/" to="/dashboard" />
    <Route exact path="/" component={Dashboard}/>
    <Route exact path="/dashboard" component={Dashboard}/>
    <Route path="/account" component={MyAccount}/>
    <Route path="/reports" component={ReportsPage}/>
    <Route path="/settings" component={SettingsRouter}/>
    {
      props.currentUser && props.currentUser.isCampaignsAllowed ? (
        <Fragment>
          <Route path="/campaigns" component={CreateCampaignRouter}/>
          <Route path="/audiences" component={AudiencesRouter}/>
        </Fragment>
      ) : null
    }

    <Redirect exact from="/*" to="/dashboard"/>
  </Switch>
);
