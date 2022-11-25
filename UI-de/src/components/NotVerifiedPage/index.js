import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import * as userConstants from '../../constants/user';
import {PUBLISHER, ADVERTISER} from '../../constants/user';
import axios from 'axios';
import {NotificationManager} from 'react-notifications';
import Overlay from '../common/Overlay';
import DisplayCheck from '../../permissions';
import localization from '../../localization';

class NotVerifiedPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      restUrl: __INTERNAL_API_URL__,
    };

    this.renderMessage = this.renderMessage.bind(this);
  }

  render() {
    return (
      <div className='flex align-center justify-center h70'>
        <div className="not-verified-page card ">
          <div className="not-verified-page__container card_body">
            {this.renderMessage()}
            <br/>
            <DisplayCheck roles={[ADVERTISER]}>
              <a href="#" onClick={this.resendActivation}>{localization.verify.resend}</a>
            </DisplayCheck>
          </div>
        </div>
      </div>
    );
  }

  resendActivation(e) {
    e.preventDefault();
    axios.get('/user/send-activation')
        .then(({data}) => {
          if (data.result === 'success') {
            NotificationManager.success(localization.verify.activation);
          }
        });
  };

  renderMessage() {
    let html;
    switch (this.props.auth.currentUser.status) {
      case userConstants.PENDING:
        html = this.props.auth.currentUser.role === PUBLISHER ?
                    localization.verify.verified : localization.verify.activate;
        break;
      case userConstants.REJECTED:
        html = localization.verify.reject;
        break;
      case userConstants.PAUSED:
        html = localization.verify.banned;
        break;
      default:
        html = '';
    }

    return html;
  }
}

const mapStateToProps = ({auth}) => ({auth});

NotVerifiedPage.propTypes = {
  auth: PropTypes.object,
};

export default connect(mapStateToProps, null)(NotVerifiedPage);
