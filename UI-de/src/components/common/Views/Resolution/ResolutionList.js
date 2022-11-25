import React, {useEffect, useState} from 'react';
import Select from 'react-select';
import makeAnimated from 'react-select/animated/dist/react-select.esm';

import validatorResolution from '../../../../utils/validation/resolution';

export default function Dropdown({formData, change, resolutions}) {
  if (!formData || !formData.resolutionsList) {
    return <div/>;
  }
  const animatedComponents = makeAnimated();
  const [valueText, setValueText] = useState([]);
  const [value, setValue] = useState([]);
  const [options, setOptions] = useState([]);
  const [createdValues, setCreatedValues] = useState([]);

  useEffect(() => {
    const list = formData.resolutionsList;
    if (list && list.length) {
      const newList = list.map((el) => ({label: el, value: el}));
      setValue(newList);
    }
  }, []);

  useEffect(() => {
    const newOptions = resolutions.map((el) => {
      const label = `${el.width}x${el.height}`;
      return ({label, value: label});
    });
    setOptions(newOptions);
  }, [resolutions]);

  function changeInputHandler(value) {
    setValueText(value);
  }

  function changeHandler(val) {
    setValue(val);
    change('resolutionsList', !val ? [] : val.map((el) => el.label));
  }

  function onKeyDown(e) {
    if (e.key !== 'Enter') {
      return;
    }
    e.preventDefault();
    if (!validatorResolution(valueText, options)) {
      return;
    }
    change('createdResolutions', formData.createdResolutions ? [...formData.createdResolutions, valueText] : [valueText]);
    setOptions([...options, ({label: valueText, value: valueText})]);
    setCreatedValues([...createdValues, ({label: valueText, value: valueText})]);
    setValueText('');
  }

  return (
    <div className="form-group">
      <div className="form__text-field__name">Resolution
        <div className="tooltip info">
          <span className="tooltiptext">Ex: 50x50</span>
        </div>
      </div>
      <div className="w100 mt2">
        <Select
          components={animatedComponents}
          onInputChange={changeInputHandler}
          className="country-select"
          inputValue={valueText}
          onChange={changeHandler}
          onKeyDown={onKeyDown}
          options={options}
          value={value}
          isMulti
        />
      </div>
    </div>
  );
}
