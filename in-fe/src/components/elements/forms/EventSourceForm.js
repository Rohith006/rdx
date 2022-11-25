import { v4 as uuid4 } from "uuid";
import React, { useEffect, useState } from "react";
import { request } from "../../../remote_api/uql_api_endpoint";
import { asyncRemote, getError } from "../../../remote_api/entrypoint";
import {
  TuiForm,
  TuiFormGroup,
  TuiFormGroupContent,
  TuiFormGroupField,
} from "../tui/TuiForm";
import DisabledInput from "./inputs/DisabledInput";
import TuiSelectEventSourceType from "../tui/TuiSelectEventSourceType";
import TextField from "@mui/material/TextField";
import Switch from "@mui/material/Switch";
import TuiTagger from "../tui/TuiTagger";
import PropTypes from "prop-types";
import ErrorsBox from "../../errors/ErrorsBox";
import Chip from "@mui/material/Chip";
import BackTo from "../../../UI/BackTo/BackTo";
import { Tabs, Tab, TabPanel, TabList } from "react-web-tabs";
import ConnectorFlow from "../../../UI/ConnectorFlow/ConnectorFlow";

const EventSourceForm = ({ value, style, doubleBack, onClose }) => {
  if (!value) {
    value = {
      id: uuid4(),
      name: "",
      type: null,
      description: "",
      enabled: false,
      transitional: false,
      tags: [],
      groups: [],
    };
  }
  const [enabledSource, setEnabledSource] = useState(value?.enabled);
  const [transitional, setTransitional] = useState(value?.transitional);
  const [type, setType] = useState(null); // It is set in useEffects after the types are loaded
  const [name, setName] = useState(value?.name);
  const [id, setId] = useState(value?.id);
  const [tags, setTags] = useState(value?.tags);
  const [groups, setGroups] = useState(value?.groups);
  const [description, setDescription] = useState(value?.description);
  const [errorTypeMessage, setTypeErrorMessage] = useState("");
  const [errorNameMessage, setNameErrorMessage] = useState("");
  const [processing, setProcessing] = useState(false);
  const [errors, setError] = useState(null);
  const [credentialTypes, setCredentialTypes] = useState({});
  const [tabId, setTabID] = useState("one");

  const getIdNameFromType = (type, types) => {
    if (type in types) {
      return { id: type, name: types[type]["name"] };
    }
    return { id: type, name: type };
  };

  useEffect(() => {
    request(
      { url: "/event-sources/type/configuration" },
      () => {},
      () => {},
      (response) => {
        if (response) {
          setCredentialTypes(response.data.result);
          // Original type value is an id  e.g "aws", but "type" state is and object with id and name,
          // e.g {name" "AWS credentials", id: "aws"}
          // It must be set after the available list of event sources are loaded.
          setType(getIdNameFromType(value?.type, response.data.result));
          // setTags(getIdTagsFromType(value?.type, response.data.result));
        }
      }
    );
  }, []); // todo: setting value here make infinite request

  const handleSubmit = async () => {
    if (!name || name.length === 0 || !type?.name) {
      if (!name || name.length === 0) {
        setNameErrorMessage("Source name can not be empty");
      } else {
        setNameErrorMessage("");
      }

      if (!type?.name) {
        setTypeErrorMessage("Source type can not be empty");
      } else {
        window.animate({ scrollTop: 15 }, "slow");
        setTypeErrorMessage("");
      }

      return;
    }

    setProcessing(true);

    try {
      const response = await asyncRemote({
        url: "/event-source",
        method: "POST",
        data: {
          id: !id ? uuid4() : id,
          name: name,
          description: description,
          type: type.id, // Save only type id not the whole object.
          enabled: enabledSource,
          transitional: transitional,
          tags: tags,
          groups: groups,
        },
      });

      await asyncRemote({
        url: "/event-sources/refresh",
        method: "GET",
      });

      if (response.status === 404) {
        setError(response.data);
      } else {
        window.history.back();
        if (onClose) {
          onClose(response.data);
        }
      }
    } catch (e) {
      setProcessing(false);
      setError(getError(e));
    }
  };

  const handleTypeChange = (type) => {
    setType(type);
    if (type?.id in credentialTypes) {
      const template = credentialTypes[type?.id];
      setTags(template?.tags);
    }
  };

  const onChangeTab = (e) => {
    setTabID(e.target.value);
  };

  return (
    <>
      <BackTo text="Events" path="/setup/events_" />
      <TuiFormGroup>
        <Tabs className="card" defaultTab={tabId}>
          <TabList>
            <Tab onClick={onChangeTab} value="one" tabFor="one">
              Event configuration
            </Tab>
            <Tab onClick={onChangeTab} value="two" tabFor="two">
              Event description
            </Tab>
          </TabList>
          <TabPanel tabId="one">
            <TuiForm style={style} id="modal_id">
              {errors && <ErrorsBox errorList={errors} />}
              <TuiFormGroup>
                {/* <TuiFormGroupHeader
                  header={"Web & app events configuration"}
                  description="This is a source where ReBid Insights will collect events from."
                /> */}
                <div className="flex justify-between">
                  <div className="w-1/2">
                    <TuiFormGroupContent>
                      <TuiFormGroupField
                        header={"Event ID"}
                        description={`Event ID is auto-generated. In most cases you do not have to do nothing just leave it like it is.
              In rare cases when you would like to create a event source with user defined value, then unlock the field and type your event ID.
              If you change the id of existing event source new event source will be created.`}
                      >
                        <DisabledInput
                          label={"Web app ID"}
                          value={id}
                          onChange={setId}
                        />
                      </TuiFormGroupField>
                      <TuiFormGroupField
                        header={"Event type"}
                        description={
                          "Event type defines storage or endpoint type."
                        }
                      >
                        <TuiSelectEventSourceType
                          value={type}
                          values={credentialTypes}
                          id="scroll_web_type"
                          onSetValue={handleTypeChange}
                          errorMessage={errorTypeMessage}
                        />
                      </TuiFormGroupField>
                      <TuiFormGroupField
                        header="Label(s)"
                        description="Set tags. Sources will be grouped by tags that lets you find sources quickly."
                      >
                        <div className="chips_container">
                          {Array.isArray(tags) &&
                            tags.map((tag, index) => (
                              <Chip label={tag} key={index} className="chips" />
                            ))}
                        </div>
                      </TuiFormGroupField>
                      <TuiFormGroupField
                        header="Event access"
                        description={"Disabled Events will not be accessible."}
                      >
                        <div className="flex items-center mt-3">
                          <Switch
                            checked={enabledSource}
                            onChange={(ev) =>
                              setEnabledSource(ev.target.checked)
                            }
                            name="enabledSource"
                          />
                          <span className="font-semibold">
                            {enabledSource ? "Enabled" : "Disabled"}
                          </span>
                        </div>
                      </TuiFormGroupField>
                      <TuiFormGroupField
                        header="Are events from this web app transitional?"
                        description="Transitional events are only processed but not saved in database. If you set source to collect only transitional event
              then no event will be stored in Insights. By default events are saved in ReBid Insights storage.  Control over event is passed
              to the client. That means the event may become transitional if it is sent with options set to saveEvents: false."
                      >
                        <div className="flex items-center mt-3">
                          <Switch
                            checked={transitional}
                            onChange={(ev) =>
                              setTransitional(ev.target.checked)
                            }
                            name="transitional"
                          />
                          <span className="font-semibold">
                            {transitional ? "Enabled" : "Disabled"}
                          </span>
                        </div>
                      </TuiFormGroupField>
                    </TuiFormGroupContent>
                  </div>
                  <ConnectorFlow
                    displayType="event"
                    type={type}
                    resourceText="Destinations are the business tools, apps, and warehouses that you want to send data from Segment."
                  />
                </div>
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
                  onClick={onChangeTab}
                  type="button"
                  className="btn_next"
                >
                  Next
                </button>
              </div>
              {/* {errors && <ErrorsBox errorList={errors} />} */}
            </TuiForm>
          </TabPanel>
          <TabPanel tabId="two">
            {/* <TuiFormGroupHeader header="Web app description" /> */}
            <TuiFormGroupContent>
              <div className="flex justify-between">
                <div className="w-2/5">
                  <TuiFormGroupField
                    header="Event name"
                    description={
                      "Web app name can be any string that identifies events."
                    }
                  >
                    <TextField
                      // label={"Web app name"}
                      value={name}
                      error={
                        typeof errorNameMessage !== "undefined" &&
                        errorNameMessage !== "" &&
                        errorNameMessage !== null
                      }
                      helperText={
                        <p className="helper_error">{errorNameMessage}</p>
                      }
                      onChange={(ev) => {
                        setName(ev.target.value);
                      }}
                      size="small"
                      id="scroll_web_name"
                      variant="outlined"
                      fullWidth
                      // className="w-2/5"
                    />
                  </TuiFormGroupField>

                  <TuiFormGroupField
                    header="Event description"
                    description="Description will help you understand what kind of event source it is."
                  >
                    <TextField
                      // label={"Web & app event description"}
                      value={description}
                      multiline
                      rows={3}
                      onChange={(ev) => {
                        setDescription(ev.target.value);
                      }}
                      variant="outlined"
                      fullWidth
                      // className="w-2/5"
                    />
                  </TuiFormGroupField>

                  <TuiFormGroupField
                    header="Event grouping"
                    description="Sources can be grouped with tags that are typed here."
                  >
                    <TuiTagger tags={groups} onChange={setGroups} />
                  </TuiFormGroupField>
                </div>
                <ConnectorFlow
                  displayType="event"
                  type={type}
                  resourceText="Destinations are the business tools, apps, and warehouses that you want to send data from Segment."
                />
              </div>
            </TuiFormGroupContent>

            <div className="btn_group">
              <button
                value="one"
                onClick={onChangeTab}
                type="button"
                className="btn_cancel"
              >
                Back
              </button>
              <button
                error={errors !== null}
                onClick={handleSubmit}
                progress={processing}
                className="btn_next"
              >
                Save
              </button>
            </div>
          </TabPanel>
        </Tabs>
      </TuiFormGroup>
    </>
  );
};

EventSourceForm.propTypes = {
  value: PropTypes.object,
  style: PropTypes.object,
  onClose: PropTypes.func,
};

export default EventSourceForm;
