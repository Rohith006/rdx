import React from 'react';
import AudienceForm from './AudienceForm';
import {useDispatch} from 'react-redux';
import {initialValues} from './Utils';
import {createAudience} from '../../actions/audience';

function CreateContainer(props) {
  const dispatch = useDispatch();

  function handleSubmit(formData) {
    dispatch(createAudience(formData, props.history));
  }

  return (
    <AudienceForm
      onSubmit={handleSubmit}
      initialValues={initialValues}
      history={props.history}
      isEdit
    />
  );
}

export default CreateContainer;
