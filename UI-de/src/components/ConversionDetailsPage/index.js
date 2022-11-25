import React, {Fragment} from 'react';
import {bindActionCreators} from 'redux';
import {loadConversion} from '../../actions/conversion';
import connect from 'react-redux/es/connect/connect';

const styleSpan = {width: '140px', display: 'inline-block', margin: '0 15px 5px 0'};

class ConversionDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const {match: {params: {id}}} = this.props;
    this.props.actions.loadConversion(id);
  }

  render() {
    const {match: {params: {id}}, conversion: {currentConversion}} = this.props;
    return (
            !_.isEmpty(currentConversion) ?
                <Fragment>
                  <div><b>Conversion info {id}</b></div>
                  <hr/>
                  <div>
                    <span style={styleSpan}>Created at</span>
                    <span>{currentConversion.createdAt}</span>
                  </div>
                  <div>
                    <span style={styleSpan}>Click date</span>
                    <span>{currentConversion.clickDate}</span>
                  </div>
                  <div>
                    <span style={styleSpan}>Click ID</span>
                    <span>{currentConversion.clickId}</span>
                  </div>
                  <div>
                    <span style={styleSpan}>Status</span>
                    <span>{currentConversion.status}</span>
                  </div>
                  <div>
                    <span style={styleSpan}>Reject reason</span>
                    <span>{currentConversion.rejectReason[0]}</span>
                  </div>
                  <div>
                    <span style={styleSpan}>IP</span>
                    <span>{currentConversion.ip}</span>
                  </div>
                  <div>
                    <span style={styleSpan}>Referrer</span>
                    <span>{currentConversion.referrer}</span>
                  </div>
                  <div>
                    <span style={styleSpan}>Useragent</span>
                    <span>{currentConversion.userAgent}</span>
                  </div>
                  <div>
                    <span style={styleSpan}>Geo</span>
                    <span>{currentConversion.geo}</span>
                  </div>
                  <div>
                    <span style={styleSpan}>Campaign</span>
                    <span>{currentConversion.campaign}</span>
                  </div>
                  <div>
                    <span style={styleSpan}>Advertiser</span>
                    <span>{currentConversion.advertiser}</span>
                  </div>
                  <div>
                    <span style={styleSpan}>Publisher</span>
                    <span>{currentConversion.publisher}</span>
                  </div>
                  <div>
                    <span style={styleSpan}>Sub ID</span>
                    <span>{currentConversion.subId}</span>
                  </div>
                  <div>
                    <span style={styleSpan}>Publisher click ID</span>
                    <span>{currentConversion.pubClickId}</span>
                  </div>

                  <div>
                    <span style={styleSpan}>Total revenue</span>
                    <span>{currentConversion.payoutAdv[0]} USD</span>
                  </div>
                  <div>
                    <span style={styleSpan}>Payouts</span>
                    <span>{currentConversion.payoutPub[0]} USD</span>
                  </div>
                  <div>
                    <span style={styleSpan}>Earnings</span>
                    <span>{currentConversion.payoutAdv[0] - currentConversion.payoutPub[0]} USD</span>
                  </div>

                  <div>
                    <span style={styleSpan}>Platform</span>
                    <span>{currentConversion.platform[0].toLowerCase()}</span>
                  </div>
                  <div>
                    <span style={styleSpan}>Device</span>
                    <span>{currentConversion.deviceType[0].toLowerCase()}</span>
                  </div>

                  <div>
                    <span style={styleSpan}>Sub1</span>
                    <span>{currentConversion.sub1}</span>
                  </div>
                  <div>
                    <span style={styleSpan}>Sub2</span>
                    <span>{currentConversion.sub2}</span>
                  </div>
                  <div>
                    <span style={styleSpan}>Sub3</span>
                    <span>{currentConversion.sub3}</span>
                  </div>
                  <div>
                    <span style={styleSpan}>Sub4</span>
                    <span>{currentConversion.sub4}</span>
                  </div>
                  <div>
                    <span style={styleSpan}>Sub5</span>
                    <span>{currentConversion.sub5}</span>
                  </div>

                </Fragment> :
                null
    );
  }
}

const mapStateToProps = (state) => ({
  conversion: state.conversion,
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    loadConversion,
  }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(ConversionDetails);
