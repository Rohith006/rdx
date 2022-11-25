import React, { Fragment } from 'react';
import localization from '../../localization';
import { Tabs, Tab, TabPanel, TabList } from 'react-web-tabs';
import LeftSideFormUser from './UserFormComponents/LeftSideFormUser';
import RightSideFormUser from './UserFormComponents/RightSideFormUser';
import AllowRules from './UserFormComponents/AllowRules';
import SaveCancel from '../UI/SaveCancel';

export default (props) => {
  const { handleSubmit, formTitle, isEdit } = props;
  const btnName = isEdit ? localization.forms.save : localization.forms.create;
  return (
    <Fragment>
      <form onSubmit={handleSubmit} className="form card">
        <Tabs
          defaultTab="one"
        >
          <TabList>
            <Tab type="button" tabFor="one">{formTitle}</Tab>
          </TabList>
          <TabPanel type="button" tabId="one">
            <div className="form_body users userContainer">
              <div className="flex xxs-wrap lg-nowrap">
                <LeftSideFormUser {...props} />
                <RightSideFormUser {...props} />
              </div>
            </div>
            <hr className="userLine"></hr>
            <div>
              <AllowRules {...props} />
            </div>
            <SaveCancel link="/users" name={btnName} />
          </TabPanel>
        </Tabs>
      </form>
    </Fragment>
  );
};

