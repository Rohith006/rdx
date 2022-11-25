import React from "react";
import { Link } from "react-router-dom";

const BackTo = ({ path, text }) => (
  <Link to={path} className="go-back_link">{`Back to ${text} view`}</Link>
);

export default BackTo;
