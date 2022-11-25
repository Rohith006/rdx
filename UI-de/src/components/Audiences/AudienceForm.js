import React, { Fragment, useState } from "react";
import { Accordion } from "react-accessible-accordion";
import { connect } from "react-redux";
import Collect from "./FormComponents/Collect";
import Retargeting from "./FormComponents/Retargeting";
import { Field, reduxForm } from "redux-form";
import SaveCancel from "../UI/SaveCancel";
import ButtonRegular from "../UI/ButtonRegular";
import { NotificationManager } from "react-notifications";

import localization from "../../localization";
import BackTo from "../UI/BackTo";
import {
  getValueSelector,
  takeCampaignsDropdowns,
  takeAdvertisersDropdowns,
} from "./Utils";

import { Link } from "react-router-dom";
import { arrayChecker } from "../../utils/validatorUtils";

import { Tabs, Tab, TabPanel, TabList } from "react-web-tabs";
var firstError
const onSubmitFail =  (errors) => {
  if (errors) {
    firstError = Object.keys(errors);
    console.log('firstError', firstError)
    const el = document.querySelector(`[name="${firstError}"]`);
    NotificationManager.error(`Must fill required fields ${firstError}`)
    const position =
      el &&
      el.getBoundingClientRect().top + document.documentElement.scrollTop;
    const offset = 50;
    window.scrollTo({ top: position - offset, behavior: "smooth" });
  }
}

function AudienceForm({
  isEdit, 
  handleSubmit,
  change,
  campaigns,
  advertisers,
  formData,
}) {
  const btnName = isEdit ? localization.forms.save : localization.forms.create;
  const [tabID, setTabID] = useState("one");

  const changeTab = (tab) => {
    setTabID(tab.target.value);
  };

  const errArray1 = ['name']
  const errArray2 = ['advertiserId']
  const checkForm1 = arrayChecker(errArray1, firstError)
  const checkForm2 = arrayChecker(errArray2, firstError)

  return (
    <Fragment>
      <BackTo path={"/audiences"} text="audience" />

      <form className="form card audience" onSubmit={handleSubmit}>
        <Tabs defaultTab={tabID}>
          <TabList>
            <Tab tabFor="one" type="button">
            <div style = {{color: `${checkForm1 == true ? 'red' : 'black'}`}} >
              Retarget audience
            </div>
            </Tab>
            <Tab tabFor="two" type="button">
            <div style = {{color: `${checkForm1 == true ? 'red' : 'black'}`}} >
              Collect audience
            </div>
            </Tab>
          </TabList> 

          <Accordion preExpanded={["1", "2"]} allowMultipleExpanded>
            <TabPanel type="button" tabId="one">
              <Retargeting change={change} formData={formData} />
              <div className="Btn_Container" style={{ marginTop: 150 }}>
                <Link
                  to="/audiences"
                  className="btn white"
                  style={{ paddingTop: 10 }}
                >
                  {localization.forms.cancel}
                </Link>
                <button
                  onClick={changeTab}
                  value="two"
                  type="button"
                  className="btn neutral"
                >
                  Next
                </button>
              </div>
            </TabPanel>
            <TabPanel type="button" tabId="two">
              <Collect
                change={change}
                campaigns={campaigns}
                advertisers={advertisers}
                formData={formData}
              />
              <div className="form_submit-btn" style={{ marginTop: 170 }}>
                <Link
                  to="/audiences"
                  className="btn white"
                  style={{ paddingTop: 10 }}
                >
                  {localization.forms.cancel}
                </Link>
                <ButtonRegular color="neutral" width=" 115px" height="40px">
                  {localization.forms.save}
                </ButtonRegular>
              </div>
            </TabPanel>
          </Accordion>
        </Tabs>
      </form>
    </Fragment>
  );
}

export default connect((state, props) => {
  return {
    formData: getValueSelector(state, props.isEdit),
    campaigns: takeCampaignsDropdowns(state),
    advertisers: takeAdvertisersDropdowns(state),
  };
}, null)(
  reduxForm({
    form: "AudienceForm",
    fields: Field,
    enableReinitialize: true,
    onSubmitFail,
  })(AudienceForm)
);
