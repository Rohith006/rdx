import React, { Fragment, useEffect, useState } from "react";
import Select from "react-select";
import makeAnimated from "react-select/animated/dist/react-select.esm";
import {
  CARRIER,
  CARRIER_AND_WIFI,
  DESKTOP,
  MOBILE,
} from "../../../constants/campaigns";
import axios from "axios";
import { styles } from "../../UI/selectStyles";
const animatedComponents = makeAnimated();

const Carriers = (props) => {
  const init = { value: "-", label: "-" };
  const [carriers, setCarriers] = useState([init]);
  const [value, setValue] = useState([]);
  const { selectedCarriers } = props.formData;

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await axios("/campaigns/campaigns-carriers");
      setCarriers((arr) => [
        ...arr,
        ...data.map((el) => ({ value: el.name, label: el.name })),
      ]);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCarriers) {
      setValue(selectedCarriers.map((el) => ({ value: el, label: el })));
    }
  }, [selectedCarriers]);

  return (
    [CARRIER_AND_WIFI, CARRIER].includes(props.formData.connections) && (
      <div className="form-group">
        <div className="form__text-field__name">List of carriers</div>
        <Select
          className="input-md"
          placeholder="Select"
          options={carriers}
          isMulti
          styles={styles}
          theme={(theme) => ({
            ...theme,
            colors: {
              ...theme.colors,
              primary: "#000000",
            },
          })}
          components={animatedComponents}
          value={value}
          onChange={props.onSelectCarriesChange}
        />
      </div>
    )
  );
};

export default Carriers;
