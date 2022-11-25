import React, { useEffect, useRef, useState } from "react";
import Button from "./Button";
import TextField from "@mui/material/TextField";
import { v4 as uuid4 } from "uuid";
import {
  TuiForm,
  TuiFormGroup,
  TuiFormGroupContent,
  TuiFormGroupField,
  TuiFormGroupHeader,
} from "../tui/TuiForm";
import TuiTagger from "../tui/TuiTagger";
import ErrorsBox from "../../errors/ErrorsBox";
import JsonEditor from "../editors/JsonEditor";
import DestinationInput from "./inputs/DestinationInput";
import { asyncRemote, getError } from "../../../remote_api/entrypoint";
import Switch from "@mui/material/Switch";
import TuiTopHeaderWrapper from "../tui/TuiTopHeaderWrapper";
import BackTo from "../../../UI/BackTo/BackTo";
import { Tabs, Tab, TabPanel, TabList } from "react-web-tabs";
import add from "../../../assets/images/icons/red_add.svg";
import minus from "../../../assets/images/icons/red_minus.svg";
import deleteIcon from "../../../assets/images/icons/delete.svg";
import FlowNodeIcons from "../../flow/FlowNodeIcons";
import JSONInput from "react-json-editor-ajrm";

export default function DestinationForm({ onSubmit, value: initValue }) {
  if (initValue) {
    initValue = {
      ...initValue,
      mapping: JSON.stringify(initValue?.mapping, null, " "),
      destination: {
        ...initValue?.destination,
        init: JSON.stringify(initValue?.destination.init, null, " "),
      },
    };
  } else {
    initValue = {
      id: uuid4(),
      name: "",
      description: "",
      enabled: false,
      tags: [],
      destination: {
        package: "",
        init: "{}",
        form: null,
      },
      mapping: "{}",
      resource: null,
    };
  }
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(initValue);
  const [nameErrorMessage, setNameErrorMessage] = useState(null);
  const [destinationErrorMessage, setDestinationErrorMessage] = useState(null);
  const [tabId, setTabID] = useState("one");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [delete_, setDelete] = useState(false);

  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  const handleSubmit = async () => {
    if (!data?.name || data?.name.length === 0) {
      if (!data?.name || data?.name.length === 0) {
        setNameErrorMessage("Destination name can not be empty");
      } else {
        setNameErrorMessage(null);
      }
      if (!data?.destination || data?.destination?.package.length === 0) {
        setDestinationErrorMessage("Destination package can not be empty");
      } else {
        setDestinationErrorMessage(null);
      }
      return;
    }
    setProcessing(true);
    try {
      const response = await asyncRemote({
        url: "destination",
        method: "POST",
        data: {
          id: data.id,
          name: data?.name,
          description: data?.description,
          enabled: data?.enabled,
          tags: data?.tags,
          destination: {
            package: data?.destination?.package,
            init: JSON.parse(data?.destination?.init),
            form: data?.destination?.form,
          },
          mapping: JSON.parse(data.mapping),
          resource: data.resource,
        },
      });

      setError(null);

      if (onSubmit && mounted.current === true) {
        onSubmit(response.data);
      }
    } catch (e) {
      if (e && mounted.current === true) {
        setError(getError(e));
      }
    } finally {
      if (mounted.current === true) {
        setProcessing(false);
      }
    }
  };

  const handleDestinationChange = (value, params) => {
    const d = {
      ...data,
      destination: {
        package: params?.destination?.package,
        init: JSON.stringify(params?.destination?.init, null, " "),
        form: params?.destination?.form,
      },
      resource: { id: params?.id },
    };
    setSelected(params);
    setData(d);
  };

  const onChangeTab = (e) => {
    setTabID(e.target.value);
  };

  const handleAdd = () => {
    setOpen(!open);
  };

  const handleDelete = () => {
    setOpen(false);
    setSelected(null);
    setData(initValue);
    setDelete(true);
  };

  return (
    <TuiForm>
      <BackTo text="Destinations" path="/setup/destinations" />
      <Tabs className="card" defaultTab={tabId}>
        <TabList>
          <Tab type="button" onClick={onChangeTab} value="one" tabFor="one">
            Destination configuration
          </Tab>
          <Tab type="button" onClick={onChangeTab} value="two" tabFor="two">
            Destination details
          </Tab>
          <Tab type="button" onClick={onChangeTab} value="three" tabFor="three">
            Data mapping
          </Tab>
          <Tab type="button" onClick={onChangeTab} value="four" tabFor="four">
            Destination settings
          </Tab>
        </TabList>
        <TabPanel tabId="one">
          <TuiFormGroup>
            {/* <TuiFormGroupHeader header="Destination" /> */}
            <TuiFormGroupContent>
              <TuiFormGroupField
                header="Destination"
                description="Select destination system."
              >
                <div>
                  {selected === null || selected === undefined ? (
                    <div className="flex items-center mb-4">
                      <span className="light_text">
                        Select destination system
                      </span>
                      <img
                        onClick={handleAdd}
                        className="red_img"
                        src={open ? minus : add}
                        alt="add"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center mt-3 mb-4">
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
                  <DestinationInput
                    errorMsg={
                      destinationErrorMessage && destinationErrorMessage
                    }
                    value={data?.resource?.id || ""}
                    onChange={handleDestinationChange}
                    open={open}
                    setOpen={setOpen}
                    delete_={delete_}
                    setDelete={setDelete}
                    setSelected={setSelected}
                  />
                  <TuiFormGroupField
                    margin
                    header="Enable destination"
                    description="Profile will NOT be sent to deactivated destination."
                  />
                  <div>
                    <Switch
                      checked={data?.enabled}
                      onChange={(ev) =>
                        setData({ ...data, enabled: ev.target.checked })
                      }
                    />
                    <span>
                      {data?.enabled === true ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </div>
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
            {/* <TuiFormGroupHeader header="Destination description" /> */}
            <TuiFormGroupContent>
              <TuiFormGroupField
                header="Name"
                description="Destination name can be any string that
                    identifies destination."
              >
                <TextField
                  // label={"Destination name"}
                  value={data?.name}
                  error={
                    typeof nameErrorMessage !== "undefined" &&
                    nameErrorMessage !== "" &&
                    nameErrorMessage !== null
                  }
                  onChange={(ev) => {
                    setData({ ...data, name: ev.target.value });
                  }}
                  size="small"
                  helperText={
                    <p className="helper_error">{nameErrorMessage}</p>
                  }
                  variant="outlined"
                  fullWidth
                  className="w-2/5"
                />
              </TuiFormGroupField>
              <TuiFormGroupField
                header="Description"
                description="Description will help you to understand when where the profile data we be send."
              >
                <TextField
                  // label={"Destination description"}
                  value={data?.description}
                  multiline
                  rows={3}
                  onChange={(ev) => {
                    setData({ ...data, description: ev.target.value });
                  }}
                  variant="outlined"
                  fullWidth
                  className="w-2/5"
                />
              </TuiFormGroupField>
              <TuiFormGroupField
                header="Destination tags"
                description="Tag the destination to group it into meaningful groups."
              >
                <TuiTagger
                  tags={data?.tags}
                  onChange={(value) => setData({ ...data, tags: value })}
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
              Back
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
        <TabPanel tabId="three">
          <TuiFormGroup>
            {/* <TuiFormGroupHeader header="Data mapping" /> */}
            <TuiFormGroupContent>
              <TuiFormGroupField
                header="Mapping"
                description="Map data from profile to destination schema.
                Use profile reference e.g profile@... to access profile data."
              >
                <JSONInput
                  placeholder={data?.mapping ? JSON.parse(data?.mapping) : {}}
                  theme="light_mitsuketa_tribute"
                  style={{ body: { fontSize: "14px" } }}
                  onChange={(value) =>
                    setData({
                      ...data,
                      mapping: JSON.stringify(value?.jsObject),
                    })
                  }
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
              Back
            </button>
            <button
              value="two"
              type="button"
              className="btn_next content"
              onClick={onChangeTab}
            >
              Skip for next
            </button>
          </div>
        </TabPanel>
        <TabPanel tabId="four">
          <TuiFormGroup>
            {/* <TuiFormGroupHeader header="Destination settings" /> */}
            <TuiFormGroupContent>
              <TuiFormGroupField header="Configuration">
                <JSONInput
                  placeholder={
                    data?.destination?.init
                      ? JSON.parse(data?.destination?.init)
                      : {}
                  }
                  theme="light_mitsuketa_tribute"
                  style={{ body: { fontSize: "14px" } }}
                  onChange={(value) =>
                    setData({
                      ...data,
                      destination: {
                        ...data.destination,
                        init: JSON.stringify(value?.jsObject),
                      },
                    })
                  }
                />
              </TuiFormGroupField>
            </TuiFormGroupContent>
          </TuiFormGroup>
          {/* {error && <ErrorsBox errorList={error} style={{ borderRadius: 0 }} />} */}
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
              onClick={handleSubmit}
            >
              Save
            </button>
          </div>
          {/* <Button
            label="Save"
            onClick={handleSubmit}
            style={{ justifyContent: "center" }}
            p
            rogress={processing}
            error={error !== null}
          /> */}
        </TabPanel>
      </Tabs>
    </TuiForm>
  );
}
