import React, { Suspense, useEffect } from "react";
import "../lists/cards/SourceCard.css";
import "./ResourceDetails.css";
import "./Details.css";
import Properties from "./DetailProperties";
import Button from "../forms/Button";
import Rows from "../misc/Rows";
import CenteredCircularProgress from "../progress/CenteredCircularProgress";
import { useConfirm } from "material-ui-confirm";
import FormDrawer from "../drawers/FormDrawer";
import { VscTrash, VscEdit } from "react-icons/vsc";
import ResourceForm from "../forms/ResourceForm";
import PropTypes from "prop-types";
import {
  TuiForm,
  TuiFormGroup,
  TuiFormGroupContent,
  TuiFormGroupField,
  TuiFormGroupHeader,
} from "../tui/TuiForm";
import CredentialsVault from "../misc/CredentialsVault";
import { asyncRemote } from "../../../remote_api/entrypoint";
import { Tabs, Tab, TabPanel, TabList } from "react-web-tabs";
import BackTo from "../../../UI/BackTo/BackTo";

const TrackerUseScript = React.lazy(() =>
  import("../tracker/TrackerUseScript")
);
const TrackerScript = React.lazy(() => import("../tracker/TrackerScript"));

export default function ResourceDetails({ onDeleteComplete }) {
  const confirm = useConfirm();
  const [data, setData] = React.useState(null);
  const [credentials, setCredentials] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [editData, setEditData] = React.useState(null);
  const [showEdit, setShowEdit] = React.useState(false);

  const id = window.location.pathname.split("/").at(-1);

  useEffect(() => {
    setLoading(true);
    let isSubscribed = true;
    asyncRemote({
      url: "/resource/" + id,
      method: "GET",
    })
      .then((response) => {
        if (response && isSubscribed === true) {
          setCredentials(response.data.credentials);
          delete response.data.credentials;
          setData(response.data);
        }
      })
      .catch((e) => {
        if (e && isSubscribed === true) {
          console.error(e);
        }
      })
      .finally(() => {
        if (isSubscribed === true) setLoading(false);
      });

    return () => {
      isSubscribed = false;
    };
  }, [id]);

  const onEdit = () => {
    const editData = JSON.parse(JSON.stringify(data));
    editData.credentials = JSON.parse(JSON.stringify(credentials));
    setShowEdit(true);
    setEditData(editData);
  };

  const onDelete = () => {
    confirm({
      title: "Do you want to delete this connector?",
      description: "This action can not be undone.",
    })
      .then(async () => {
        try {
          const response = await asyncRemote({
            url: "/resource/" + data.id,
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
      <BackTo text="Connectors" path="/setup/connectors" />
      <Tabs className="card" defaultTab="one">
        <TabList>
          <Tab tabFor="one">Connectors details</Tab>
          {data.type === "web-page" && <Tab tabFor="two">Integration</Tab>}
          <Tab tabFor="three">Credentials</Tab>
        </TabList>
        <TabPanel tabId="one">
          <TuiForm>
            <TuiFormGroup>
              {/* <TuiFormGroupHeader header="Data source" /> */}
              <TuiFormGroupContent
                className="property_container"
                header={"Data"}
              >
                <Properties properties={data} />
              </TuiFormGroupContent>
              <div className="btn_group">
                <button
                  type="button"
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
            </TuiFormGroup>
          </TuiForm>
        </TabPanel>
        <TabPanel tabId="two">
          {data.type === "web-page" && (
            <TuiForm className="flex">
              <div className="w-1/2 m-6 relative">
                <TuiFormGroup>
                  <TuiFormGroupField
                    margin="none"
                    header="Integration"
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
                    header="Javascript example"
                    description="This is an example of event sending. This code sends multiple events. Please refer to Insights documentation on more complex configuration."
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
        <TabPanel tabId="three">
          <TuiFormGroup>
            {/* <TuiFormGroupHeader header="Credentials" /> */}
            <TuiFormGroupContent className="m-8" header={"Data"}>
              <CredentialsVault
                production={credentials?.production}
                test={credentials?.test}
              />
            </TuiFormGroupContent>
          </TuiFormGroup>
        </TabPanel>
      </Tabs>
    </>
  );

  return (
    <div>
      {loading && <CenteredCircularProgress />}
      {data && !showEdit && <Details />}
      {data && showEdit && (
        <ResourceForm
          init={editData}
          onClose={() => {
            setEditData(null);
          }}
        />
      )}
      {/* <FormDrawer
        width={800}
        label="Edit Resource"
        onClose={() => {
          setEditData(null);
        }}
        open={editData !== null}
      >
        <ResourceForm
          init={editData}
          onClose={() => {
            setEditData(null);
          }}
        />
      </FormDrawer> */}
    </div>
  );
}

ResourceDetails.propTypes = {
  id: PropTypes.string,
  onDeleteComplete: PropTypes.func,
};
