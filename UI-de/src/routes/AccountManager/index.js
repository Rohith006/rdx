import React from 'react';
import {Switch, Route, Redirect} from 'react-router-dom';
// Routes
import AudiencesRouter from '../Audiences';
import CampaignsRouter from '../Campaigns';
import SettingsRouter from '../Settings';
// Pages
import Dashboard from '../../components/Dashboard';
import ReportsPage from '../../components/ReportsPage';
import LogsPage from '../../components/LogsPage';
import AdvertisersPage from '../../components/AdvertisersPage';
import PublishersPage from '../../components/PublishersPage';
import UpdatePublisherPage from '../../components/PublishersPage/UpdatePublisherPage';
import CreatePublisherPage from '../../components/PublishersPage/CreatePublisherPage';
import CreateAdvertiserPage from '../../components/AdvertisersPage/CreateAdvertiserPage';
import UpdateAdvertiserPage from '../../components/AdvertisersPage/UpdateAdvertiserPage';
import MyAccount from '../../components/MyAccount';

export default (props) => (
  <Switch>
    {
      (props.currentUser.permissions.includes('ADVERTISERS') || props.currentUser.permissions.includes('PUBLISHERS')) && (
        <Route path="/dashboard" component={ Dashboard } />
      )
    }
    {
      props.currentUser.permissions.includes('ADVERTISERS') && (
        <Route exact path="/advertisers" component={ AdvertisersPage } />
      )
    }
    {
      props.currentUser.permissions.includes('ADVERTISERS') && (
        <Route exact path="/advertisers/:advertiserId/edit" component={ UpdateAdvertiserPage } />
      )
    }
    {
      props.currentUser.permissions.includes('ADVERTISERS') && (
        <Route exact path="/advertisers/create" component={ CreateAdvertiserPage } />
      )
    }
    {
      props.currentUser.permissions.includes('ADVERTISERS') && (
        <Route path="/campaigns" component={ CampaignsRouter } />
      )
    }
    {
      props.currentUser.permissions.includes('ADVERTISERS') && (
        <Route path="/audiences" component={AudiencesRouter}/>
      )
    }
    {
      props.currentUser.permissions.includes('PUBLISHERS') && (
        <Route exact path="/publishers" component={ PublishersPage } />
      )
    }
    {
      props.currentUser.permissions.includes('PUBLISHERS') && (
        <Route exact path="/publishers/:publisherId/edit" component={ UpdatePublisherPage } />
      )
    }
    {
      props.currentUser.permissions.includes('PUBLISHERS') && (
        <Route exact path="/publishers/create" component={ CreatePublisherPage } />
      )
    }
    {
      (props.currentUser.permissions.includes('ADVERTISERS') || props.currentUser.permissions.includes('PUBLISHERS')) && (
        <Route path="/reports" component={ ReportsPage } />
      )
    }
    {
      props.currentUser.permissions.includes('LOGS') && (
        <Route path="/logs" component={ LogsPage } />
      )
    }
    {
      props.currentUser.permissions.includes('ADVERTISERS') && (
        <Route path="/settings" component={SettingsRouter}/>
      )
    }

    <Route path="/account" component={MyAccount} />

    {/* Redirect */}
    {
      (props.currentUser.permissions.includes('ADVERTISERS') || props.currentUser.permissions.includes('PUBLISHERS')) ? (
          <Redirect exact from="/*" to="/dashboard"/>
      ) : (
          props.currentUser.permissions.includes('LOGS') ?
              <Redirect exact from="/*" to="/logs"/> :
              <Redirect exact from="/*" to="/account"/>
      )
    }
  </Switch>
);
