import React, {Component, Fragment} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {SubmissionError} from 'redux-form';
import CreatePublisherForm from '../forms/CreatePublisherForm';
import {createPublisher} from '../../actions/users';
import {PUBLISHER, MEDIA_BUYING_TEAM, PENDING} from '../../constants/user';
import PropTypes from 'prop-types';
import 'react-notifications/lib/notifications.css';
import {ENGAGE} from '../../constants/campaigns';
import Link from 'react-router-dom/es/Link';
import localization from '../../localization';
import {ADM} from '../../constants/common';

class CreatePublisherPage extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(formData) {
    const {auth: {currentUser: {role}}} = this.props;
    delete formData.confirmPassword;
    formData.role = PUBLISHER;
    formData.status = PENDING;
    formData.channel = [formData.channel];

    Object.keys(formData).map((field) => {
      const value = formData[field];
      if (value && typeof value === 'string' || value instanceof String) {
        formData[field] = value.trim();
      }
    });

    return this.props.actions.createPublisher(formData, this.props.history)
        .then((res) => {
          this.props.history.push(`/publishers`);
        })
        .catch((err) => {
          const errors = err.response.data.errors;

          if (errors) {
            const error = {};
            errors.forEach((err) => {
              error[err.path] = err.message;
            });
            throw new SubmissionError(error);
          }
        });
  }

  render() {
    const {platformSettings} = this.props;
    return (
      <Fragment>
        {
          !_.isEmpty(platformSettings) ?
            <div className="publisher-page">
              <Link to={'#'} className="go-back_link"
                onClick={this.props.history.goBack}>{localization.publishers.goBack}</Link>
              <CreatePublisherForm
                action={'create'}
                onSubmit={this.handleSubmit}
                countries={this.props.countries}
                {...this.props}
                initialValues={{
                  location: 'Usa',
                  payout: platformSettings.userActivation.globalPayout || 65,
                  isEnableRTB: true,
                  protocolType: "oRTB",
                  isEnableDirectPublisher: false,
                  adType: ['ALL'],
                  paymentsWith: 'adm',
                  tmax: 200,
                  trafficType: 'ALL',
                  bidType: 'CPM',
                  auctionType: 'FIRST PRICE',
                }}
              />
            </div> :
            null
        }
      </Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  managers: state.users.managers,
  countries: state.countries,
  platformSettings: state.platformSettings,
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    createPublisher,
  }, dispatch),
});

CreatePublisherPage.propTypes = {
  actions: PropTypes.object,
};

export default connect(mapStateToProps, mapDispatchToProps)(CreatePublisherPage);
