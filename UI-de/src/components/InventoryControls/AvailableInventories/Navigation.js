import React from "react";

export default function Navigation(props) {
  const { filterHandler, selectAllState, selectAllHandler } = props;
  return (
    <div className="search-inventory-control">
      <div className="search-box search_cover">
        <input
          type="text"
          placeholder="Search..."
          className="search-tag"
          onChange={(e) => filterHandler(e)}
        />
      </div>
      {/* <div className="checkbox-control">
        <input
          type="checkbox"
          id="select-all"
          checked={selectAllState}
          onChange={() => selectAllHandler(selectAllState)}
        />
        <label htmlFor="select-all">
          <div className="checkbox-control__indicator" />
          <span>Select All</span>
        </label>
      </div> */}
    </div>
  );
}
