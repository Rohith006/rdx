import React, {Component, Fragment} from 'react';
import {Switch, Route, Redirect} from 'react-router-dom';
import AdminRouter from './Admin';
import AccountManagerRouter from './AccountManager';
import AdvertiserRouter from './Advertiser';
import PublisherRouter from './Publisher';
import Sidebar from '../components/common/Sidebar';
import Footer from '../components/common/Footer';
import {ACCOUNT_MANAGER, ADMIN, ADVERTISER, OWNER, PUBLISHER} from '../constants/user';
import PreloadAdminDataContainer from '../containers/PreloadAdminDataContainer';
import PreloadManagerDataContainer from '../containers/PreloadManagerDataContainer';
import PreloadAdvertiserDataContainer from '../containers/PreloadAdvertiserDataContainer';
import AgreementPage from '../components/AgreementPage';
import PreloadPublisherDataContainer from '../containers/PreloadPublihserDataContainer';

class IndexRouter extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  getRoute() {
    const {currentUser} = this.props;
    if (!currentUser) {
      return;
    }
    if ([ADVERTISER, PUBLISHER].includes(currentUser.role) && !currentUser.isAcceptedAgreement) {
      return (
        <Fragment>
          <Route path="/agreement-page" component={AgreementPage}/>
          <Redirect to={'/agreement-page'}/>
        </Fragment>
      );
    }
    switch (currentUser.role) {
      case OWNER:
      case ADMIN: {
        return (
          <PreloadAdminDataContainer>
            <Route path="/" component={AdminRouter}/>
          </PreloadAdminDataContainer>
        );
      }
      case ACCOUNT_MANAGER: {
        return (
          <PreloadManagerDataContainer>
            <Route path="/" render={(props) => (
              <AccountManagerRouter {...props} currentUser={currentUser}/>
            )}/>
          </PreloadManagerDataContainer>
        );
      }
      case ADVERTISER: {
        return (
          <PreloadAdvertiserDataContainer currentUser={currentUser}>
            <Route path="/" render={(props) => (
              <AdvertiserRouter {...props} currentUser={currentUser}/>
            )}/>
          </PreloadAdvertiserDataContainer>
        );
      }
      case PUBLISHER: {
        return (
          <PreloadPublisherDataContainer>
            <Route path="/" component={PublisherRouter}/>
          </PreloadPublisherDataContainer>
        );
      }
      default:
        const styleIframe = {
          position: 'fixed',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
          border: 0,
        };
        return (
          <Route
            path="*"
            render={() => <iframe style={{...styleIframe}} src={`${__INTERNAL_API_URL__.replace('/rest', '')}/static/ubidex502.html`}/>}
          />);
    }
  }


  initialisePendo(currentUser){
    const {id, email, name, role, createdAt} = currentUser;
    pendo.initialize({
      visitor: {
          id,   // Required if user is logged in
          email,    // Recommended if using Pendo Feedback, or NPS Email
          full_name: name,
          role: role// Optional
      },

      account: {
          id, // Required if using Pendo Feedback
          name,// Optional
          creationDate: createdAt// Optional
      }
  });
  }

  componentDidMount(){
    if(this.props.currentUser!=={}){
      this.initialisePendo(this.props.currentUser)
    }
  }

  render() {
    const IndexRoute = this.getRoute();
    return (
      <div className="container">
        <Sidebar/>
        <div className="container_body">
          <main className="cover">
            <Switch>
              {IndexRoute}
            </Switch>
          </main>
          <Footer/>
        </div>
      </div>
    );
  }
}

export default IndexRouter;
