import React, { useEffect, useRef, useState } from "react";
import "./Details.css";
import "./RuleDetails.css";
import Button from "../forms/Button";
import PropTypes from "prop-types";
import {
  TuiForm,
  TuiFormGroup,
  TuiFormGroupContent,
  TuiFormGroupField,
  TuiFormGroupHeader,
} from "../tui/TuiForm";
import { asyncRemote } from "../../../remote_api/entrypoint";
import { useConfirm } from "material-ui-confirm";
import CenteredCircularProgress from "../progress/CenteredCircularProgress";
import FormDrawer from "../drawers/FormDrawer";
import Properties from "./DetailProperties";
import DestinationForm from "../forms/DestinationForm";
import { VscEdit, VscTrash } from "react-icons/vsc";
import BackTo from "../../../UI/BackTo/BackTo";
import { Tabs, Tab, TabPanel, TabList } from "react-web-tabs";

function DestinationDetails({ onDelete, onEdit }) {
  const [loading, setLoading] = React.useState(false);
  const [deleteProgress, setDeleteProgress] = React.useState(false);
  const [data, setData] = React.useState(null);
  const [openEdit, setOpenEdit] = React.useState(false);
  const [tabId, setTabID] = useState("one");
  const [showEdit, setShowEdit] = React.useState(false);

  const mounted = useRef(false);
  const confirm = useConfirm();
  const id = window.location.pathname.split("/").at(-1);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    asyncRemote({
      url: "/destination/" + id,
      method: "get",
    })
      .then((response) => {
        if (response?.data && mounted.current) {
          setData(response?.data);
        }
      })
      .catch((e) => {
        if (e && mounted.current) {
        }
      })
      .finally(() => {
        if (mounted.current) {
          setLoading(false);
        }
      });
  }, [id]);

  const handleEdit = () => {
    // setOpenEdit(true);
    setShowEdit(true);
  };

  const handleDelete = () => {
    confirm({
      title: "Do you want to delete this destination?",
      description: "This action can not be undone.",
    })
      .then(async () => {
        setDeleteProgress(true);
        await asyncRemote({
          url: "/destination/" + id,
          method: "delete",
        });
        if (onDelete && mounted.current === true) {
          onDelete(data.id);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted.current === true) {
          setDeleteProgress(false);
        }
      });
  };

  const onChangeTab = (e) => {
    setTabID(e.target.value);
  };

  const Details = () => (
    <>
      <BackTo text="Destinations" path="/setup/destinations" />
      <Tabs className="card" defaultTab={tabId}>
        <TabList>
          <Tab type="button" onClick={onChangeTab} value="one" tabFor="one">
            Destination details
          </Tab>
        </TabList>
        <TabPanel tabId="one">
          <TuiForm>
            <TuiFormGroup>
              {/* <TuiFormGroupHeader header={data?.name} /> */}
              <TuiFormGroupContent>
                <TuiFormGroupContent>
                  <TuiFormGroupField description={data?.description}>
                    <Properties properties={data} />
                  </TuiFormGroupField>
                </TuiFormGroupContent>
              </TuiFormGroupContent>
            </TuiFormGroup>
            <div className="btn_group">
              <button
                type="button"
                className="btn_cancel"
                onClick={handleDelete}
                disabled={typeof data === "undefined"}
              >
                Delete
              </button>
              <button
                className="btn_next"
                onClick={handleEdit}
                disabled={typeof data === "undefined"}
              >
                Edit
              </button>
            </div>
          </TuiForm>
        </TabPanel>
      </Tabs>
    </>
  );

  return (
    <>
      {loading && <CenteredCircularProgress />}
      {showEdit && <DestinationForm onSubmit={onEdit} value={data} />}
      {!loading && !showEdit && <Details />}
    </>
  );
}

DestinationDetails.propTypes = {
  id: PropTypes.string,
  onDelete: PropTypes.func,
  onEdit: PropTypes.func,
};

export default DestinationDetails;
