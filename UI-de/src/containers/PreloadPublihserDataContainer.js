import React, {Fragment} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {loadSummary} from '../actions/summary';

class PreloadPublisherDataContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.props.actions.loadSummary();
  }

  render() {
    return (
      <Fragment>
        {this.props.children}
      </Fragment>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    loadSummary,
  }, dispatch),
});

export default connect(null, mapDispatchToProps)(PreloadPublisherDataContainer);
