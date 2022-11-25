import React, { useState, useRef } from "react";
import axios from "axios";
import Papa from "papaparse";
import { NotificationManager } from "react-notifications";
import Upload from "../../../../../assets/images/icons/upload.svg";
import { SvgDelete } from "../../../common/Icons";

function ChooseFile({ change, initialLabel = "choose csv file", formData }) {
  const [isReady, setIsReady] = useState(false);
  const [inputFile, setInputFile] = useState(null);

  const fileRef = useRef(null);

  const handleRemoveCsv = () => {
    setIsReady(false);
    change("ifas", []);
    setInputFile(null);
  };

  const handleUploadCsv = (file, e) => {
    if (!new RegExp(".csv", "i").test(file.name)) {
      return NotificationManager.error(
        `Wrong ${file.name} file format. Please upload .csv only.`
      );
    }
    const results = [];
    const onCompleteHandler = () => {
      const ifas = [];
      results.map(({ data }) => {
        const id = Object.values(data)[0];
        id && ifas.push(id);
      });
      setIsReady(true);
      change("ifas", ifas);
    };
    Papa.parse(file, {
      worker: true,
      delimiter: "",
      complete: onCompleteHandler,
      step: (chunk) => results.push(chunk),
      header: true,
    });
  };
  const onChangeEvent = (e) => {
    handleUploadCsv(e.target.files[0]);
    setInputFile(e.target.files[0]);
  };
  return (
    <div className="flex mr2">
      <div className="mr2">
        <span className="form__text-field__name">Upload CSV file</span>
        <div className="tooltip info">
          <span className="tooltiptext">
            Choose a CSV file to upload. The list of User IFAs should be in the
            first column.
          </span>
        </div>
        <div className="upload">
          <input
            type="file"
            name="file"
            id="audienceFile"
            className="inputfile"
            onChange={onChangeEvent}
          />
          <label htmlFor="audienceFile" className=" btn light-blue-upload">
            <img className="img-icon" src={Upload} />
            <span> {initialLabel}</span>
          </label>
        </div>
        <div classname="upload">
          <label>
            {inputFile ? (
              <div className="uploaded">
                <span className="file">Uploaded file:</span>
                <div className="uploaded-file">
                  <span>{inputFile.name}</span>
                  <span className="editor-control" onClick={handleRemoveCsv}>
                    <SvgDelete />
                  </span>
                </div>
              </div>
            ) : null}
          </label>
        </div>
      </div>
    </div>
  );
}

export default ChooseFile;
