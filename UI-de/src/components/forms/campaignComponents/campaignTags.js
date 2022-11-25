import React, { Fragment } from "react";
import TagsDropdown from "./TagsDropdown";

export default function CampaignTags(props) {
  return (
    <Fragment>
      <div className="form-group1">
        <p className="form__text-field__name">Campaign labels</p>
        <div className="form-group1_row1">
          <TagsDropdown {...props} />
        </div>
      </div>
    </Fragment>
  );
}
