import React, { Suspense, useEffect } from "react";
import "../lists/cards/SourceCard.css";
import "./ResourceDetails.css";
import "./Details.css";
import Properties from "./DetailProperties";
import CenteredCircularProgress from "../progress/CenteredCircularProgress";
import { useConfirm } from "material-ui-confirm";
import FormDrawer from "../drawers/FormDrawer";
import PropTypes from "prop-types";
import {
  TuiForm,
  TuiFormGroup,
  TuiFormGroupContent,
  TuiFormGroupField,
  TuiFormGroupHeader,
} from "../tui/TuiForm";
import EventSourceForm from "../forms/EventSourceForm";
import TextField from "@mui/material/TextField";
import { asyncRemote } from "../../../remote_api/entrypoint";
import BackTo from "../../../UI/BackTo/BackTo";
import { Tabs, Tab, TabPanel, TabList } from "react-web-tabs";
import { useHistory } from "react-router";
import CopyToClipboard from "../../../UI/CopyToClipboard";
import ConnectorFlow from "../../../UI/ConnectorFlow/ConnectorFlow";

const TrackerUseScript = React.lazy(() =>
  import("../tracker/TrackerUseScript")
);
const TrackerScript = React.lazy(() => import("../tracker/TrackerScript"));

export default function EventSourceDetails({ onDeleteComplete }) {
  const confirm = useConfirm();
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [editData, setEditData] = React.useState(null);
  const [refresh, setRefresh] = React.useState(0);
  const [showEdit, setShowEdit] = React.useState(false);

  const id = window.location.pathname.split("/").at(-1);

  useEffect(() => {
    setLoading(true);
    asyncRemote({
      url: "/event-source/" + id,
      method: "GET",
    })
      .then((response) => {
        if (response) {
          setData(response.data);
        }
      })
      .catch((e) => {
        if (e) {
          console.error(e);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  // Loads data without loading indicator
  useEffect(() => {
    asyncRemote({
      url: "/event-source/" + id,
      method: "GET",
    })
      .then((response) => {
        if (response) {
          setData(response.data);
        }
      })
      .catch((e) => {
        if (e) {
          console.error(e);
        }
      });
  }, [id, refresh]);

  const onEdit = () => {
    window.scrollTo(0, 0);
    setEditData(data);
    setShowEdit(true);
  };

  const onDelete = () => {
    confirm({
      title: "Do you want to delete this event source?",
      description: "This action can not be undone.",
    })
      .then(async () => {
        try {
          const response = await asyncRemote({
            url: "/event-source/" + data.id,
            method: "DELETE",
          });
          if (onDeleteComplete) {
            onDeleteComplete(response);
          }
          window.history.back();
        } catch (e) {
          console.error(e);
        }
      })
      .catch(() => {});
  };

  const Details = () => (
    <>
      <BackTo text="Events" path="/setup/events_" />
      <Tabs className="card" defaultTab="one">
        <TabList>
          <Tab tabFor="one">Event source details</Tab>
          {data.type === "javascript" && <Tab tabFor="two">Event tag</Tab>}
        </TabList>
        <TabPanel tabId="one">
          <TuiForm>
            <TuiFormGroup>
              {/* <TuiFormGroupHeader header="Web & App event source" /> */}
              <div className="flex justify-between">
                <div className="w-2/3">
                  <TuiFormGroupContent
                    className="property_container"
                    header={"Data"}
                  >
                    <Properties properties={data} />
                  </TuiFormGroupContent>
                </div>
                <ConnectorFlow
                  displayType="event_edit"
                  type={data.type}
                  resourceText="Destinations are the business tools, apps, and warehouses that you want to send data from Segment."
                />
              </div>
            </TuiFormGroup>

            <div className="border-top">
              <TuiFormGroup>
                <div className="flex items-center justify-between w-66">
                  <TuiFormGroupField
                    header="Webhook URL"
                    description="For every event source there is a web hook created. Calling it will emit
                                profile less event. For full fledged events call regular /track endpoint.
                                Event properties should be send in the body of request and
                    event-type inside URL should be replaced with the
                    event type you would like to emit. Please refer to the
                    documentation to see what are profile less events as calling
                    this web hook will emit one of them."
                  ></TuiFormGroupField>
                  <TuiFormGroupContent>
                    {/* <div className="px-6 py-4">
                  <h3>Web hook URL</h3>
                  <p>
                    Event properties should be send in the body of request and{" "}
                    <b>event-type</b> inside URL should be replaced with the
                    event type you would like to emit. Please refer to the
                    documentation to see what are profile less events as calling
                    this web hook will emit one of them.
                  </p>
                </div> */}

                    {/* <TextField
                    // label="Web hook"
                    value={`/collect/event-type/${data.id}`}
                    size="small"
                    disabled={true}
                    variant="outlined"
                    fullWidth
                    className="px-8 w-2/5"
                  /> */}
                    <div className="flex items-center flex-2">
                      <span className="mb-1 disabled_text mr-6">
                        /collect/event-type/${data.id}
                      </span>
                      <CopyToClipboard
                        value={`/collect/event-type/${data.id}`}
                      />
                    </div>
                  </TuiFormGroupContent>
                </div>
              </TuiFormGroup>
            </div>
          </TuiForm>
          <div className="btn_group">
            <button
              className="btn_cancel"
              onClick={onDelete}
              disabled={typeof data === "undefined"}
            >
              Delete
            </button>
            <button
              className="btn_next"
              onClick={onEdit}
              disabled={typeof data === "undefined"}
            >
              Edit
            </button>
          </div>
        </TabPanel>
        <TabPanel tabId="two">
          {data.type === "javascript" && (
            <TuiForm className="flex">
              <div className="w-1/2 m-6 relative">
                <TuiFormGroup>
                  <TuiFormGroupField
                    margin="none"
                    header="Custom HTML Tag (Header)"
                    description="Please paste this code into your web page. This code should appear on every page."
                  />
                  <TuiFormGroupContent className="card">
                    <Suspense fallback={<CenteredCircularProgress />}>
                      <TrackerScript sourceId={data.id} />
                    </Suspense>
                  </TuiFormGroupContent>
                </TuiFormGroup>
              </div>
              <div className="w-1/2 m-6 relative">
                <TuiFormGroup>
                  <TuiFormGroupField
                    margin="none"
                    header="Custom HTML Tag (Body)"
                    description="This is an example of event sending. This code sends multiple events.
                                    Please refer to Insights documentation on more complex configuration."
                  />
                  <TuiFormGroupContent className="card">
                    <Suspense fallback={<CenteredCircularProgress />}>
                      <TrackerUseScript />
                    </Suspense>
                  </TuiFormGroupContent>
                </TuiFormGroup>
              </div>
            </TuiForm>
          )}
        </TabPanel>
      </Tabs>
    </>
  );

  return (
    <div>
      {loading && <CenteredCircularProgress />}
      {data && !showEdit && <Details />}
      {data && showEdit && (
        <EventSourceForm
          value={data}
          onClose={() => {
            setEditData(null);
            setRefresh(refresh + 1);
          }}
          doubleBack={showEdit}
        />
      )}
    </div>
  );
}

EventSourceDetails.propTypes = {
  id: PropTypes.string,
  onDeleteComplete: PropTypes.func,
};
