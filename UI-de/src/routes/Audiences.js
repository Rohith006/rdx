import React from 'react';
import {Switch, Route} from 'react-router-dom';
import AudiencesPage from '../components/Audiences/AudiencePage/AudiencesPage';
import EditContainer from '../components/Audiences/EditContainer';
import CreateContainer from '../components/Audiences/CreateContainer';

export default () => (
  <Switch>
    <Route exact path="/audiences" component={AudiencesPage}/>
    <Route path="/audiences/create" component={CreateContainer} />
    <Route path="/audiences/:audienceId/edit" component={EditContainer}/>
    <Route path="*" component={ () => <div>Page not found</div> }/>
  </Switch>
);
