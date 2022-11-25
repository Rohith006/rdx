import React, { Fragment } from "react";
import localization from "../../../../localization";
import { Field } from "redux-form";

const FormInfo = (props) => {
  const { renderField } = props;
  return (
    <Fragment>
      <Field
        name="name"
        component={renderField}
        type="text"
        label={localization.forms.name}
      />
      <Field
        name="password"
        component={renderField}
        type="password"
        label={localization.forms.password}
      />
      <Field
        name="skype"
        component={renderField}
        type="text"
        label={localization.users.form.skype}
      />
    </Fragment>
  );
};

export default FormInfo;
