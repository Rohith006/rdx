import React, {Fragment} from 'react';
import {bindActionCreators} from 'redux';
import {loadImpression} from '../../actions/impression';
import connect from 'react-redux/es/connect/connect';

const styleSpan = {width: '140px', display: 'inline-block', margin: '0 15px 5px 0'};

class ImpressionDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const {match: {params: {id}}} = this.props;
    this.props.actions.loadImpression(id);
  }

  render() {
    const {match: {params: {id}}, impression: {currentImpression}} = this.props;
    return (
      !_.isEmpty(currentImpression) ?
        <Fragment>
          <div><b>Impression info {id}</b></div>
          <hr/>
          <div>
            <span style={styleSpan}>Created at</span>
            <span>{currentImpression.createdAt}</span>
          </div>
          <div>
            <span style={styleSpan}>Status</span>
            <span>{currentImpression.status}</span>
          </div>
          <div>
            <span style={styleSpan}>Reject reason</span>
            <span>{currentImpression.rejectReason && currentImpression.rejectReason[0]}</span>
          </div>
          <div>
            <span style={styleSpan}>IP</span>
            <span>{currentImpression.ip}</span>
          </div>
          <div>
            <span style={styleSpan}>Referrer</span>
            <span>{currentImpression.referrer}</span>
          </div>
          <div>
            <span style={styleSpan}>Useragent</span>
            <span>{currentImpression.userAgent}</span>
          </div>
          <div>
            <span style={styleSpan}>Geo</span>
            <span>{currentImpression.geo}</span>
          </div>
          <div>
            <span style={styleSpan}>Campaign</span>
            <span>{currentImpression.campaign}</span>
          </div>
          <div>
            <span style={styleSpan}>Advertiser</span>
            <span>{currentImpression.advertiser}</span>
          </div>
          <div>
            <span style={styleSpan}>Publisher</span>
            <span>{currentImpression.publisher}</span>
          </div>
          <div>
            <span style={styleSpan}>Sub ID</span>
            <span>{currentImpression.subId}</span>
          </div>
          <div>
            <span style={styleSpan}>Publisher click ID</span>
            <span>{currentImpression.pubClickId}</span>
          </div>

          <div>
            <span style={styleSpan}>Total revenue</span>
            <span>{currentImpression.payoutAdv[0]} USD</span>
          </div>
          <div>
            <span style={styleSpan}>Payouts</span>
            <span>{currentImpression.payoutPub[0]} USD</span>
          </div>
          <div>
            <span style={styleSpan}>Earnings</span>
            <span>{currentImpression.payoutAdv[0] - currentImpression.payoutPub[0]} USD</span>
          </div>

          <div>
            <span style={styleSpan}>Platform</span>
            <span>{currentImpression.platform && currentImpression.platform[0].toLowerCase()}</span>
          </div>
          <div>
            <span style={styleSpan}>Device</span>
            <span>{currentImpression.device && currentImpression.device[0].toLowerCase()}</span>
          </div>

          <div>
            <span style={styleSpan}>Sub1</span>
            <span>{currentImpression.sub1}</span>
          </div>
          <div>
            <span style={styleSpan}>Sub2</span>
            <span>{currentImpression.sub2}</span>
          </div>
          <div>
            <span style={styleSpan}>Sub3</span>
            <span>{currentImpression.sub3}</span>
          </div>
          <div>
            <span style={styleSpan}>Sub4</span>
            <span>{currentImpression.sub4}</span>
          </div>
          <div>
            <span style={styleSpan}>Sub5</span>
            <span>{currentImpression.sub5}</span>
          </div>

        </Fragment> :
        null
    );
  }
}

const mapStateToProps = (state) => ({
  impression: state.impression,
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    loadImpression,
  }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(ImpressionDetails);
