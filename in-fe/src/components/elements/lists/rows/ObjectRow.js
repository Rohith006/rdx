import React, { useState } from "react";
import "./ObjectRow.scss";
import JsonStringify from "../../misc/JsonStingify";
import Button from "../../forms/Button";
import { TiBusinessCard } from "react-icons/ti";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import { BsArrowsExpand, BsArrowsCollapse } from "react-icons/bs";
import { FaUserAlt, FaBirthdayCake } from "react-icons/fa";
import { AiTwotoneMail } from "react-icons/ai";
import { MdDriveFileRenameOutline } from "react-icons/md";
import {
  BsFillTelephoneFill,
  BsFacebook,
  BsTwitter,
  BsWhatsapp,
} from "react-icons/bs";
import marital from "../../../../assets/images/marital.svg";

import moment from "moment";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { string } from "prop-types";

export function ObjectRow({
  row,
  timeField,
  onClick,
  filterFields,
  displayDetailButton,
  timeFieldWidth,
}) {
  const [toggle, setToggle] = useState(false);
  const [arrow, setArrow] = useState(false);

  const widthStyle =
    typeof timeFieldWidth !== "undefined"
      ? timeFieldWidth > 0
        ? { minWidth: timeFieldWidth, maxWidth: timeFieldWidth }
        : false
      : {};

  const renderToggleIcon = () => {
    return toggle ? (
      <BsArrowsCollapse size={30} />
    ) : (
      <BsArrowsExpand size={30} />
    );
  };

  const toggleIcon = () => {
    setToggle(!toggle);
  };

  const onDetails = () => {
    onClick(row.itemId);
  };

  const toggleArrow = () => {
    setArrow(!arrow);
  };

  const renderData = (data) => {
    if (data) {
      const { ip, status, profile_less, debug } = data;
      return (
        <div>
          <div>
            <span className="Data_content_title">IP:</span>
            <span>{ip}</span>
          </div>
          <div>
            <span className="Data_content_title">Status:</span>
            <span>{status}</span>
          </div>
          <div>
            <span className="Data_content_title">Profile less:</span>
            <span>{`${profile_less}`}</span>
          </div>
          <div>
            <span className="Data_content_title">Debug:</span>
            <span>{`${debug}`}</span>
          </div>
        </div>
      );
    }
  };

  const renderPii = (data) => {
    if (data) {
      const {
        name,
        birth_date,
        email,
        facebook,
        last_name,
        marital_status,
        telephone,
        twitter,
        whatsapp,
      } = data;
      return (
        <div>
          <div className="flex">
            <span className="Data_content_title flex items-center">
              <span className="Data_content_icon">
                <FaUserAlt />
              </span>
              Name:
            </span>
            <span>{`${name}`}</span>
          </div>
          <div className="flex">
            <span className="Data_content_title flex items-center">
              <span className="Data_content_icon">
                <FaBirthdayCake />
              </span>
              Birth date:
            </span>
            <span>{`${birth_date}`}</span>
          </div>
          <div className="flex">
            <span className="Data_content_title flex items-center">
              <span className="Data_content_icon">
                <AiTwotoneMail />
              </span>
              Email:
            </span>
            <span>{`${email}`}</span>
          </div>
          <div className="flex">
            <span className="Data_content_title flex items-center">
              <span className="Data_content_icon">
                <BsFacebook />
              </span>
              Facebook:
            </span>
            <span>{`${facebook}`}</span>
          </div>
          <div className="flex">
            <span className="Data_content_title flex items-center">
              <span className="Data_content_icon">
                <MdDriveFileRenameOutline />
              </span>
              Last name:
            </span>
            <span>{`${last_name}`}</span>
          </div>
          <div className="flex">
            <span className="Data_content_title flex items-center">
              <span className="Data_content_icon">
                <img src={marital} />
              </span>
              Marital status:
            </span>
            <span>{`${marital_status}`}</span>
          </div>
          <div className="flex">
            <span className="Data_content_title flex items-center">
              <span className="Data_content_icon">
                <BsFillTelephoneFill />
              </span>
              Telephone:
            </span>
            <span>{`${telephone}`}</span>
          </div>
          <div className="flex">
            <span className="Data_content_title flex items-center">
              <span className="Data_content_icon">
                <BsWhatsapp />
              </span>
              Whatsapp:
            </span>
            <span>{`${whatsapp}`}</span>
          </div>
          <div className="flex">
            <span className="Data_content_title flex items-center">
              <span className="Data_content_icon">
                <BsTwitter />
              </span>
              Twitter:
            </span>
            <span>{`${twitter}`}</span>
          </div>
        </div>
      );
    }
  };

  const renderOperation = (data) => {
    if (data) {
      const { segment, update, new: name } = data;
      return (
        <div>
          <div>
            <span className="Data_content_title">New:</span>
            <span>{`${name}`}</span>
          </div>
          <div>
            <span className="Data_content_title">Segment:</span>
            <span>{`${segment}`}</span>
          </div>
          <div>
            <span className="Data_content_title">Update:</span>
            <span>{`${update}`}</span>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="EventRow">
      <div className="Header">
        {/* <div className="Toggle" onClick={toggleIcon}>
          <span style={{ border: "solid 1px gray" }}>{renderToggleIcon()}</span>
        </div> */}
        {widthStyle && (
          <div className="Timestamp" style={widthStyle}>
            <div style={{ width: "100%" }}>
              {timeField(row).map((field, index) => (
                <div key={index}>
                  {typeof field === "string"
                    ? moment(field).format("dddd, MMMM Do YYYY, h:mm:ss a")
                    : field}
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="Data">
          <div className="Data_content">
            <span>
              <span className="Data_content_title">ID:</span>
              {row.id && row.id}
            </span>
            <div>
              {row.metadata && row.metadata.ip && (
                <Accordion
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <AccordionSummary
                    className="collapsible"
                    onClick={toggleArrow}
                  >
                    <Typography>Metadata</Typography>
                    {arrow ? <IoIosArrowUp /> : <IoIosArrowDown />}
                  </AccordionSummary>
                  <AccordionDetails>
                    {renderData(row.metadata)}
                  </AccordionDetails>
                </Accordion>
              )}
              {row.pii && (
                <Accordion
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <AccordionSummary
                    className="collapsible"
                    onClick={toggleArrow}
                  >
                    <Typography>Pii</Typography>
                    {arrow ? <IoIosArrowUp /> : <IoIosArrowDown />}
                  </AccordionSummary>
                  <AccordionDetails>{renderPii(row.pii)}</AccordionDetails>
                </Accordion>
              )}
              {row.operation && (
                <Accordion
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <AccordionSummary
                    className="collapsible"
                    onClick={toggleArrow}
                  >
                    <Typography>Operation</Typography>
                    {arrow ? <IoIosArrowUp /> : <IoIosArrowDown />}
                  </AccordionSummary>
                  <AccordionDetails>
                    {renderOperation(row.operation)}
                  </AccordionDetails>
                </Accordion>
              )}
            </div>
          </div>
          {displayDetailButton && (
            <Button
              label="Details"
              icon={<TiBusinessCard size={20} style={{ marginRight: 5 }} />}
              style={{ margin: 5, padding: "5px 10px" }}
              onClick={onDetails}
            />
          )}
          {/* <JsonStringify data={row} filter={(!toggle) ? filterFields: []} unfold={toggle}/> */}
        </div>
      </div>
    </div>
  );
}

function rowsAreEqual(prevRow, nextRow) {
  return prevRow.id === nextRow.id;
}

export const MemoObjectRow = React.memo(ObjectRow, rowsAreEqual);
