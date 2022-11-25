import React, { Component } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import Loader from "../../../assets/images/Loader.gif";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";

class PendingContainer extends Component {
  render() {
    const { isPending, children, className } = this.props;

    return (
      <div
        className={classNames("pending-container", {
          "pending-container--pending": isPending,
        })}
      >
        <div className={className?"pending-container__spinner setting":"pending-container__spinner"}>
          <img src={Loader} alt ="Loading...." height={150} width={180} />
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
