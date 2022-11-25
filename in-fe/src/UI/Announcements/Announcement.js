import React from "react";
import "./announcement.scss";
import comingSoon from "../../assets/images/coming_soon.svg";

function Announcement({ header, title }) {
  return (
    <div className="flex flex-col items-center p-5">
      <img className="announcement_img" alt="coming soon" src={comingSoon} />
      <h1 className="announcement_title font-dark">{header}</h1>
      {title}
    </div>
  );
}

export default Announcement;
