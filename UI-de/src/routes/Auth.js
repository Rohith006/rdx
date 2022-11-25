import React from 'react';
import {Switch, Route, Redirect} from 'react-router-dom';
import SignInPage from '../components/Auth/SignInPage';
import ForgotPasswordPage from '../components/Auth/ForgotPasswordPage';
import UpdatePasswordPage from '../components/Auth/UpdatePasswordPage';
import NotFound from '../components/NotFound';
import SignUpContainer from '../containers/SignUpContainer';
import ThankYouPage from '../components/InfoPage/ThankYouPage';
import Message from '../components/UI/Message';
import ActivationSuccess from '../components/InfoPage/ActivationSuccess';

export default () => (
  <Switch>
    <Route exact path='/' component={SignInPage}/>
    <Route path="/login" component={SignInPage}/>
    <Route path="/sign-up" component={SignUpContainer}/>
    <Route path="/thank-you-page" component={ThankYouPage}/>
    <Route path="/activation/success" component={ActivationSuccess}/>
    <Route path="/message" component={Message}/>
    <Route path="/forgot-password" component={ForgotPasswordPage}/>
    <Route path="/update-password/:restoreKey" component={UpdatePasswordPage}/>
    <Redirect exact from="/*" to="/login"/>
  </Switch>
);
