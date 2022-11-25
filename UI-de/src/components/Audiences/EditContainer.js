import React, {useEffect} from 'react';
import AudienceForm from './AudienceForm';
import {useDispatch, useSelector} from 'react-redux';
import {updateAudience, loadAudience} from '../../actions/audience';

function EditContainer(props) {
  const initialValues = useSelector((state) => state.audience.currentAudience.audience);
  const dispatch = useDispatch();

  function handleSubmit(formData) {
    dispatch(updateAudience(formData, props.history));
  }

  useEffect(() => {
    dispatch(loadAudience(props.match.params.audienceId));
  }, []);

  return (
    <AudienceForm
      onSubmit={handleSubmit}
      initialValues={initialValues}
      history={props.history}
      isEdit
    />
  );
}

export default EditContainer;
