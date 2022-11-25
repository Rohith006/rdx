import React, { Component, Fragment } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { NavLink, withRouter } from "react-router-dom";
import classNames from "classnames";
import { confirmAlert } from "react-confirm-alert";
import DisplayCheck from "../../../permissions";
import CustomConfirm from "../../common/Views/Confirm";
import {
  ACCOUNT_MANAGER,
  ADMIN,
  ADVERTISER,
  OWNER,
  PUBLISHER,
} from "../../../constants/user";
import {
  ADVERTISERS,
  LOGS,
  PUBLISHERS,
} from "../../../constants/app";
import { logout, backToAdmin } from "../../../actions/auth";
import localization from "../../../localization";
import {
  loadAdmins,
  loadAdvertisers,
  loadPublishers,
} from "../../../actions/users";
import {
  SvgAdmin,
  SvgAdvert,
  SvgCampaigns,
  SvgDashboard,
  SvgLogs,
  SvgPub,
  SvgReports,
  SvgSettings,
  SvgUsers,
  SvgAudience,
} from "../Icons";

class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      menuOpened: true,
      iconTransform: true,
      width: window.innerWidth,
    };
    // this.openMenu = this.openMenu.bind(this);
    this.logout = this.logout.bind(this);
    // this.handleMissClick = this.handleMissClick.bind(this);
    this.onBackToAdmin = this.onBackToAdmin.bind(this);
    this.confirmBackToAdmin = this.confirmBackToAdmin.bind(this);
  }

  setActive(curr) {
    if (this.props.history.location.pathname.split("/")[1] === curr) {
      return true;
    }
  }

  logout() {
    // this.setState({
    //   menuOpened: false,
    // });
    this.props.actions.logout();
  }

  // handleMissClick(e) {
  //   const submenu = document.querySelector('.menu-dropdown');
  //   if (e.target !== submenu) {
  //     document.removeEventListener('click', this.handleMissClick);
  //     this.setState({
  //       menuOpened: false,
  //       iconTransform: false,
  //     });
  //   }
  // };

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
    const { auth, history } = this.props;
    this.props.actions.backToAdmin(auth, history);
  }

  // openMenu() {
  //   this.setState({menuOpened: !this.state.menuOpened});
  //   document.addEventListener('click', this.handleMissClick);

  //   this.setState((prevState) => ({
  //     iconTransform: !prevState.iconTransform,
  //   }));
  // }

  render() {
    const {
      auth: {
        currentUser: {
          isAcceptedAgreement,
          role,
          isCampaignsAllowed,
          isEnableDirectPublisher,
        },
      },
    } = this.props;
    const { nav } = localization.header;
    const menuClass = classNames({
      sidebar: true,
      // opened: this.state.menuOpened,
      disabled:
        !isAcceptedAgreement && ![OWNER, ADMIN, ACCOUNT_MANAGER].includes(role),
    });

    return (
      <Fragment>
        {this.props.auth.isAuthenticated ? (
          <nav className={this.props.auth.currentUser.role === "ADMIN" ? "sidebar" : "sidebar-admin"}>
            <div className="sidebar_nav">
              <DisplayCheck
                roles={[ADMIN, OWNER, ADVERTISER, PUBLISHER, ACCOUNT_MANAGER]}
                label={["ADVERTISERS", "PUBLISHERS"]}
              >
                <NavLink to={`/dashboard`} className="sidebar-tab">
                  <span className={`sidebar_nav-link${ this.setActive("dashboard") ? " active" : "" }`}>
                    <span className="icon"><SvgDashboard /></span>
                    <span className="sidebar_nav-link_text">{nav.dashboard}</span>
                  </span>
                </NavLink>
              </DisplayCheck>
              <DisplayCheck
                roles={[ADMIN, OWNER, ACCOUNT_MANAGER]}
                label={[ADVERTISERS]}
              >
                <NavLink to={`/advertisers`} className="sidebar-tab">
                  <span className={`sidebar_nav-link${ this.setActive("advertisers") ? " active" : "" }`}>
                    <span className="icon"><SvgAdvert /></span>
                    <span className="sidebar_nav-link_text">{nav.advertisers}</span>
                  </span>
                </NavLink>
              </DisplayCheck>
              <DisplayCheck
                roles={[ADMIN, OWNER, ACCOUNT_MANAGER]}
                label={[PUBLISHERS]}
              >
                <NavLink to={`/publishers`} className="sidebar-tab">
                  <span className={`sidebar_nav-link${ this.setActive("publishers") ? " active" : "" }`}>
                    <span className="icon"><SvgPub /></span>
                    <span className="sidebar_nav-link_text">{nav.publishers}</span>
                  </span>
                </NavLink>
              </DisplayCheck>
              {(!isCampaignsAllowed && role === ADVERTISER) || role === PUBLISHER ? null : (
                <DisplayCheck
                  roles={[OWNER, ADMIN, ACCOUNT_MANAGER, ADVERTISER]}
                  label={["ADVERTISERS"]}
                >
                  <NavLink to={`/campaigns`} className="sidebar-tab">
                    <span className={`sidebar_nav-link${ this.setActive("campaigns") ? " active" : "" }`}>
                      <span className="icon"><SvgCampaigns /></span>
                      <span className="sidebar_nav-link_text">{nav.campaigns}</span>
                    </span>
                  </NavLink>
                </DisplayCheck>
              )}
              {__DEV_MODE__ ? (!isCampaignsAllowed && role === ADVERTISER ? null : (
                  <DisplayCheck
                    roles={[OWNER, ADMIN, ACCOUNT_MANAGER, ADVERTISER]}
                    label={["ADVERTISERS"]}
                  >
                    <NavLink to={`/audiences`} className="sidebar-tab">
                      <span className={`sidebar_nav-link${ this.setActive("audiences") ? " active" : "" }`}>
                        <span className="icon"><SvgAudience /></span>
                        <span className="sidebar_nav-link_text">Audience</span>
                      </span>
                    </NavLink>
                  </DisplayCheck>
                )
              ) : null}
              {!isCampaignsAllowed && role === ADVERTISER ? null : (
                <DisplayCheck
                  roles={[OWNER, ADMIN, ACCOUNT_MANAGER, ADVERTISER, PUBLISHER]}
                  label={["ADVERTISERS", "PUBLISHERS"]}
                >
                  <NavLink to={`/reports`} className="sidebar-tab">
                    <span className={`sidebar_nav-link${ this.setActive("reports") ? " active" : "" }`}>
                      <span className="icon"><SvgReports /></span>
                      <span className="sidebar_nav-link_text">{nav.reports}</span>
                    </span>
                  </NavLink>
                </DisplayCheck>
              )}
              <DisplayCheck roles={[ADMIN, OWNER]}>
                <NavLink to={`/users`} className="sidebar-tab">
                  <span className={`sidebar_nav-link${ this.setActive("users") ? " active" : "" }`}>
                    <span className="icon"><SvgUsers /></span>
                    <span className="sidebar_nav-link_text">{nav.users}</span>
                  </span>
                </NavLink>
              </DisplayCheck>
              {!isCampaignsAllowed && role === ADVERTISER ? null : (
                <DisplayCheck
                  roles={[ADMIN, OWNER, ADVERTISER, ACCOUNT_MANAGER]}
                  label={["ADVERTISERS"]}
                >
                  <NavLink to={`/settings`} className="sidebar-tab">
                    <span className={`sidebar_nav-link${ this.setActive("settings") ? " active" : "" }`}>
                      <span className="icon"><SvgSettings /></span>
                      <span className="sidebar_nav-link_text">{nav.settings}</span>
                    </span>
                  </NavLink>
                </DisplayCheck>
              )}
              <DisplayCheck
                roles={[ADMIN, OWNER, ACCOUNT_MANAGER]}
                label={[LOGS]}
              >
                <NavLink to={`/logs`} className="sidebar-tab">
                  <span className={`sidebar_nav-link${ this.setActive("logs") ? " active" : "" }`}>
                    <span className="icon"><SvgLogs /></span>
                    <span className="sidebar_nav-link_text">{nav.logs}</span>
                  </span>
                </NavLink>
              </DisplayCheck>
            </div>
            <DisplayCheck roles={[ADVERTISER, PUBLISHER]}>
              {this.props.auth.loginAs === true && (
                <div className="admin_nav" onClick={this.onBackToAdmin}>
                  <span className="icon">
                    <SvgAdmin />
                  </span>
                  <span className="sidebar_nav-link_text admin">
                    {nav.backToAdmin}
                  </span>
                </div>
              )}
            </DisplayCheck>
          </nav>
        ) : (
          ""
        )}
      </Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(
    {
      logout,
      loadAdmins,
      loadAdvertisers,
      loadPublishers,
      backToAdmin,
    },
    dispatch
  ),
});

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Sidebar)
);
