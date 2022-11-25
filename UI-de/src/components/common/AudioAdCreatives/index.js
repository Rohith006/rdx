import React, { useEffect, useState, useRef, useMemo, Fragment } from "react";
import { Field } from "redux-form";
import axios from "axios";
import UploadIcon from "../../../../assets/images/icons/cloud.svg";

import localization from "../../../localization";
import {
  AUDIO_ADS_EXTENSIONS,
  AUDIO_ADS_AUDIO_FILE_SIZE,
} from "../../../constants/app";
import { NotificationManager } from "react-notifications";
import Table from "antd/es/table";
import { SvgDelete, SvgDownLoadArr } from "../Icons";
import classNames from "classnames";

import {
  required,
  isNumber,
  audioDurationValidator,
} from "../../../utils/validatorUtils";

const urlCreativesInfo = "/database/load/creatives-info/";

const AudioAdCreatives = (props) => {
  const {
    campaign,
    change,
    renderRegularTextField,
    firstSubmit,
    monetizationType,
  } = props;
  const [imageData, setImageData] = useState(null);
  const [audioData, setAudioData] = useState(null);
  const [creativeData, setCreativeData] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const imageUploadInput = useRef();
  const audioUploadInput = useRef();

  useEffect(() => {
    if (campaign.id) {
      loadCreatives();
    }
  }, []);

  const loadCreatives = () => {
    if (campaign && campaign.id) {
      if (dataLoading) {
        return;
      }
      setDataLoading(true);
      const url = `${urlCreativesInfo}${
        campaign.id
      }?type=${monetizationType.toUpperCase()}`;
      axios.get(url).then((response) => {
        console.log(response);
        const { data } = response;

        const audio = {
          key: Date.now() + 1,
          createdAt: data.audioCreatedAt,
          name: data.audioName,
          resolution: data.audioResolution,
          size: (data.audioSize / 1024).toFixed(2),
          type: "Audio",
          resource: data.audioCreativeUrl,
        };

        const audioData = {
          name: data.audioName,
          size: data.audioSize,
          img: data.audioCreativeUrl,
          type: monetizationType,
          createdAt: data.audioCreatedAt,
        };

        change("adTitle", data.adTitle);
        change("impressionUrl", data.impressionUrl || null);
        change("audioDuration", data.audioDuration);
        change("startDelay", data.startDelay || null);
        change("endCard", data.endCard || false);
        change("creativeAudio", audioData);

        const creativeData = [audio];

        if (data.endCard) {
          const image = {
            key: Date.now(),
            createdAt: data.imageCreatedAt,
            name: data.imageName,
            resolution: data.imageResolution,
            size: (data.imageSize / 1024).toFixed(2),
            type: "Image",
            resource: data.imageCreativeUrl,
          };

          const imageData = {
            width: data.imageWidth,
            height: data.imageHeight,
            name: data.imageName,
            size: data.imageSize,
            img: data.imageCreativeUrl,
            type: "image",
            createdAt: data.imageCreatedAt,
          };

          change("creativeImage", imageData);
          creativeData.push(image);
        }

        setCreativeData(creativeData);

        setDataLoading(false);
      });
    }
  };

  let columns = useMemo(
    () => [
      {
        title: "Date",
        dataIndex: "createdAt",
        key: "createdAt",
      },
      {
        title: "File",
        dataIndex: "name",
        key: "name",
        render: (text, item) => {
          if (item.resource) {
            return (
              <a href={item.resource} target="_blank" rel="noreferrer">
                {text}
              </a>
            );
          } else {
            return <span>{text}</span>;
          }
        },
      },
      {
        title: "Data",
        dataIndex: "resource",
        key: "resource",
        render: (text, item) => {
          if (item.type === "Audio") {
            return (
              <audio controls>
                <source src={item.resource} type="audio/mp3" />
                Your browser does not support the audio tag.
              </audio>
            );
          }
        },
      },
      {
        title: "Type",
        dataIndex: "type",
        key: "type",
      },
      {
        title: "Size (kb)",
        dataIndex: "size",
        key: "size",
      },
      {
        title: "",
        dataIndex: "actions",
        key: "actions",
        width: 40,
        render: (text, item) => {
          return (
            <div className="icon_cover">
              {item.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="editor-control"
                >
                  <SvgDownLoadArr />
                </a>
              ) : null}
              <span className="editor-control" onClick={() => onDelete(item)}>
                <SvgDelete />
              </span>
            </div>
          );
        },
      },
    ],
    [creativeData]
  );

  const onDelete = (item) => {
    item.type === "audio"
      ? change("creativeAudio", null)
      : change("creativeImage", null);
    setCreativeData(
      creativeData.filter((listItem) => listItem.type != item.type)
    );
  };

  const cancelFileUpload = (message, type) => {
    // If the reason for cancellation is an error, inform the user
    if (message) {
      NotificationManager.error(message);
    }

    type === "audio"
      ? (audioUploadInput.current.value = "")
      : (imageUploadInput.current.value = "");
  };

  const changeFile = (type) => {
    let file;
    let extensions;
    let fileSize;
    switch (type) {
      case "audio": {
        fileSize = AUDIO_ADS_AUDIO_FILE_SIZE;
        extensions = AUDIO_ADS_EXTENSIONS.join("|");
        file = audioUploadInput.current.files[0];
        break;
      }
      default: {
        fileSize = AUDIO_ADS_AUDIO_FILE_SIZE;
        extensions = AUDIO_ADS_EXTENSIONS.join("|");
        file = imageUploadInput.current.files[0];
        break;
      }
    }
    const pattern = "(" + extensions.replace(/\./g, "\\.") + ")$";

    if (!new RegExp(pattern, "i").test(file.name)) {
      cancelFileUpload(`Wrong ${file.name} file format.`, type);
      return;
    }
    if (file.size > fileSize) {
      cancelFileUpload(`File ${file.name} is too large.`, type);
      return;
    }

    const _URL = window.URL || window.webkitURL;
    if (type === "audio") {
      const audio = document.createElement("audio");
      audio.addEventListener("loadedmetadata", (event) => {
        const data = {
          inputFileName: file.name.slice(0, 13),
          fileName: file.name,
        };
        setAudioData(data);
      });
      audio.src = _URL.createObjectURL(file);
    } else {
      const img = new Image();
      img.onload = () => {
        const data = {
          inputFileName: file.name.slice(0, 13),
          width: img.width,
          height: img.height,
          fileName: file.name,
        };

        setImageData(data);
      };
      img.src = _URL.createObjectURL(file);
    }
  };

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const handleUpload = async (e, type) => {
    e.preventDefault();
    let fileData;
    let file;
    switch (type) {
      case "audio": {
        fileData = audioData;
        file = audioUploadInput.current.files[0];
        break;
      }
      default: {
        fileData = imageData;
        file = imageUploadInput.current.files[0];
        break;
      }
    }
    const { width, height } = fileData;
    const createdAt = new Date().toISOString();
    const data = {
      width: width || 0,
      height: height || 0,
      name: file.name,
      size: file.size,
      createdAt,
    };

    const creative = {
      key: Date.now(),
      campaignId: campaign.id || null,
      createdAt: createdAt,
      name: file.name,
      size: (parseInt(file.size) / 1024).toFixed(2),
      type: type === "audio" ? "Audio" : "Image",
    };

    if (type === "audio") {
      const resource = await toBase64(file);
      data.resource = resource;
      creative.resource = resource;
      data.type = "audio";
      const findImage = creativeData.find((item) => item.type === "Image");
      const newCreativeData = [creative];
      if (findImage) {
        newCreativeData.push(findImage);
      }
      setCreativeData(newCreativeData);
      setAudioData(null);
      change("creativeAudio", data);
    } else {
      data.resource = await toBase64(file);
      data.type = "image";
      const findAudio = creativeData.find((item) => item.type === "Audio");
      const newCreativeData = [creative];
      if (findAudio) {
        newCreativeData.push(findAudio);
      }
      setCreativeData(newCreativeData);
      setImageData(null);
      change("creativeImage", data);
    }
    ["audio"].includes(type)
      ? (audioUploadInput.current.value = "")
      : (imageUploadInput.current.value = "");
  };

  const audioClasses = classNames({
    "form__text-field__name": true,
    errored:
      firstSubmit &&
      !creativeData.find((item) => ["Audio"].includes(item.type)),
  });

  return (
    <div className="card_body flex-column audio-ad-creatives">
      <div className="form-group">
        <div className="flex w100 selects">
          <div className="card_body-item mr2">
            <Field
              title={"Title*"}
              type="text"
              name="adTitle"
              component={renderRegularTextField}
              validate={[required]}
            />
          </div>
          <div className="card_body-item mr2">
            <Field
              title={`${localization.createCampaignForm.audioCreatives.labels.audioDuration}`}
              type="text"
              name="audioDuration"
              component={renderRegularTextField}
              validate={[required, isNumber, audioDurationValidator]}
            />
          </div>
        </div>
      </div>

      <div className="form-group">
        <div className="flex w100">
          <div className="card_body-item mr2">
            <span
              className={audioClasses}
            >{` Upload ${monetizationType}`}</span>
            <div className="tooltip info">
              <span className="tooltiptext">
                <p>File formats:</p>
                <p>{AUDIO_ADS_EXTENSIONS.join(", ")}</p>
                <br />
                <p>
                  Max file size - {AUDIO_ADS_AUDIO_FILE_SIZE / 1024 / 1024} Mb
                </p>
              </span>
            </div>
            <div className="upload_file">
              <input
                type="file"
                name="audio"
                id="audio"
                className="inputfile"
                ref={audioUploadInput}
                onChange={() => changeFile(monetizationType.toLowerCase())}
              />
              <label htmlFor="audio" className=" btn light-blue-upload">
                <img src={UploadIcon} />
                <span>
                  {audioData ? audioData.fileName : "Choose Audio file"}
                </span>
              </label>
              {firstSubmit &&
              !creativeData.find((item) => ["Audio"].includes(item.type)) ? (
                <div
                  style={{ fontSize: "10px" }}
                  className="form__text-field__error"
                >
                  <span>Required</span>
                </div>
              ) : null}
              {audioData ? (
                <span
                  onClick={(e) =>
                    handleUpload(e, monetizationType.toLowerCase())
                  }
                  className="btn add-blue"
                >
                  Add
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="list-table w100 mt2">
        <Table pagination={false} columns={columns} dataSource={creativeData} />
      </div>
    </div>
  );
};

export default AudioAdCreatives;
