import React, { Component } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import Loader2 from "../../../assets/images/Loader2.gif";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";

class PendingContainer extends Component {
  render() {
    const { isPending, children } = this.props;

    return (
      <div
        className={classNames("pending-container", {
          "pending-container--pending": isPending,
        })}
      >
        <div className="pending-container__spinner">
          <img src={Loader2} alt="Loading...." height={70} width={90} />
        </div>
        <div className="pending-container__children">{children}</div>
      </div>
    );
  }
}

PendingContainer.propTypes = {
  isPending: PropTypes.bool,
};

export default PendingContainer;
