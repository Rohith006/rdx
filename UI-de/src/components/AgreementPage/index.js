import React, {Component, Fragment} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import ButtonRegular from '../UI/ButtonRegular';
import {acceptAgreement, logout} from '../../actions/auth';
import Overlay from '../common/Overlay';
import localization from '../../localization';

class AgreementPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isAcceptedAgreement: false,
    };

    this.setIsAcceptedAgreement = this.setIsAcceptedAgreement.bind(this);
    this.acceptAgreement = this.acceptAgreement.bind(this);
  }

  acceptAgreement() {
    const {currentUser: {id, role}, history} = this.props;
    this.props.actions.acceptAgreement({id, role}, history);
  }

  render() {
    const {actions, history} = this.props;
    return (
      <div className="agreement-page">
        <div className="agreement-page__container card card_body">
          <p>{localization.agreementPage.desc}</p>
          <span>You will not be able to use the platform until you accept the terms.</span>
          <div className="checkbox-control mt2 mb2">
            <input id="accept-label" required type="checkbox" onChange={this.setIsAcceptedAgreement}/>
            <label htmlFor="accept-label">
              <span className="checkbox-control__indicator"/>
              {localization.agreementPage.accept}
            </label>
          </div>
          <div className="agreement-page__submit-btn">
            <ButtonRegular color="btn light-blue" width="100px" disabled={!this.state.isAcceptedAgreement} onClick={this.acceptAgreement}>{localization.forms.accept}</ButtonRegular>
            <ButtonRegular color="btn light-blue ml2" width="120px" onClick={() => actions.logout(history)}>{localization.forms.signOut}</ButtonRegular>
          </div>
        </div>
      </div>

    );
  }

  setIsAcceptedAgreement(e) {
    this.setState({
      isAcceptedAgreement: e.target.checked,
    });
  }
}

const mapStateToProps = (state) => ({
  currentUser: state.auth.currentUser,
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    acceptAgreement,
    logout,
  }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(AgreementPage);
