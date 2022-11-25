import React, {Component, Fragment} from 'react';

class Overlay extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <Fragment>
        <div className="background-overlay"/>
        {/* <div className="overlay"/>*/}
      </Fragment>
    );
  }
}

export default (Overlay);
