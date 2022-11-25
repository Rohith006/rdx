import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Field } from "redux-form";
import { AccordionItem, AccordionItemPanel } from "react-accessible-accordion";
import { SelectField } from "../../../UI";
import Checkboxes from "../CheckboxesField";
import { peopleWithItems } from "../../Utils/index";
import { loadCampaignDropdownList } from "../../../../actions/campaignsStatistics";
import { required } from "../../../../utils/validatorUtils";
import download from "../../../../../assets/images/icons/download1.svg";
import { styles } from "../../../UI/selectStyles";
import axios from "axios";
import downloads from "js-file-download";
import _ from "lodash";
import { NotificationManager } from "react-notifications";
import Papa from "papaparse";
import { hashids } from "../../../../utils/common";

axios.defaults.baseURL = __AUDIENCE_API_URL__;

function Collect({ change, advertisers, campaigns, formData = {} }) {
  const dispatch = useDispatch();
  const isCreating = location.pathname === "/audiences/create";
  useEffect(() => {
    if (formData.advertiserId) {
      const params = { advertiserId: formData.advertiserId };
      dispatch(loadCampaignDropdownList(params));
    }
  }, [formData.advertiserId]);
  function onAdvertiserSelectChange(advertiserId) {
    if (advertiserId !== formData.advertiserId) {
      change("collectFromIds", []);
    }
  }
  const handleDownloadCsv = async () => {
    const auth = hashids.encode(__WLID__, formData.id);
    axios
      .post(
        `${__AUDIENCE_API_URL__}download-audiences`,
        {
          auth,
        },
        {
          responseType: "stream",
        }
      )
      .then((response) => {
        if (response.data.length === 0) {
          NotificationManager.error("No IFAs found");
        } else {
          NotificationManager.success("File will be downloaded shortly");
          downloads(
            response.data,
            `audiences-${formData.id}.csv`,
            response.headers["Content-type"]
          );
        }
      });

    // //window.open(`${__AUDIENCE_API_URL__}download-audience-service/${formData.id}/users`);
    // // const csv = Papa.unparse(data.users, {
    // //   newline: "\r\n",
    // //   quotes: false,
    // //   header: true,
    // // });
    // // const csvData = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    // // const tempLink = document.createElement("a");
    // // tempLink.href = window.URL.createObjectURL(csvData);
    // // tempLink.setAttribute("download", `audience_${formData.id}.csv`);
    // // tempLink.click();
  };

  return (
    <AccordionItem uuid={"2"}>
      <AccordionItemPanel>
        <div className="card_body">
          <div className="card_body-item">
            {advertisers && (
              <div className="form-group">
                <Field
                  component={SelectField}
                  name="advertiserId"
                  title="Advertiser"
                  placeholder="Advertiser ID"
                  options={advertisers}
                  onChange={onAdvertiserSelectChange}
                  validate={[required]}
                />
              </div>
            )}
            <div className="form-group">
              <Field
                component={SelectField}
                name="collectFromIds"
                title="Collect from"
                placeholder="Campaign ID"
                options={campaigns}
                isMulti={true}
                validate={[required]}
                styles={styles}
                theme={(theme) => ({
                  ...theme,
                  colors: {
                    ...theme.colors,
                    primary: "#000000",
                  },
                })}
              />
            </div>
            <Checkboxes
              name="peopleWith"
              change={change}
              values={formData.peopleWith || []}
              items={peopleWithItems}
              title="People with"
            />
          </div>
        </div>
        <div className="mr2 flex align-end">
          <button
            type="button"
            className="btn light-blue-upload"
            disabled={isCreating}
            onClick={handleDownloadCsv}
            style={{ marginLeft: 30 }}
          >
            <img src={download} className="img-icon" />
            <span>Download data </span>
          </button>
        </div>
      </AccordionItemPanel>
    </AccordionItem>
  );
}

export default Collect;
