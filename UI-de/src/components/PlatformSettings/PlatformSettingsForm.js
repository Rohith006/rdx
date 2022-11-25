import React from 'react'
import { Field, reduxForm } from 'redux-form'
import {
  Accordion,
  AccordionItem,
  AccordionItemPanel,
} from 'react-accessible-accordion'
// Application modules
import { TextField, ButtonRegular, CheckBoxField } from '../UI'
import { AccordionHeading } from '../UI/accordion'
import { normalizeNumber } from '../../utils/normalizers'

const PlatformSettingsForm = (props) => {
  return (
    <div className="platform-settings">
      <div className="card">

      <div className="card_header bordered account">
        <div className="subheading_cover">
          <h2 className="heading">Platform settings</h2>
        </div>
      </div>
      <form
        onSubmit={props.handleSubmit}
        className="setting"
      >
        <Field
          name="advertiserActivation"
          title="Advertiser activation is required"
          component={CheckBoxField}
          style={{ marginLeft: 20 }}
        />
        <Field
          name="publisherActivation"
          title="Publisher activation is required"
          component={CheckBoxField}
        />

        <div className="form-group_row">
          <div>
            <div className="text">
              <p>Global payout</p>

              <div className="tooltip info">
                <span className="tooltiptext">
                  Default global publishers payout %
                </span>
              </div>
            </div>

            <div className="input-md">
              <Field
                type="text"
                name="globalPayout"
                // title="Global payout"
                component={TextField}
                normalize={normalizeNumber}
              />
            </div>
          </div>
        </div>
        <div className="form_submit-btn">
          <span
            style={{ paddingTop: 10 }}
            className="btn white"
            onClick={() => window.history.back()}
          >
            Cancel
          </span>
          <ButtonRegular
            width="115px"
            height="40px"
            type="submit"
            color="primary-red"
          >
            Save
          </ButtonRegular>
        </div>
      </form>
      </div>
    </div>
  )
}

export default reduxForm({
  form: 'PlatformSettingsForm',
})(PlatformSettingsForm)
