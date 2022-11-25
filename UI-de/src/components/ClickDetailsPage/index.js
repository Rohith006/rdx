import React, {Fragment} from 'react';
import {bindActionCreators} from 'redux';
import {loadClick} from '../../actions/click';
import connect from 'react-redux/es/connect/connect';

const styleSpan = {width: '140px', display: 'inline-block', margin: '0 15px 5px 0'};

class CurrentClickDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const {match: {params: {id}}} = this.props;
    this.props.actions.loadClick(id);
  }

  render() {
    const {match: {params: {id}}, click} = this.props;
    return (
      !_.isEmpty(click) ?
        <Fragment>
          <div><b>Click info {id}</b></div>
          <hr/>
          <div>
            <span style={styleSpan}>Created at</span>
            <span>{click.createdAt}</span>
          </div>
          <div>
            <span style={styleSpan}>Status</span>
            <span>{click.status}</span>
          </div>
          <div>
            <span style={styleSpan}>Reject reason</span>
            <span>{click.rejectReason && click.rejectReason[0]}</span>
          </div>
          <div>
            <span style={styleSpan}>IP</span>
            <span>{click.ip}</span>
          </div>
          <div>
            <span style={styleSpan}>Referrer</span>
            <span>{click.referrer}</span>
          </div>
          <div>
            <span style={styleSpan}>Useragent</span>
            <span>{click.userAgent}</span>
          </div>
          <div>
            <span style={styleSpan}>Geo</span>
            <span>{click.geo}</span>
          </div>
          <div>
            <span style={styleSpan}>Campaign</span>
            <span>{click.campaign}</span>
          </div>
          <div>
            <span style={styleSpan}>Advertiser</span>
            <span>{click.advertiser}</span>
          </div>
          <div>
            <span style={styleSpan}>Publisher</span>
            <span>{click.publisher}</span>
          </div>
          <div>
            <span style={styleSpan}>Sub ID</span>
            <span>{click.subId}</span>
          </div>
          <div>
            <span style={styleSpan}>Publisher click ID</span>
            <span>{click.pubclickId}</span>
          </div>
          <div>
            <span style={styleSpan}>Platform</span>
            <span>{click.platform && click.platform[0].toLowerCase()}</span>
          </div>
          <div>
            <span style={styleSpan}>Device</span>
            <span>{click.device && click.device[0].toLowerCase()}</span>
          </div>

          <div>
            <span style={styleSpan}>Sub1</span>
            <span>{click.sub1}</span>
          </div>
          <div>
            <span style={styleSpan}>Sub2</span>
            <span>{click.sub2}</span>
          </div>
          <div>
            <span style={styleSpan}>Sub3</span>
            <span>{click.sub3}</span>
          </div>
          <div>
            <span style={styleSpan}>Sub4</span>
            <span>{click.sub4}</span>
          </div>
          <div>
            <span style={styleSpan}>Sub5</span>
            <span>{click.sub5}</span>
          </div>

        </Fragment> : null
    );
  }
}

const mapStateToProps = (state) => ({
  click: state.click.currentClick,
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    loadClick,
  }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(CurrentClickDetails);
