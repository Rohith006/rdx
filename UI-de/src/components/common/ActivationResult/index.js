import React, {Component, Fragment} from 'react';
import Overlay from '../Overlay';
import localization from '../../../localization';

class ActivationResult extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const qwe = 1;
    return (
      <Fragment>
        <Overlay/>
        <div className="not-verified-page">
          <div className="not-verified-page__container card_body">
            {this.renderMessage()}
          </div>
        </div>
      </Fragment>

    );
  }

  renderMessage() {
    switch (this.props.match.params.result) {
      case 'expired':
        return localization.activationResult.expired;
      case 'success':
        return localization.activationResult.activated;
      case 'broken':
        return localization.activationResult.broken;
      default:
        return '';
    }
  }
}

export default ActivationResult;
