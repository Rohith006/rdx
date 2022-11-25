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
import JsonEditor from "../editors/JsonEditor";
import TuiSelectEventType from "../tui/TuiSelectEventType";
import BackTo from "../../../UI/BackTo/BackTo";
import { Tabs, Tab, TabPanel, TabList } from "react-web-tabs";
import Switch from "@mui/material/Switch";
export default function EventValidationForm({
  id,
  name: validationName,
  description: validationDescription,
  enabled: validationEnabled,
  validation,
  event_type: validationEventType,
  tags: validationTags,
  onSaveComplete,
}) {
  const [name, setName] = useState(validationName || "");
  const [description, setDescription] = useState(validationDescription || "");
  const [validationSchema, setValidationSchema] = useState(
    validation ? JSON.stringify(validation, null, "  ") : null
  );
  const [enabled, setEnabled] = useState(validationEnabled || false);
  const [eventType, setEventType] = useState(
    validationEventType
      ? {
          id: validationEventType,
          name: validationEventType,
        }
      : null
  );
  const [tags, setTags] = useState(validationTags || []);

  const [processing, setProcessing] = useState(false);
  const [nameErrorMessage, setNameErrorMessage] = useState("");
  const [descErrorMessage, setDescErrorMessage] = useState("");
  const [validationErrorMessage, setValidationErrorMessage] = useState("");
  const [tabId, setTabID] = useState("one");
  const [error, setError] = useState(false);

  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const onSave = async () => {
    try {
      if (validationSchema === null) {
        throw new Error("Validation schema can not be empty");
      }
      validation = JSON.parse(validationSchema);
      setValidationErrorMessage("");
    } catch (e) {
      setValidationErrorMessage(e.toString());
      return;
    }

    if (!name || !description) {
      if (name.length === 0) {
        setNameErrorMessage("Name can not be empty");
      } else {
        setNameErrorMessage("");
      }
      if (description.length === 0) {
        setDescErrorMessage("Description can not be empty");
      } else {
        setDescErrorMessage("");
      }
      return;
    }

    try {
      const payload = {
        id: id ? id : uuid4(),
        name: name,
        description: description,
        validation: validation,
        enabled: enabled,
        event_type: eventType.id,
        tags:
          tags && Array.isArray(tags) && tags.length > 0 ? tags : ["General"],
      };

      setProcessing(true);

      const response = await asyncRemote({
        url: "/event/validation-schema",
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
      }
    } finally {
      if (mounted.current) {
        setProcessing(false);
      }
    }
  };

  const handleTagChange = (values) => {
    setTags(values);
  };

  const onChangeTab = (e) => {
    setTabID(e.target.value);
  };

  return (
    <TuiForm>
      <BackTo text="Validations" path="/setup/validations" />
      <Tabs className="card" defaultTab={tabId}>
        <TabList>
          <Tab type="button" onClick={onChangeTab} value="one" tabFor="one">
            Event validation schema details
          </Tab>
          <Tab type="button" onClick={onChangeTab} value="two" tabFor="two">
            Settings
          </Tab>
        </TabList>
        <TabPanel tabId="one">
          <TuiFormGroup>
            {/* <TuiFormGroupHeader header="Event validation schema description" /> */}
            <TuiFormGroupContent>
              <TuiFormGroupField
                header="Name"
                description="Type validation schema name. Be as descriptive as possible."
              >
                <TextField
                  variant="outlined"
                  // label="Validation schema name"
                  value={name}
                  error={
                    typeof nameErrorMessage !== "undefined" &&
                    nameErrorMessage !== "" &&
                    nameErrorMessage !== null
                  }
                  helperText={nameErrorMessage}
                  onChange={(ev) => {
                    setName(ev.target.value);
                  }}
                  fullWidth
                  size="small"
                  className="w-2/5"
                />
              </TuiFormGroupField>
              <TuiFormGroupField
                header="Description"
                description="Validation schema description. Be as descriptive as possible."
              >
                <TextField
                  variant="outlined"
                  // label="Validation schema description"
                  multiline
                  rows={5}
                  value={description}
                  onChange={(ev) => {
                    setDescription(ev.target.value);
                  }}
                  error={
                    typeof descErrorMessage !== "undefined" &&
                    descErrorMessage !== "" &&
                    descErrorMessage !== null
                  }
                  helperText={descErrorMessage}
                  fullWidth
                  size="small"
                  className="w-2/5"
                />
              </TuiFormGroupField>
              <TuiFormGroupField
                header="Validation tags"
                description="Tag the validation schema to group it into meaningful groups."
              >
                <TuiTagger tags={tags} onChange={handleTagChange} />
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
            {/* <TuiFormGroupHeader header="Validation settings" /> */}
            <div className="flex justify-between">
              <div className="w-2/5">
                <TuiFormGroupContent>
                  <TuiFormGroupField
                    header="Event type"
                    description="Type event-type to apply validation-schema on the event.
                                   Validation schemas are bind to event-types. If you change the event type on
                                   existing validation schema then new validation-schema will be created."
                  >
                    <TuiSelectEventType
                      value={eventType}
                      onSetValue={setEventType}
                    />
                  </TuiFormGroupField>
                  <TuiFormGroupField
                    header="Enable validation"
                    description="Disabled validation schemas will not be triggered."
                  >
                    <div>
                      <Switch
                        checked={enabled}
                        onChange={(e) => setEnabled(e.target.checked)}
                      />
                      <span>{enabled === true ? "Enabled" : "Disabled"}</span>
                    </div>
                  </TuiFormGroupField>
                </TuiFormGroupContent>
              </div>
              <div className="w-2/5">
                <TuiFormGroupField
                  header="JSON-schema validation"
                  description="Type the validation in JSON-schema. Please refer to documentation for the format of JSON-schema."
                >
                  <fieldset
                    style={{
                      borderColor: validationErrorMessage ? "red" : "#ccc",
                    }}
                  >
                    <legend
                      style={{ color: validationErrorMessage ? "red" : "#aaa" }}
                    >
                      JSON-schema validation
                    </legend>
                    <JsonEditor
                      value={validationSchema}
                      onChange={setValidationSchema}
                    />
                    {validationErrorMessage && (
                      <div style={{ color: "red" }}>
                        {validationErrorMessage}
                      </div>
                    )}
                  </fieldset>
                </TuiFormGroupField>
              </div>
            </div>
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

EventValidationForm.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  description: PropTypes.string,
  enabled: PropTypes.bool,
  tags: PropTypes.array,
  onSaveComplete: PropTypes.func,
};
