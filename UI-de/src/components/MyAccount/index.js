import React, { Fragment, useCallback } from 'react'
import { bindActionCreators } from 'redux'
import { connect, useDispatch } from 'react-redux'
import { generatePublisherKey } from '../../actions/auth'
import DisplayCheck from '../../permissions'
import { PUBLISHER, ADVERTISER } from '../../constants/user'
import localization from '../../localization'
import ApiKeys from './apiKeys'
import ApiIntegration from './publisher/ApiIntegration'

const MyAccount = (props) => {
  const { currentUser, billingDetails } = props

  const dispatch = useDispatch()

  const onGenerateApiKey = useCallback(async (e) => {
    dispatch(generatePublisherKey())
  }, [])

  return (
    <Fragment>
      <div className="account_conatiner">
        <div className="card">
          <div className="card_header bordered account">
            <div className="subheading_cover">
              <h2 className="heading">{localization.account.title}</h2>
            </div>
          </div>

          {/* <div className="card_body account_section">
            <div className="account_img-cover">
              <div className="account_img">
                <span>{currentUser.name.substring(0, 2).toUpperCase()}</span>
                <img src="/assets/images/no_avatar.jpg" alt="" />
              </div>
              <span className="link disabled">Change photo</span>
            </div>
          </div> */}
          <div className="card_body account_section">
            <div className="card_body-item">
              <div className="form-group">
                <div className="form-group_label">
                  {localization.account.name}
                </div>
                <div className="form-group_field">
                  <div className="text-input">
                    <span>{currentUser.name}</span>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <div className="form-group_label">
                  {localization.account.email}
                </div>
                <div className="form-group_field">
                  <div className="text-input">
                    <span>{currentUser.email}</span>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <div className="form-group_label">
                  {localization.account.role}
                </div>
                <div className="form-group_field">
                  <div className="text-input">
                    <span>{currentUser.role}</span>
                  </div>
                </div>
              </div>
              <div>
                <DisplayCheck roles={[PUBLISHER]}>
                  <ApiIntegration
                    {...props}
                    generateApiKey={onGenerateApiKey}
                  />
                </DisplayCheck>
              </div>
              <div>
                <DisplayCheck roles={[ADVERTISER]}>
                  <ApiKeys currentUser={currentUser} />
                </DisplayCheck>
              </div>
              <DisplayCheck roles={[ADVERTISER]}>
              {billingDetails && billingDetails.isCorporation &&(
              <div className="form-group">
                  <div className="form-group_label">
                  <div className="state-indicator">
                          <span className="nowrap">
                            {localization.account.corporation}
                          </span>
                        </div>
                    </div>
                  {/* orporation check box */}
                  <div className="form-group_field">
                    <div className="checkbox-control">
                      <input
                        type="checkbox"
                        id="8"
                        name=""
                        value=""
                        checked={billingDetails.isCorporation}
                      />
                      <label htmlFor="8">
                        <div className="checkbox-control__indicator" />
                        
                      </label>
                    </div>
                  </div>
                </div>)}
              </DisplayCheck>
            </div>
          </div>
        </div>
        <DisplayCheck roles={[ADVERTISER]}>
          {/* <ApiKeys currentUser={currentUser} /> */}
          <div className="enabled">
            {billingDetails && billingDetails.isCorporation ? (
              <Fragment>
                <div className="card">
                  <div className="card_header bordered account">
                    <div className="subheading_cover">
                      <h2 className="heading">
                        {localization.account.address}
                      </h2>
                    </div>
                  </div>
                  <div className="card_body account_section">
                    <div className="card_body-item">
                      <div className="form-group">
                        <div className="form-group_label">
                          {localization.account.companyName}:
                        </div>
                        <div className="form-group_field">
                          <span>{billingDetails.companyName}</span>
                        </div>
                      </div>
                      <div className="form-group">
                        <div className="form-group_label">
                          {localization.account.billingAddress}:
                        </div>
                        <div className="form-group_field">
                          <span>{billingDetails.companyAddress}</span>
                        </div>
                      </div>
                      <div className="form-group">
                        <div className="form-group_label">
                          {localization.account.city}:
                        </div>
                        <div className="form-group_field">
                          <span>{billingDetails.companyCity}</span>
                        </div>
                      </div>
                      <div className="form-group">
                        <div className="form-group_label">
                          {localization.account.country}:
                        </div>
                        <div className="form-group_field">
                          <span>{billingDetails.companyCountry}</span>
                        </div>
                      </div>
                      <div className="form-group">
                        <div className="form-group_label">
                          {localization.account.zipcode}:
                        </div>
                        <div className="form-group_field">
                          <span>{billingDetails.companyZipCode}</span>
                        </div>
                      </div>
                      <div className="form-group">
                        <div className="form-group_label">
                          {localization.account.vatTax}:
                        </div>
                        <div className="form-group_field">
                          <span>{billingDetails.taxId}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Fragment>
            ) : (
              <Fragment>
                <div className="card">
                  <div className="card_header bordered account">
                    <div className="subheading_cover">
                      <h2 className="heading">
                        {localization.account.address_details}{' '}
                      </h2>
                    </div>
                  </div>
                  <div className="card_body account_section">
                    <div className="card_body-item">
                      <div className="form-group account">
                        <div className="form-group_label">
                          {localization.account.address_details}
                        </div>
                        <div className="form-group_field">
                          <span>
                            {billingDetails && billingDetails.address}
                          </span>
                        </div>
                      </div>
                      <div className="form-group">
                        <div className="form-group_label">
                          {localization.account.city}:
                        </div>
                        <div className="form-group_field">
                          <span>{billingDetails && billingDetails.city}</span>
                        </div>
                      </div>
                      <div className="form-group">
                        <div className="form-group_label">
                          {localization.account.country}:
                        </div>
                        <div className="form-group_field">
                          <span>
                            {billingDetails && billingDetails.country}
                          </span>
                        </div>
                      </div>
                      <div className="form-group">
                        <div className="form-group_label">
                          {localization.account.zipcode}:
                        </div>
                        <div className="form-group_field">
                          <span>
                            {billingDetails && billingDetails.zipCode}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Fragment>
            )}
          </div>
        </DisplayCheck>
      </div>
    </Fragment>
  )
}

const mapStateToProps = (state) => ({
  currentUser: state.auth.currentUser,
  initialValues: {
    role: state.auth.currentUser.role,
    apiKey: state.auth.currentUser.apiKey,
  },
  billingDetails: state.auth.billingDetails,
})

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(
    {
      generatePublisherKey,
    },
    dispatch,
  ),
})

export default connect(mapStateToProps, mapDispatchToProps)(MyAccount)
