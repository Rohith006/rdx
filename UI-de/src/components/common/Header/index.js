import React, { Component, Fragment } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { NavLink, withRouter, Link } from "react-router-dom";
import classNames from "classnames";
import DisplayCheck from "../../../permissions";
import {
  ACCOUNT_MANAGER,
  ADMIN,
  ADVERTISER,
  OWNER,
  PUBLISHER,
} from "../../../constants/user";
import { logout, backToAdmin } from "../../../actions/auth";
import { logActivity } from "../../../actions/userActivity";
import localization from "../../../localization";
import { loadAdmins } from "../../../actions/users";
import CustomConfirm from "../../common/Views/Confirm";
import { confirmAlert } from "react-confirm-alert";
import { toFixedSummary } from "../../../utils/summary/summary";
import { loadSummary } from "../../../actions/summary";
import Notification_Display from "../Notification";

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      menuOpened: false,
    };
    this.openMenu = this.openMenu.bind(this);
    this.logout = this.logout.bind(this);
    this.onBackToAdmin = this.onBackToAdmin.bind(this);
    this.confirmBackToAdmin = this.confirmBackToAdmin.bind(this);
    this.handleMissClick = this.handleMissClick.bind(this);
  }

  logout() {
    const { history } = this.props;
    this.setState({
      menuOpened: false,
    });
    this.props.actions.logActivity({ type: "USER_LOGOUT" });
    this.props.actions.logout(history);
  }

  onBackToAdmin() {
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <CustomConfirm
            onConfirm={this.confirmBackToAdmin}
            onClose={onClose}
            msg={localization.confirm.backToAdmin}
          />
        );
      },
    });
  }

  confirmBackToAdmin() {
    this.props.actions.backToAdmin();
  }

  handleMissClick(e) {
    const submenu = document.querySelector(".header_dropdown-menu");
    if (e.target !== submenu) {
      document.removeEventListener("click", this.handleMissClick);
      this.setState({
        menuOpened: false,
      });
    }
  }

  openMenu() {
    this.setState({ menuOpened: !this.state.menuOpened });
    document.addEventListener("click", this.handleMissClick);
  }

  // openNotif() {
  //   this.setState({ menuOpened: !this.state.menuOpened })
  //   document.addEventListener('click', this.handleMissClick)
  // }

  componentDidMount() {
    const {
      auth: { currentUser },
    } = this.props;
    if (currentUser.role === ADMIN || currentUser.role === ACCOUNT_MANAGER) {
      this.props.actions.loadAdmins();
    }
  }

  render() {
    const menuClass = classNames({
      "header_dropdown-menu": true,
      opened: this.state.menuOpened,
    });
    let {
      auth: {
        currentUser: { balance, isAcceptedAgreement, role },
      },
      summary: { summary },
    } = this.props;
    summary = toFixedSummary(summary);

    const classHeader = classNames({
      header: true,
      disabled:
        !isAcceptedAgreement && ![OWNER, ADMIN, ACCOUNT_MANAGER].includes(role),
    });
    return (
      <header className={classHeader}>
        {this.props.auth.isAuthenticated ? (
          <NavLink to={`/dashboard`} className="header_left">
            <img
              src="/assets/images/desk-logo.png"
              className="header_logo"
              alt=""
            />
          </NavLink>
        ) : (
          ""
        )}
        {this.props.auth.isAuthenticated ? (
          <Fragment>
            <div className="header_right">
              <Notification_Display />
              <div className="header_dropdown">
                <div className="header_dropdown-item" onClick={this.openMenu}>
                  <div className="img_cover">
                    <img src="/assets/images/no_avatar-sm.jpg" alt="" />
                  </div>
                  <span className="title">
                    {this.props.auth.currentUser.name}
                  </span>
                  <span className="header_dropdown-arrow" />
                </div>
                <div className={menuClass}>
                  <Link to={`/account`} className="header_dropdown-menu-item">
                    {localization.header.myAccount}
                  </Link>
                  <DisplayCheck roles={[ADMIN, OWNER]}>
                    <Link
                      to="/platform-settings"
                      className="header_dropdown-menu-item"
                    >
                      {localization.header.settings}
                    </Link>
                  </DisplayCheck>
                  {/* <Link to="/help" className="header_dropdown-menu-item">{localization.header.helpFaq}</Link>*/}
                  <span
                    className="header_dropdown-menu-item"
                    onClick={this.logout}
                  >
                    {localization.header.signOut}
                  </span>
                </div>
              </div>
            </div>
          </Fragment>
        ) : (
          ""
        )}
      </header>
    );
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  summary: state.summary,
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(
    {
      logout,
      backToAdmin,
      loadAdmins,
      logActivity,
      loadSummary,
    },
    dispatch
  ),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Header));
