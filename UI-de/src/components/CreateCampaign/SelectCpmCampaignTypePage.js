import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import localization from "../../localization";

class SelectCpmCampaignTypePage extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Fragment>
        <Link to={"/campaigns"} className="go-back_link">
          {localization.campaigns.goBack}
        </Link>
        <div className="card">
          <div className="card_header bordered">
            <h2 className="heading"> {localization.createCampaign.titleAdd}</h2>
          </div>
          <div className="card_body campaign_type">
            <div className="campaign_type-item">
              <Link to="/campaigns/create/banner" className="item">
                <span className="icon banner" />
                <span className="text">Banner</span>
              </Link>
            </div>
            <div className="campaign_type-item">
              <Link to="/campaigns/create/native-ad" className="item">
                <span className="icon native" />
                <span className="text">Native</span>
              </Link>
            </div>
            <div className="campaign_type-item">
              <Link to="/campaigns/create/video-ad" className="item">
                <span className="icon video" />
                <span className="text">Video</span>
              </Link>
            </div>
            <div className="campaign_type-item">
              <Link to="/campaigns/create/audio-ad" className="item">
                <span className="icon audio" />
                <span className="text">Audio</span>
              </Link>
            </div>
            <div className="campaign_type-item">
              <Link to="/campaigns/create/ctv-ad" className="item">
                <span className="icon connectedtv" />
                <span className="text">Connected TV</span>
              </Link>
            </div>
            <div className="campaign_type-item disabled">
              <Link to="/campaigns/create/outdoor-ad" className="item">
                <span className="icon outdoor" />
                <span className="text">DOOH</span>
              </Link>
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps, null)(SelectCpmCampaignTypePage);
