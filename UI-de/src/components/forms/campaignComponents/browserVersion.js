import React, { useEffect, useState } from "react";
import Select from "react-select";
import browsers from "../../../../assets/files/browsers";
import { styles } from "../../UI/selectStyles";

const BrowserVersion = (props) => {
  const { selectedBrowsers } = props.formData;
  const [selectBrowsers, setSelectBrowsers] = useState([]);

  useEffect(() => {
    if (selectedBrowsers) {
      setSelectBrowsers(
        selectedBrowsers.map((el) => ({ value: el, label: el }))
      );
    }
  }, [selectedBrowsers]);

  const createGroup = (groupName, options, setValue) => {
    return {
      label: (() => {
        return (
          <div
            className="react-select-group"
            onClick={() =>
              setValue((value) =>
                value.concat(
                  options.filter((grpOpt) => !value.includes(grpOpt))
                )
              )
            }
          >
            {groupName}
          </div>
        );
      })(),
      options: options,
    };
  };

  let browserOptions = [
    { value: null, label: "-" },
    createGroup(
      "Google Chrome - SELECT ALL",
      browsers.chrome,
      setSelectBrowsers
    ),
    createGroup(
      "Apple Safari - SELECT ALL",
      browsers.safari,
      setSelectBrowsers
    ),
    createGroup(
      "Microsoft Edge - SELECT ALL",
      browsers.edge,
      setSelectBrowsers
    ),
    createGroup("UC Browser - SELECT ALL", browsers.uc, setSelectBrowsers),
    createGroup("Opera - SELECT ALL", browsers.opera, setSelectBrowsers),
    createGroup("Firefox - SELECT ALL", browsers.firefox, setSelectBrowsers),
  ];

  return (
    <div className="browsers">
      <div className="form-group browsers">
        <div className="br-container">
          <div className="form-group_col w100">
            <div className="form__text-field__name">Browser</div>
            <div className="w100">
              <Select
                className="country-select"
                options={browserOptions}
                isMulti
                value={selectBrowsers}
                onChange={props.onSelectBrowsersChange}
                styles={styles}
                theme={(theme) => ({
                  ...theme,
                  colors: {
                    ...theme.colors,
                    primary: "#000000",
                  },
                })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowserVersion;
