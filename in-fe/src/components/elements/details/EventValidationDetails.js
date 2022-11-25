import React, { useEffect } from "react";
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
import EventValidationForm from "../forms/EventValidationForm";
import BackTo from "../../../UI/BackTo/BackTo";
import { Tabs, Tab, TabPanel, TabList } from "react-web-tabs";
export default function EventValidationDetails({
  onDeleteComplete,
  onEditComplete,
}) {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [displayEdit, setDisplayEdit] = React.useState(false);
  const [deleteProgress, setDeleteProgress] = React.useState(false);
  const [showEdit, setShowEdit] = React.useState(false);

  const confirm = useConfirm();
  const id = window.location.pathname.split("/").at(-1);

  useEffect(() => {
    setLoading(true);
    asyncRemote({
      url: "/event/validation-schema/" + id,
      method: "get",
    })
      .then((result) => {
        setData(result.data);
      })
      .catch()
      .finally(() => setLoading(false));
  }, [id]);

  const onEditClick = () => {
    if (data) {
      // setDisplayEdit(true);
      setShowEdit(true);
    }
  };

  const onDelete = () => {
    confirm({
      title: "Do you want to delete this validation schema?",
      description: "This action can not be undone.",
    })
      .then(async () => {
        setDeleteProgress(true);
        try {
          await asyncRemote({
            url: "/event/validation-schema/" + id,
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
      <BackTo text="Validations" path="/setup/validations" />
      <Tabs className="card" defaultTab={"one"}>
        <TabList>
          <Tab type="button" value="one" tabFor="one">
            Validation details
          </Tab>
        </TabList>
        <TabPanel tabId="one">
          <TuiFormGroup>
            {/* <TuiFormGroupHeader
          header="Event validation schema"
          description="Information on event validation schema"
        /> */}
            <TuiFormGroupContent>
              <TuiFormGroupField
                // header={data.name}
                description={data.description}
              ></TuiFormGroupField>
            </TuiFormGroupContent>
          </TuiFormGroup>
          <TuiFormGroup>
            {/* <TuiFormGroupHeader header="Event validation schema properties" /> */}
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
    <div className="Box10">
      {loading && <CenteredCircularProgress />}
      {data && !showEdit && <Details />}
      {/* <FormDrawer
        width={800}
        label="Edit schema"
        onClose={() => {
          setDisplayEdit(false);
        }}
        open={displayEdit}
      > */}
      {showEdit && (
        <EventValidationForm onSaveComplete={onEditComplete} {...data} />
      )}
      {/* </FormDrawer> */}
    </div>
  );
}

EventValidationDetails.propTypes = {
  id: PropTypes.string,
  onDeleteComplete: PropTypes.func,
  onEditComplete: PropTypes.func,
};
