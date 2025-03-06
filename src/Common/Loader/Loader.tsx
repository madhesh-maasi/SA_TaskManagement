import * as React from "react";
import "./Loader.scss";

const Loader = (): JSX.Element => {
  return (
    <div className="loader-container">
      <div className="loader">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
};
export default Loader;
