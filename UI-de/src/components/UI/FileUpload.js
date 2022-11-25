import React, {useRef, useState, useCallback} from 'react';
import PropTypes from 'prop-types';
import {NotificationManager} from 'react-notifications';

import {toBase64} from '../../utils/common';

/**
 * @param uploadedFile
 * @param types - example: ['text/plain']
 * @param extensions - example: ['.txt']
 * @param uploadFile - upload file handler
 * @param deleteFile - delete file handler
 */
const FileUpload = ({uploadedFile = null, types = [], extensions = [], uploadFile, deleteFile}) => {
  const refFile = useRef();
  const [file, setFile] = useState({name: uploadedFile});

  const changeFileHandler = useCallback(async (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const names = file.name.split('.');
      const fileExtension = names ? `.${names.pop()}` : null;

      if ((types.length && !types.includes(file.type)) || (extensions.length && !extensions.includes(fileExtension))) {
        NotificationManager.error(`Wrong file type. Upload ${extensions.toString()} file`);
        return;
      }

      setFile(file);
      await uploadFile({file: await toBase64(file)});
    }
  }, []);

  const deleteFileHandler = useCallback(async () => {
    setFile({name: null});
    await deleteFile(null);
  }, [setFile]);

  return !file.name ?
    <label className="btn light-blue">
      <input ref={refFile} type='file' style={{display: 'none'}} onChange={changeFileHandler}/>
      Upload
    </label> :
    <button type="button" className="btn light-blue name-ellipsis" disabled={false} onClick={deleteFileHandler}>
      <span>Remove</span>
    </button>;
};

FileUpload.propsType = {
  types: PropTypes.array,
  extensions: PropTypes.array.isRequired,
  uploadFile: PropTypes.func.isRequired,
  deleteFile: PropTypes.func.isRequired,
};

export default FileUpload;
