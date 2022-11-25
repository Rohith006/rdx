import React, { useEffect, useRef } from "react";
import Properties from "./DetailProperties";
import Button from "../forms/Button";
import Rows from "../misc/Rows";
import CenteredCircularProgress from "../progress/CenteredCircularProgress";
import { useConfirm } from "material-ui-confirm";
import FormDrawer from "../drawers/FormDrawer";
import { VscTrash, VscEdit } from "react-icons/vsc";
import PropTypes from "prop-types";
import {
  TuiForm,
  TuiFormGroup,
  TuiFormGroupContent,
  TuiFormGroupField,
  TuiFormGroupHeader,
} from "../tui/TuiForm";
import { asyncRemote } from "../../../remote_api/entrypoint";
import ConsentForm from "../forms/ConsentForm";
import BackTo from "../../../UI/BackTo/BackTo";
import { Tabs, Tab, TabPanel, TabList } from "react-web-tabs";
export default function ConsentDetails({ onDeleteComplete, onEditComplete }) {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [displayEdit, setDisplayEdit] = React.useState(false);
  const [deleteProgress, setDeleteProgress] = React.useState(false);
  const [showEdit, setShowEdit] = React.useState(false);

  const id = window.location.pathname.split("/").at(-1);

  const confirm = useConfirm();

  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    asyncRemote({
      url: "/consent/type/" + id,
      method: "get",
    })
      .then((result) => {
        if (mounted.current) setData(result.data);
      })
      .catch()
      .finally(() => {
        if (mounted.current) setLoading(false);
      });
  }, [id]);

  const onEditClick = () => {
    if (data) {
      // setDisplayEdit(true);
      setShowEdit(true);
    }
  };

  const onDelete = () => {
    confirm({
      title: "Do you want to delete this consent type?",
      description: "This action can not be undone.",
    })
      .then(async () => {
        setDeleteProgress(true);
        try {
          await asyncRemote({
            url: "/consent/type/" + id,
            method: "delete",
          });
          if (onDeleteComplete) {
            onDeleteComplete(data.id);
          }
        } catch (e) {}
      })
      .catch(() => {})
      .finally(() => {
        setDeleteProgress(false);
      });
  };

  const Details = () => (
    <TuiForm>
      <BackTo text="Consents" path="/setup/consents" />
      <Tabs className="card" defaultTab={"one"}>
        <TabList>
          <Tab type="button" value="one" tabFor="one">
            Consent details
          </Tab>
        </TabList>
        <TabPanel tabId="one">
          <TuiFormGroup>
            {/* <TuiFormGroupHeader
              header="Consent type"
              description="Information on consent type"
            /> */}
            <TuiFormGroupContent>
              {/* <TuiFormGroupField
                header={data.name}
                description={data.description}
              > */}
              {/* </TuiFormGroupField> */}
            </TuiFormGroupContent>
          </TuiFormGroup>
          <TuiFormGroup>
            {/* <TuiFormGroupHeader header="Consent type properties" /> */}
            <TuiFormGroupContent>
              <TuiFormGroupField>
                <Properties properties={data} />
              </TuiFormGroupField>
            </TuiFormGroupContent>
          </TuiFormGroup>
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
              type="button"
              className="btn_next"
              onClick={onEditClick}
              disabled={typeof data === "undefined"}
            >
              Edit
            </button>
          </div>
        </TabPanel>
      </Tabs>
    </TuiForm>
  );

  return (
    <div>
      {loading && <CenteredCircularProgress />}
      {data && !showEdit && <Details />}
      {showEdit && <ConsentForm onSaveComplete={onEditComplete} {...data} />}
    </div>
  );
}

ConsentDetails.propTypes = {
  id: PropTypes.string,
  onDeleteComplete: PropTypes.func,
  onEditComplete: PropTypes.func,
};
