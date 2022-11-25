import React, { useEffect, useState } from "react";
import Button from "./Button";
import TextField from "@mui/material/TextField";
import Switch from "@mui/material/Switch";
import { v4 as uuid4 } from "uuid";
import JsonEditor from "../editors/JsonEditor";
import { request } from "../../../remote_api/uql_api_endpoint";
import { connect } from "react-redux";
import { showAlert } from "../../../redux/reducers/alertSlice";
import PropTypes from "prop-types";
import TuiSelectResourceType from "../tui/TuiSelectResourceType";
import {
  TuiForm,
  TuiFormGroup,
  TuiFormGroupContent,
  TuiFormGroupField,
  TuiFormGroupHeader,
} from "../tui/TuiForm";
import DisabledInput from "./inputs/DisabledInput";
// import Tabs, { TabCase } from "../tabs/Tabs";
import TuiTagger from "../tui/TuiTagger";
import TuiTags from "../tui/TuiTags";
import BackTo from "../../../UI/BackTo/BackTo";
import { Tabs, Tab, TabPanel, TabList } from "react-web-tabs";
import add from "../../../assets/images/icons/red_add.svg";
import minus from "../../../assets/images/icons/red_minus.svg";
import deleteIcon from "../../../assets/images/icons/delete.svg";
import FlowNodeIcons from "../../flow/FlowNodeIcons";
import JSONInput from "react-json-editor-ajrm";

function ResourceForm({ init, onClose, showAlert }) {
  const inEditMode = !init;

  if (!init) {
    init = {
      id: uuid4(),
      name: "",
      type: null,
      description: "",
      credentials: {
        production: {},
        test: {},
      },
      consent: false,
      enabled: false,
      tags: [],
      groups: [],
      destination: {
        package: null,
        init: {},
        form: {},
      },
      icon: null,
    };
  }

  const [requiresConsent, _setRequiresConsent] = useState(init?.consent);
  const [enabledSource, setEnabledSource] = useState(init?.enabled);
  const [type, setType] = useState(null); // It is set in useEffects after the types are loaded
  const [name, setName] = useState(init?.name);
  const [smtp, setSmtp] = useState();
  const [id, setId] = useState(init?.id);
  const [tags, setTags] = useState(init?.tags);
  const [groups, setGroups] = useState(init?.groups);
  const [icon, setIcon] = useState(init?.icon);
  const [destination, setDestination] = useState(init?.destination);
  const [description, setDescription] = useState(init?.description);
  const [errorTypeMessage, setTypeErrorMessage] = useState("");
  const [errorNameMessage, setNameErrorMessage] = useState("");
  const [productionConfig, setProductionConfig] = useState(
    JSON.stringify(init?.credentials?.production, null, "  ")
  );
  const [testConfig, setTestConfig] = useState(
    JSON.stringify(init?.credentials?.test, null, "  ")
  );
  const [processing, setProcessing] = useState(false);
  const [credentialTypes, setCredentialTypes] = useState({});
  const [tabId, setTabID] = useState("one");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [toggle, setToggle] = useState(false);
  const [value, setValue] = useState(true);

  const handleToggle = (data) => {
    setValue(data);
  };

  const setClassName = () => {
    return toggle ? "toggle_checked" : "toggle_unchecked";
  };

  const changeSelected = () => {
    handleToggle(toggle);
    setToggle(!toggle);
  };

  const getIdNameFromType = (type, types) => {
    if (type in types) {
      return { id: type, name: types[type]["name"] };
    }
    return { id: type, name: type };
  };

  const onChangeTab = (e) => {
    setTabID(e.target.value);
  };

  useEffect(() => {
    request(
      { url: "/resources/type/configuration" },
      () => {},
      () => {},
      (response) => {
        if (response) {
          setCredentialTypes(response.data.result);
          // Original type value is an id  e.g "aws", but "type" state is and object with id and name,
          // e.g {name" "AWS credentials", id: "aws"}
          // It must be set after the available list of resources are loaded.
          setType(getIdNameFromType(init?.type, response.data.result));
        }
      }
    );
  }, []); // todo: setting init here make infinite request

  const setRequiresConsent = (ev) => {
    _setRequiresConsent(ev.target.checked);
  };

  const onSubmit = (payload) => {
    setProcessing(true);
    request(
      {
        url: "/resource",
        method: "post",
        data: payload,
      },
      setProcessing,
      (e) => {
        if (e) {
          showAlert({ message: e[0].msg, type: "error", hideAfter: 5000 });
        }
      },
      (data) => {
        if (data) {
          request(
            {
              url: "/resources/refresh",
            },
            setProcessing,
            () => {},
            () => {
              if (onClose) {
                onClose(data);
              }
            }
          );
        }
      }
    );
  };

  const setTypeAndDefineCredentialsTemplate = (type) => {
    setType(type);
    if (type?.id in credentialTypes) {
      const template = credentialTypes[type?.id];
      setSelected(template);
      setProductionConfig(JSON.stringify(template?.config, null, "  "));
      setTestConfig(JSON.stringify(template?.config, null, "  "));
      setTags(template?.tags);
      setDestination(template?.destination);
      setIcon(template?.icon);
    }
  };

  const handleSubmit = () => {
    if (!name || name.length === 0 || !type?.name) {
      if (!name || name.length === 0) {
        setNameErrorMessage("Source name can not be empty");
      } else {
        setNameErrorMessage("");
      }

      if (!type?.name) {
        setTypeErrorMessage("Source type can not be empty");
      } else {
        setTypeErrorMessage("");
      }
      return;
    }

    try {
      const payload = {
        id: !id ? uuid4() : id,
        name: name,
        description: description,
        type: type.id, // Save only type id not the whole object.
        credentials: {
          production:
            productionConfig === "" ? {} : JSON.parse(productionConfig),
          test: testConfig === "" ? {} : JSON.parse(testConfig),
        },
        destination: destination,
        icon: icon,
        consent: requiresConsent,
        enabled: enabledSource,
        tags: tags,
        groups: groups,
      };
      onSubmit(payload);
      sessionStorage.setItem("trialRefresh", true);
      window.history.back();
    } catch (e) {
      alert("Invalid JSON in field CONFIG.");
    }
  };

  const handleAdd = () => {
    setOpen(!open);
  };

  const handleDelete = () => {
    setOpen(false);
    setType(null);
    setSelected(null);
    setProductionConfig(
      JSON.stringify(init?.credentials?.production, null, "  ")
    );
    setTestConfig(JSON.stringify(init?.credentials?.test, null, "  "));
    setTags(init?.tags);
    setDestination(init?.destination);
    setIcon(init?.icon);
  };

  const handleJsonChange = (e) => {};

  return (
    <TuiForm>
      <BackTo text="Connectors" path="/setup/connectors" />
      <Tabs className="card" defaultTab={tabId}>
        <TabList>
          <Tab onClick={onChangeTab} type="button" value="one" tabFor="one">
            Connector Details
          </Tab>
          <Tab onClick={onChangeTab} type="button" value="two" tabFor="two">
            Access and Consent
          </Tab>
          <Tab onClick={onChangeTab} type="button" value="three" tabFor="three">
            Configuration
          </Tab>
        </TabList>
        <TabPanel tabId="one">
          <TuiFormGroup>
            {/* <TuiFormGroupHeader header="Data source" /> */}
            <TuiFormGroupContent>
              {inEditMode && (
                <>
                  <TuiFormGroupField
                    header="Connector id"
                    description="Connector id is auto-generated. In most cases you do not have to do nothing
                                   just leave it like it is. In rare cases when you would like to create a connector
                                   with user defined value, then unlock the field and type your connector id. If you change
                                   the id of existing connector new connector will be created."
                  >
                    <DisabledInput
                      // label={"Data source id"}
                      value={id}
                      onChange={setId}
                    />
                  </TuiFormGroupField>
                  <TuiFormGroupField
                    header={
                      <span>
                        Connector type<span className="reqd_field">*</span>
                      </span>
                    }
                    description="Connector type defines storage or endpoint type. "
                  >
                    {selected === null ? (
                      <div className="flex items-center mb-4">
                        <span className="light_text">
                          Select connector type
                        </span>
                        <img
                          onClick={handleAdd}
                          className="red_img"
                          src={open ? minus : add}
                          alt="add"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center mt-3">
                        <div className="selectedType_container">
                          <FlowNodeIcons icon={selected?.icon} />
                          <div className="selectedType_item">
                            <span className="selectedType_title">
                              {selected?.name}
                            </span>
                            <span className="selectedType_category">All</span>
                          </div>
                        </div>
                        <div className="flex ml-2">
                          {open ? (
                            <button
                              className="btn_next"
                              onClick={handleAdd}
                              type="button"
                            >
                              Cancel
                            </button>
                          ) : (
                            <button
                              className="btn_next"
                              onClick={handleAdd}
                              type="button"
                            >
                              Change
                            </button>
                          )}
                          <div
                            onClick={handleDelete}
                            className="btn_cancel delete"
                          >
                            <img src={deleteIcon} alt="delete" />
                          </div>
                        </div>
                      </div>
                    )}
                    <TuiSelectResourceType
                      value={type}
                      open={open}
                      values={credentialTypes}
                      onSetValue={setTypeAndDefineCredentialsTemplate}
                      errorMessage={errorTypeMessage}
                      setOpen={setOpen}
                      setSelected={setSelected}
                    />
                  </TuiFormGroupField>
                  <TuiFormGroupField
                    header="Connector label"
                    description="Connector label are auto-tagged. This is only information on
            connector type. It is used internally by the system."
                  >
                    <TuiTags tags={tags} />
                  </TuiFormGroupField>
                </>
              )}
              <TuiFormGroupField
                header={
                  <span>
                    Connector name<span className="reqd_field">*</span>
                  </span>
                }
                description="Connector name can be any string that
                    identifies connector."
              >
                <TextField
                  // label={"Data source name"}
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
                  variant="outlined"
                  fullWidth
                  className="w-2/5"
                />
              </TuiFormGroupField>
              <TuiFormGroupField
                header="Description"
                description="Description will help you understand what kind of connector it is."
              >
                <TextField
                  // label={"Data source description"}
                  value={description}
                  multiline
                  rows={3}
                  onChange={(ev) => {
                    setDescription(ev.target.value);
                  }}
                  variant="outlined"
                  fullWidth
                  className="w-2/5"
                />
              </TuiFormGroupField>
              <TuiFormGroupField
                header="Grouping"
                description="Connectors can be grouped with tags that are typed here."
              >
                <TuiTagger tags={groups} onChange={setGroups} />
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
            {/* <TuiFormGroupHeader header="Access and Consent" /> */}
            <TuiFormGroupContent>
              <TuiFormGroupField
                header="Connector consent"
                description="Check if this connector requires user consent? E.g. web pages
                    located in Europe require user consent to comply with GDPR. "
              >
                <div className="flex items-center mt-3 ">
                  <Switch
                    checked={requiresConsent}
                    onChange={setRequiresConsent}
                    name="consentRequired"
                  />
                  <span>{requiresConsent ? "Enabled" : "Disabled"}</span>
                </div>
              </TuiFormGroupField>
              <TuiFormGroupField
                header="Connector enabled"
                description="Check if this connector needs to be enabled? E.g. web pages
                    located in Europe require user consent to comply with GDPR. "
              >
                <div className="flex items-center mt-5 ">
                  <Switch
                    checked={enabledSource}
                    onChange={() => setEnabledSource(!enabledSource)}
                    name="enabledSource"
                  />
                  <span>{enabledSource ? "Enabled" : "Disabled"}</span>
                </div>
              </TuiFormGroupField>
            </TuiFormGroupContent>
          </TuiFormGroup>
          <div className="btn_group">
            <button
              type="button"
              value="one"
              onClick={onChangeTab}
              className="btn_cancel"
            >
              Back
            </button>
            <button
              value="three"
              type="button"
              className="btn_next"
              onClick={onChangeTab}
            >
              Next
            </button>
          </div>
        </TabPanel>
        <TabPanel tabId="three">
          <div>
            <TuiFormGroup>
              {/* <TuiFormGroupHeader header="Configuration" /> */}
              <TuiFormGroupContent overflow>
                <div className="ml-8 mt-8 mb-2">
                  <TuiFormGroupField
                    margin
                    header="Credentials or Access tokens"
                    description="This json data will be an
                encrypted part of connector. Please pass here all the credentials or access configuration information,
                such as hostname, port, username and password, etc. This part can be empty or left as it is if data source does not
                require authorization."
                  ></TuiFormGroupField>
                </div>
              </TuiFormGroupContent>
            </TuiFormGroup>
            <div className="flex justify-between">
              <div className="w-2/5 ml-8">
                <span
                  style={{
                    borderRadius: "4px 0px 0px 4px",
                    textTransform: "capitalize",
                  }}
                  onClick={changeSelected}
                  className={!toggle ? "toggle_checked" : "toggle_unchecked"}
                >
                  Test
                </span>
                <span
                  style={{
                    borderRadius: "0px 4px 4px 0px",
                    textTransform: "capitalize",
                  }}
                  onClick={changeSelected}
                  className={`${setClassName()}`}
                >
                  Production
                </span>
                <div className="mt-6">
                  {selected &&
                    Object.entries(selected?.config).map(([label, value]) => {
                      return (
                        <TuiFormGroupField margin header={<span>{label}</span>}>
                          <TextField
                            value={value}
                            onChange={(ev, label) => {
                              handleJsonChange(ev.target.value, label);
                            }}
                            size="small"
                            variant="outlined"
                            fullWidth
                            className="mb-6"
                          />
                        </TuiFormGroupField>
                      );
                    })}
                </div>
              </div>
              <div className="w-2/5 mr-8">
                <div className="mt-8">
                  <TuiFormGroupField
                    margin
                    header="Credentials configuration"
                  ></TuiFormGroupField>
                </div>
                {value ? (
                  <JSONInput
                    placeholder={JSON.parse(testConfig)}
                    theme="light_mitsuketa_tribute"
                    style={{ body: { fontSize: "14px" } }}
                    onChange={setTestConfig}
                  />
                ) : (
                  <JSONInput
                    placeholder={JSON.parse(productionConfig)}
                    theme="light_mitsuketa_tribute"
                    style={{ body: { fontSize: "14px" } }}
                    onChange={setProductionConfig}
                  />
                )}
              </div>
            </div>
          </div>
          <div className="btn_group">
            <button
              type="button"
              value="two"
              onClick={onChangeTab}
              className="btn_cancel"
            >
              Back
            </button>
            <button
              value="three"
              type="button"
              className="btn_next"
              onClick={handleSubmit}
            >
              Save
            </button>
          </div>
        </TabPanel>
      </Tabs>
    </TuiForm>
  );
}

ResourceForm.propTypes = {
  init: PropTypes.object,
  onClose: PropTypes.func,
};

const mapProps = (state) => {
  return {
    notification: state.notificationReducer,
  };
};
export default connect(mapProps, { showAlert })(ResourceForm);
