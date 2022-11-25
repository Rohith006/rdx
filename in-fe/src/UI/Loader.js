import React from "react";
import LoaderImg from "../assets/images/Loader.gif";

function Loader() {
  return (
    <div className="loader_cover">
      <img className="loader_basic" src={LoaderImg} alt="Loading...." />
    </div>
  );
}

export default Loader;
