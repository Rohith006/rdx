import {Field} from 'redux-form';
import {renderCheckboxField} from '../CampaignTagsComponents/inputs';
import React from 'react';

export default function List({filteredList, handleClick, handleDelete}) {
  const newFilterList = filteredList.filter((el) => !el.delete);
  return (
    <div className="tags-list">
      {
        newFilterList.map((el) => (
          <Field
            key={el.id}
            id={el.id}
            type="checkbox"
            color={el.color}
            name={el.name}
            checked={el.isChecked ? true : false}
            handleClick={handleClick}
            handleDelete={handleDelete}
            component={renderCheckboxField}
          />
        ))
      }
    </div>
  );
}
