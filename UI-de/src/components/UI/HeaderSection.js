import React from "react";
import DisplayCheck from "../../permissions";
import {
  ACCOUNT_MANAGER,
  ADMIN,
  ADVERTISER,
  OWNER,
} from "../../constants/user";
import { Link } from "react-router-dom";

const HeaderSection = ({ path }) => (
  <div className="card_header bordered">
    <div className="subheading_cover">
      <h2 className="heading">Audiences</h2>
      <DisplayCheck roles={[ADMIN, OWNER, ADVERTISER, ACCOUNT_MANAGER]}>
        <Link to={path}>
          <button type="button" className="btn neutral add">
            ADD NEW
          </button>
        </Link>
      </DisplayCheck>
    </div>
  </div>
);

export default HeaderSection;
