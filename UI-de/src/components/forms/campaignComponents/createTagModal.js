import React, {useState} from 'react';
import {SketchPicker} from 'react-color';

export default function CreateTagModal({isOpenCreateTag, addTag, cancelHandler}) {
  const [value, setValue] = useState('');
  const [color, setColor] = useState('#fff');
  return (
    !isOpenCreateTag ? null :
    <div className="create-tag">
      <input
        type="text"
        className="name-tag"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Name"/>
      <SketchPicker
        color={color}
        onChangeComplete={(color) => setColor(color) }/>
      <div className="add-cancel-btn">
        <button
          type="button"
          onClick={() => {
            addTag(value, color);
            setValue('');
          }} className="btn light-blue add-tag">Add</button>
        <button
          type="button"
          onClick={() => {
            cancelHandler();
          }} className="btn light-blue cancel-tag">Cancel</button>
      </div>
    </div>
  );
}
