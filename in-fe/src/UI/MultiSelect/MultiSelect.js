import React, { useEffect, useState } from "react";
import search from "../../assets/images/icons/search.svg";
import right_arrow from "../../assets/images/icons/right_arrow.svg";
import FlowNodeIcons from "../../components/flow/FlowNodeIcons";

function MultiSelect({
  initValue,
  onSetValue,
  open,
  data,
  setOpen,
  type,
  delete_,
  setDelete,
  setSelected_,
}) {
  const [selected, setSelected] = useState([]);
  const [searchData, setSearchData] = useState(data);
  const [value, setValue] = useState(null);

  const handleChange = (value, label) => {
    const obj = Object.keys(data).find((key) => data[key] === value);
    const final =
      type === "destination" ? value?.id : { id: obj, name: value?.name };
    onSetValue(final);
    setOpen(false);
    setValue(null);
    setDelete(false);
  };

  const handleInputChange = (e) => {
    setValue(e.target.value);
    const filtered = Object.values(data)
      .map((item) => item)
      .filter((item) =>
        item?.name
          .toLocaleLowerCase()
          .includes(e.target.value.toLocaleLowerCase())
      );
    setSearchData(filtered);
  };

  useEffect(() => {
    const filtered = Object.values(data)
      .map((item) => item)
      .find((item) =>
        type === "destination"
          ? item?.id === initValue
          : item.name === initValue?.name
      );
    setSelected(filtered);
    setSelected_ && setSelected_(filtered);
    setSearchData(data);
    if (delete_) {
      setSelected(null);
    }
  }, [initValue, data, type, delete_, setSelected_]);

  return (
    <>
      {open && (
        <div className="multiselect_container card">
          <div className="multiselect_header">
            <div className="relative flex items-center">
              <img
                className="absolute multiselect_input-img"
                src={search}
                alt="search"
              />
              <input
                onChange={handleInputChange}
                value={value}
                type="text"
                placeholder="Search by connector type, destination..."
              />
            </div>
            <div className="multiselect_category-container">
              <span className="multiselect_category-item">All</span>
            </div>
          </div>
          {selected && (
            <div className="multiselect_selected">
              <span className="multiselect_selected-title">Selected</span>
              <div className="multiselect_selected-item">
                <div className="flex items-center">
                  <div className="multiselect_selected-item_img">
                    <FlowNodeIcons icon={selected.icon && selected.icon} />
                  </div>
                  <div className="flex flex-col">
                    <span className="multiselect_selected-item_name">
                      {selected?.name}
                    </span>
                    <span className="multiselect_selected-item_category">
                      All
                    </span>
                  </div>
                </div>
                <img src={right_arrow} alt="arrow" />
              </div>
            </div>
          )}
          <div className="multiselect_list">
            {Object.entries(searchData).map(([label, value]) => {
              return (
                <div
                  className={`multiselect_list-item  flex justify-between ${
                    initValue?.id === label ? "active" : ""
                  }`}
                  onClick={(e) => handleChange(value, label)}
                >
                  <div className="flex items-center">
                    <div className="multiselect_list-item_img">
                      <FlowNodeIcons icon={value.icon && value.icon} />
                    </div>
                    <div className="flex flex-col">
                      <span className="multiselect_list-item_name">
                        {value?.name}
                      </span>
                      <span className="multiselect_list-item_category">
                        All
                      </span>
                    </div>
                  </div>
                  <img src={right_arrow} alt="arrow" />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

export default MultiSelect;
