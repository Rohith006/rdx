import React from 'react';
import {Switch, Route, Redirect} from 'react-router-dom';
import SettingsPage from '../components/SettingsPage';
import CustomOptimizer from '../components/SettingsPage/CustomOptimizer';
// import NotFound from '../../components/NotFound';

export default () => (
  <Switch>
    <Route exact path="/settings" component={ SettingsPage }/>
    <Route path="/settings/custom" component={ CustomOptimizer }/>
    <Redirect exact from="/*" to="/dashboard"/>
  </Switch>
);
