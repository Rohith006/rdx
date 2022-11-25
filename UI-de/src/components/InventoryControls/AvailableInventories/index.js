import React from "react";

export default function Index(props) {
  const {
    inventoriesList,
    filterInventoriesHandler,
    selectAllState,
    selectAllHandler,
  } = props;
  return (
    <div className="inventory">
      <div className="checkbox-control">
        <input
          type="checkbox"
          id="select-all"
          style={{ boxShadow: "none" }}
          checked={selectAllState}
          onChange={() => selectAllHandler(selectAllState)}
        />
        <label htmlFor="select-all">
          <div className="checkbox-control__indicator" />
          <span>Select All</span>
        </label>
      </div>
      <div className="inventory_cover">
        {inventoriesList.map((item, index) => {
          if (!item) {
            return null;
          }
          const logo = "/assets/images/ssp_default.png";
          return (
            <div
              className={`checkbox-control inventory-control tooltip-inv`}
              key={index}
            >
              <span className="logo-cover">
                <img className="logo" src={logo} />
              </span>
              <input
                type="checkbox"
                checked={!!item.checked}
                onChange={() => filterInventoriesHandler(item)}
              />
              <label htmlFor={item.id}>
                <div className="checkbox-control__indicator" />
                <span className="publisher-name">
                  {`(${item.id})`} {item.name}
                </span>
              </label>
              <span className="tooltiptext-inv">
                {`(${item.id})`} {item.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
