import React, { Fragment } from "react";
import DisplayCheck from "../../../permissions";
import {
  ACCOUNT_MANAGER,
  ADMIN,
  ADVERTISER,
  OWNER,
  PUBLISHER,
} from "../../../constants/user";
import Earning from "../../../../assets/images/icons/earning.svg";
import Wallet from "../../../../assets/images/icons/walletAdv.svg";
import { useSelector } from "react-redux";
import { toFixedSummary } from "../../../utils/summary/summary";
import ToggleButton from "./ToggleButton";

function TopBar(props) {
  const [value, setValue] = React.useState(true);

  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  let summary = useSelector((state) => state.summary);
  const balance = useSelector((state) => state.auth.currentUser.balance);
  summary = toFixedSummary(summary);

  const handleToggle = (data) => {
    setValue(data);
  };

  return (
    <div className="topbar_container">
      {isAuthenticated ? (
        <Fragment>
          <div className="header_leftbar ">
            <span className="header_title">{props.title}</span>
            <span className="header_today">{props.subtitle}</span>
          </div>
          <div className="header_rightbar ">
            <DisplayCheck roles={[ADVERTISER]}>
              <img src={Wallet} />
            </DisplayCheck>

            <DisplayCheck
              roles={[ADMIN, ACCOUNT_MANAGER]}
              label={["SEE_PROFIT"]}
            >
              <img src={Earning} />
            </DisplayCheck>

            <div className="header_info">
              <div className="header_info-item">
                <DisplayCheck roles={[ADVERTISER]}>
                  {value ? (
                    <div>
                      <span className="title">this Month</span>
                      <span className="value">
                        ${" "}
                        {summary.summary.thisMonthRevenue
                          ? summary.summary.thisMonthRevenue.toFixed(2)
                          : 0}
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="title">balance</span>
                      <span className="value">$ {balance || 0}</span>
                    </div>
                  )}
                </DisplayCheck>

                <DisplayCheck
                  roles={[ADMIN, ACCOUNT_MANAGER]}
                  label={["SEE_PROFIT"]}
                >
                  {value ? (
                    <div>
                      <span className="title">Earning</span>
                      <span className="value">
                        ${" "}
                        {summary.summary.thisMonthProfit
                          ? summary.summary.thisMonthProfit.toFixed(2)
                          : 0}
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="title">Earning</span>
                      <span className="value">
                        ${" "}
                        {summary.summary.lastMonthProfit
                          ? summary.summary.lastMonthProfit.toFixed(2)
                          : 0}
                      </span>
                    </div>
                  )}
                </DisplayCheck>

                <DisplayCheck roles={[PUBLISHER]}>
                  {value ? (
                    <div>
                      <span className="title">Earning</span>
                      <span className="value">
                        ${" "}
                        {summary.summary.thisMonthRevenue
                          ? summary.summary.thisMonthRevenue.toFixed(2)
                          : 0}
                      </span>
                    </div>
                  ) : null}
                </DisplayCheck>
              </div>
              <div className="header_info-item">
                <DisplayCheck roles={[PUBLISHER]}>
                  {!value ? (
                    <div>
                      <span className="title">Earning:</span>
                      <span className="value">
                        ${" "}
                        {summary.summary.lastMonthRevenue
                          ? summary.summary.lastMonthRevenue.toFixed(2)
                          : 0}
                      </span>
                    </div>
                  ) : null}
                </DisplayCheck>
              </div>

              <ToggleButton handleToggle={handleToggle} />
            </div>
          </div>
        </Fragment>
      ) : (
        ""
      )}
    </div>
  );
}

export default TopBar;
