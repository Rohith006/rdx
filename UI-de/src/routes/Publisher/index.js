import React from 'react';
import {Switch, Route, Redirect} from 'react-router-dom';
import Dashboard from '../../components/Dashboard';
import ReportsPage from '../../components/ReportsPage';
import NotFound from '../../components/NotFound';
import MyAccount from '../../components/MyAccount';
import AgreementPage from '../../components/AgreementPage';
import ImpressionDetails from '../../components/ImpressionDetailsPage';
import ConversionDetails from '../../components/ConversionDetailsPage';

export default () => (
  <Switch>
    <Redirect exact from="/" to="/dashboard"/>
    <Route exact path="/dashboard" component={Dashboard}/>
    <Route path="/agreement-page" component={AgreementPage}/>
    <Route path="/account" component={MyAccount}/>
    <Route path="/reports" component={ReportsPage}/>
    <Route path="/conversion/:id" component={ConversionDetails}/>
    <Route path="/impression-info/:id" component={ImpressionDetails}/>
    <Redirect exact from="/*" to="/dashboard"/>
  </Switch>
);
