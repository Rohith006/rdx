import TextField from "@mui/material/TextField";
import React, { useEffect, useRef, useState } from "react";
import Button from "./Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { v4 as uuid4 } from "uuid";
import {
  TuiForm,
  TuiFormGroup,
  TuiFormGroupContent,
  TuiFormGroupField,
  TuiFormGroupHeader,
} from "../tui/TuiForm";
import PropTypes from "prop-types";
import { asyncRemote, getError } from "../../../remote_api/entrypoint";
import ErrorsBox from "../../errors/ErrorsBox";
import TuiTagger from "../tui/TuiTagger";
import MenuItem from "@mui/material/MenuItem";
import BackTo from "../../../UI/BackTo/BackTo";
import { Tabs, Tab, TabPanel, TabList } from "react-web-tabs";
import Switch from "@mui/material/Switch";
export default function ConsentForm({
  id,
  name,
  description,
  enabled,
  revokable,
  default_value,
  auto_revoke,
  required,
  tags,
  onSaveComplete,
}) {
  const [consentType, setConsentType] = useState(name ? name : "");
  const [consentDescription, setConsentDescription] = useState(
    description ? description : ""
  );
  const [consentEnabled, setConsentEnabled] = useState(
    typeof enabled === "boolean" ? enabled : true
  );
  const [consentRequired, setConsentRequired] = useState(
    typeof revokable === "boolean" ? required : true
  );
  const [consentRevokable, setConsentRevokable] = useState(
    typeof revokable === "boolean" ? revokable : true
  );
  const [consentDefaultValue, setConsentDefaultValue] = useState(default_value);
  const [consentTags, setConsentTags] = useState(tags);
  const [consentAutoRevoke, setConsentAutoRevoke] = useState(auto_revoke || "");
  const [processing, setProcessing] = useState(false);
  const [consentTypeErrorMessage, setConsentTypeErrorMessage] = useState("");
  const [consentDescErrorMessage, setConsentDescErrorMessage] = useState("");
  const [error, setError] = useState(false);
  const [tabId, setTabID] = useState("one");

  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  const onSave = async () => {
    if (!consentType || !consentDescription) {
      if (consentType.length === 0) {
        setConsentTypeErrorMessage("Consent type can not be empty");
      } else {
        setConsentTypeErrorMessage("");
      }
      if (consentDescription.length === 0) {
        setConsentDescErrorMessage("Consent description can not be empty");
      } else {
        setConsentDescErrorMessage("");
      }
      return;
    }

    const payload = {
      id: id ? id : uuid4(),
      name: consentType,
      description: consentDescription,
      revokable: consentRevokable,
      default_value: consentDefaultValue,
      enabled: consentEnabled,
      auto_revoke: consentAutoRevoke,
      required: consentRequired,
      tags:
        consentTags && Array.isArray(consentTags) && consentTags.length > 0
          ? consentTags
          : ["General"],
    };

    setProcessing(true);

    try {
      const response = await asyncRemote({
        url: "/consent/type",
        method: "post",
        data: payload,
      });

      if (response?.data && mounted.current) {
        if (onSaveComplete) {
          onSaveComplete(payload);
        }
      }
    } catch (e) {
      if (e && mounted.current) {
        setError(getError(e));
        // todo error;
      }
    } finally {
      if (mounted.current) {
        setProcessing(false);
      }
    }
  };

  const handleTagChange = (values) => {
    setConsentTags(values);
  };

  const onChangeTab = (e) => {
    setTabID(e.target.value);
  };

  return (
    <TuiForm>
      <BackTo text="Consents" path="/setup/consents" />
      <Tabs className="card" defaultTab={tabId}>
        <TabList>
          <Tab type="button" onClick={onChangeTab} value="one" tabFor="one">
            Consent details
          </Tab>
          <Tab type="button" onClick={onChangeTab} value="two" tabFor="two">
            Settings
          </Tab>
        </TabList>
        <TabPanel tabId="one">
          <TuiFormGroup>
            {/* <TuiFormGroupHeader header="Consent description" /> */}
            <TuiFormGroupContent>
              <TuiFormGroupField
                header="Name"
                description="Type consent name. Be as descriptive as possible."
              >
                <TextField
                  variant="outlined"
                  // label="Consent type title"
                  value={consentType}
                  error={
                    typeof consentTypeErrorMessage !== "undefined" &&
                    consentTypeErrorMessage !== "" &&
                    consentTypeErrorMessage !== null
                  }
                  helperText={
                    <p className="helper_error">{consentTypeErrorMessage}</p>
                  }
                  onChange={(ev) => {
                    setConsentType(ev.target.value);
                  }}
                  fullWidth
                  size="small"
                  className="w-2/5"
                />
              </TuiFormGroupField>
              <TuiFormGroupField
                header="Description"
                description="Consent type description. Be as descriptive as possible."
              >
                <TextField
                  variant="outlined"
                  // label="Consent description"
                  multiline
                  rows={5}
                  value={consentDescription}
                  onChange={(ev) => {
                    setConsentDescription(ev.target.value);
                  }}
                  error={
                    typeof consentDescErrorMessage !== "undefined" &&
                    consentDescErrorMessage !== "" &&
                    consentDescErrorMessage !== null
                  }
                  helperText={
                    <p className="helper_error">{consentDescErrorMessage}</p>
                  }
                  fullWidth
                  size="small"
                  className="w-2/5"
                />
              </TuiFormGroupField>
            </TuiFormGroupContent>
          </TuiFormGroup>
          <div className="btn_group">
            <button
              type="button"
              onClick={() => {
                window.history.back();
              }}
              className="btn_cancel"
            >
              Cancel
            </button>
            <button
              value="two"
              type="button"
              className="btn_next"
              onClick={onChangeTab}
            >
              Next
            </button>
          </div>
        </TabPanel>
        <TabPanel tabId="two">
          <TuiFormGroup>
            {/* <TuiFormGroupHeader header="Settings" /> */}
            <TuiFormGroupContent>
              <TuiFormGroupField header="Default consent value">
                <div className="radio_btn-container mt-3">
                  <div
                    className="radio_btn-items"
                    onClick={(e) => setConsentDefaultValue(e.target.value)}
                  >
                    <input
                      className="radio_btn-item"
                      type="radio"
                      name="radio"
                      value="grant"
                      checked={consentDefaultValue === "grant"}
                    />
                    <label className="radio_btn-label" for="grant">
                      Grant
                    </label>
                  </div>
                  <div
                    className="radio_btn-items"
                    onClick={(e) => setConsentDefaultValue(e.target.value)}
                  >
                    <input
                      className="radio_btn-item"
                      type="radio"
                      name="radio"
                      value="deny"
                      checked={consentDefaultValue !== "grant"}
                    />
                    <label className="radio_btn-label" for="grant">
                      Deny
                    </label>
                  </div>
                </div>
                {/* <TextField
                  select
                  fullWidth
                  value={consentDefaultValue}
                  onChange={(e) => setConsentDefaultValue(e.target.value)}
                  // label="Default value"
                  variant="outlined"
                  size="small"
                  className="w-2/5"
                >
                  <MenuItem value="grant">Grant consent</MenuItem>
                  <MenuItem value="deny">Deny consent</MenuItem>
                </TextField> */}
              </TuiFormGroupField>
              <TuiFormGroupField
                header="Enable consent"
                description="Disabled consents will not be visible to user."
              >
                <div>
                  <Switch
                    checked={consentEnabled}
                    onChange={(e) => setConsentEnabled(e.target.checked)}
                  />
                  <span>
                    {consentEnabled === true ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </TuiFormGroupField>
              <TuiFormGroupField
                header="Can customer not agree to this consent type "
                description="Some consents are required for the site to work."
              >
                <FormControlLabel
                  style={{ marginLeft: 1, fontSize: "14px" }}
                  control={
                    <Checkbox
                      checked={consentRequired}
                      onChange={(e) => setConsentRequired(e.target.checked)}
                      name="enable"
                      color="primary"
                    />
                  }
                  label="Is this consent type required for the site to work?"
                />
              </TuiFormGroupField>
              <TuiFormGroupField
                header="Can customer revoke this consent "
                description="Most of the consents must should be revokable."
              >
                <FormControlLabel
                  style={{ marginLeft: 1 }}
                  control={
                    <Checkbox
                      checked={consentRevokable}
                      onChange={(e) => setConsentRevokable(e.target.checked)}
                      name="enable"
                      color="primary"
                    />
                  }
                  label="Is consent type to be revokable?"
                />
              </TuiFormGroupField>
              <TuiFormGroupField
                header="Auto revoke this consent "
                description="If you set this option the consent will revoke after defined time. e.g. +14 days"
              >
                <TextField
                  variant="outlined"
                  label="Auto revoke time"
                  value={consentAutoRevoke}
                  onChange={(ev) => {
                    setConsentAutoRevoke(ev.target.value);
                  }}
                  fullWidth
                  size="small"
                  className="w-2/5"
                />
              </TuiFormGroupField>
              <TuiFormGroupField
                header="Consent tags"
                description="Tag the consent type to group it into meaningful groups."
              >
                <TuiTagger tags={tags} onChange={handleTagChange} />
              </TuiFormGroupField>
            </TuiFormGroupContent>
          </TuiFormGroup>
          {/* {error && <ErrorsBox errorList={error} />} */}
          <div className="btn_group">
            <button
              type="button"
              onClick={() => {
                window.history.back();
              }}
              className="btn_cancel"
            >
              Back
            </button>
            <button
              value="two"
              type="button"
              className="btn_next"
              onClick={onSave}
            >
              Save
            </button>
          </div>
          {/* <Button
            label="Save"
            onClick={onSave}
            progress={processing}
            style={{ justifyContent: "center" }}
          /> */}
        </TabPanel>
      </Tabs>
    </TuiForm>
  );
}

ConsentForm.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  description: PropTypes.string,
  enabled: PropTypes.bool,
  tags: PropTypes.array,
  revokable: PropTypes.bool,
  default_value: PropTypes.string,
  auto_revoke: PropTypes.string,
  required: PropTypes.bool,
  onSaveComplete: PropTypes.func,
};
