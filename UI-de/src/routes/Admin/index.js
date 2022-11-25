import React from 'react';
import {Switch, Route, Redirect} from 'react-router-dom';
// Routes
import AudiencesRouter from '../Audiences';
import CampaignsRouter from '../Campaigns';
import SettingsRouter from '../Settings';
// Pages
import Dashboard from '../../components/Dashboard/index';
import ReportsPage from '../../components/ReportsPage';
import AdvertisersPage from '../../components/AdvertisersPage';
import PublishersPage from '../../components/PublishersPage';
import UsersPage from '../../components/UsersPage';
import LogsPage from '../../components/LogsPage';
import UserEditorPage from '../../components/UsersPage/UserEditorPage';
import AddUserPage from '../../components/UsersPage/AddUserPage';
import UpdatePublisherPage from '../../components/PublishersPage/UpdatePublisherPage';
import CreatePublisherPage from '../../components/PublishersPage/CreatePublisherPage';
import PlatformSettingsPage from '../../components/PlatformSettings';
import CreateAdvertiserPage from '../../components/AdvertisersPage/CreateAdvertiserPage';
import UpdateAdvertiserPage from '../../components/AdvertisersPage/UpdateAdvertiserPage';
import ConversionDetails from '../../components/ConversionDetailsPage';
import ImpressionDetails from '../../components/ImpressionDetailsPage';
import ClickDetails from '../../components/ClickDetailsPage';
import MyAccount from '../../components/MyAccount';

export default () => (
  <Switch>
    <Redirect exact from="/" to="/dashboard" />
    <Route exact path="/dashboard" component={Dashboard}/>
    <Route exact path="/advertisers" component={AdvertisersPage}/>
    <Route exact path="/advertisers/create" component={CreateAdvertiserPage}/>
    <Route exact path="/advertisers/:advertiserId/edit" component={UpdateAdvertiserPage}/>
    <Route exact path="/publishers" component={PublishersPage}/>
    <Route exact path="/publishers/create" component={CreatePublisherPage}/>
    <Route exact path="/publishers/:publisherId/edit" component={UpdatePublisherPage}/>
    <Route path="/campaigns" component={CampaignsRouter}/>
    <Route path="/audiences" component={AudiencesRouter}/>
    <Route path="/account" component={MyAccount}/>
    <Route path="/reports" component={ReportsPage}/>
    <Route path="/settings" component={SettingsRouter}/>
    <Route exact path="/users" component={UsersPage}/>
    <Route path="/users/create" component={AddUserPage}/>
    <Route path="/users/:id/edit" component={UserEditorPage}/>
    <Route path="/logs" component={LogsPage}/>
    <Route path="/platform-settings" component={PlatformSettingsPage}/>
    <Route path="/conversion/:id" component={ConversionDetails}/>
    <Route path="/click-info/:id" component={ClickDetails}/>
    <Route path="/impression/:id" component={ImpressionDetails}/>
    <Redirect exact from="/*" to="/dashboard"/>
  </Switch>
);
