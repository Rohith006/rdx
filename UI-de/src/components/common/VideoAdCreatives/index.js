import React, { useEffect, useState, useRef, useMemo, Fragment } from "react";
import { Field } from "redux-form";
import axios from "axios";
import UploadIcon from "../../../../assets/images/icons/cloud.svg";

import localization from "../../../localization";
import {
  VIDEO_ADS_VIDEO_RESOLUTIONS,
  VIDEO_ADS_VIDEO_EXTENSIONS,
  VIDEO_ADS_VIDEO_FILE_SIZE,
  VIDEO_ADS_END_CARD_RESOLUTIONS,
  VIDEO_ADS_END_CARD_EXTENSIONS,
  VIDEO_ADS_END_CARD_FILE_SIZE,
} from "../../../constants/app";
import { NotificationManager } from "react-notifications";
import Table from "antd/es/table";
import { SvgDelete, SvgDownLoadArr } from "../Icons";
import classNames from "classnames";

import {
  required,
  isNumber,
  videoDurationValidator,
} from "../../../utils/validatorUtils";

const urlCreativesInfo = "/database/load/creatives-info/";

const VideoAdCreatives = (props) => {
  const {
    campaign,
    change,
    renderRegularTextField,
    firstSubmit,
    monetizationType,
  } = props;
  const [imageData, setImageData] = useState(null);
  const [videoData, setVideoData] = useState(null);
  const [creativeData, setCreativeData] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const imageUploadInput = useRef();
  const videoUploadInput = useRef();

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
        const { data } = response;

        const video = {
          key: Date.now() + 1,
          createdAt: data.videoCreatedAt,
          name: data.videoName,
          resolution: data.videoResolution,
          size: (data.videoSize / 1024).toFixed(2),
          type: "Video",
          resource: data.videoCreativeUrl,
        };

        const videoData = {
          width: data.videoWidth,
          height: data.videoHeight,
          name: data.videoName,
          size: data.videoSize,
          img: data.videoCreativeUrl,
          type: monetizationType,
          createdAt: data.videoCreatedAt,
        };

        change("adTitle", data.adTitle);
        change("impressionUrl", data.impressionUrl || null);
        change("videoDuration", data.videoDuration);
        change("startDelay", data.startDelay || null);
        change("endCard", data.endCard || false);
        change("creativeVideo", videoData);

        const creativeData = [video];

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
        title: "Resolution",
        dataIndex: "resolution",
        key: "resolution",
      },
      {
        title: "Data",
        dataIndex: "resource",
        key: "resource",
        render: (text, item) => {
          if (item.type === "Video") {
            return (
              <video width="180" height="140" controls>
                <source src={item.resource} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
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
    item.type === "video"
      ? change("creativeVideo", null)
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

    type === "video"
      ? (videoUploadInput.current.value = "")
      : (imageUploadInput.current.value = "");
  };

  const changeFile = (type) => {
    let file;
    let extensions;
    let fileSize;
    switch (type) {
      case "video": {
        fileSize = VIDEO_ADS_VIDEO_FILE_SIZE;
        extensions = VIDEO_ADS_VIDEO_EXTENSIONS.join("|");
        file = videoUploadInput.current.files[0];
        break;
      }
      default: {
        fileSize = VIDEO_ADS_END_CARD_FILE_SIZE;
        extensions = VIDEO_ADS_END_CARD_EXTENSIONS.join("|");
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
    if (type === "video") {
      const video = document.createElement("video");
      video.addEventListener("loadedmetadata", (event) => {
        const resolution = `${video.videoWidth}x${video.videoHeight}`;
        if (!VIDEO_ADS_VIDEO_RESOLUTIONS.includes(resolution)) {
          cancelFileUpload(`Current video resolution is not supported.`, type);
          return false;
        }
        const data = {
          inputFileName: file.name.slice(0, 13),
          width: video.videoWidth || 0,
          height: video.videoHeight || 0,
          fileName: file.name,
        };
        setVideoData(data);
      });
      video.src = _URL.createObjectURL(file);
    } else {
      const img = new Image();
      img.onload = () => {
        const resolution = `${img.width}x${img.height}`;
        if (!VIDEO_ADS_END_CARD_RESOLUTIONS.includes(resolution)) {
          cancelFileUpload(`Current image resolution is not supported.`, type);
          return false;
        }
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
      case "video": {
        fileData = videoData;
        file = videoUploadInput.current.files[0];
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
      resolution: `${width} x ${height}`,
      size: (parseInt(file.size) / 1024).toFixed(2),
      type: type === "video" ? "Video" : "Image",
    };

    if (type === "video") {
      const resource = await toBase64(file);
      data.resource = resource;
      creative.resource = resource;
      data.type = "video";
      const findImage = creativeData.find((item) => item.type === "Image");
      const newCreativeData = [creative];
      if (findImage) {
        newCreativeData.push(findImage);
      }
      setCreativeData(newCreativeData);
      setVideoData(null);
      change("creativeVideo", data);
    } else {
      data.resource = await toBase64(file);
      data.type = "image";
      const findVideo = creativeData.find((item) => item.type === "Video");
      const newCreativeData = [creative];
      if (findVideo) {
        newCreativeData.push(findVideo);
      }
      setCreativeData(newCreativeData);
      setImageData(null);
      change("creativeImage", data);
    }
    ["video"].includes(type)
      ? (videoUploadInput.current.value = "")
      : (imageUploadInput.current.value = "");
  };

  const videoClasses = classNames({
    "form__text-field__name": true,
    errored:
      firstSubmit &&
      !creativeData.find((item) => ["Video"].includes(item.type)),
  });

  return (
    <div className="card_body flex-column video-ad-creatives">
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
              title={`${localization.createCampaignForm.videoCreatives.labels.videoDuration}`}
              type="text"
              name="videoDuration"
              component={renderRegularTextField}
              validate={[required, isNumber, videoDurationValidator]}
            />
          </div>
        </div>
      </div>

      <div className="form-group">
        <div className="flex w100">
          <div className="card_body-item mr2">
            <span
              className={videoClasses}
            >{` Upload ${monetizationType}`}</span>
            <div className="tooltip info">
              <span className="tooltiptext">
                <p>Video resolutions: </p>
                <p>{VIDEO_ADS_VIDEO_RESOLUTIONS.join(", ")}</p>
                <br />
                <p>File formats:</p>
                <p>{VIDEO_ADS_VIDEO_EXTENSIONS.join(", ")}</p>
                <br />
                <p>
                  Max file size - {VIDEO_ADS_VIDEO_FILE_SIZE / 1024 / 1024} Mb
                </p>
              </span>
            </div>
            <div className="upload_file">
              <input
                type="file"
                name="video"
                id="video"
                className="inputfile"
                ref={videoUploadInput}
                onChange={() => changeFile(monetizationType.toLowerCase())}
              />
              <label htmlFor="video" className=" btn light-blue-upload">
                <img src={UploadIcon} />
                <span>
                  {videoData ? videoData.fileName : "Choose Video file"}
                </span>
              </label>
              {firstSubmit &&
              !creativeData.find((item) => ["Video"].includes(item.type)) ? (
                <div
                  style={{ fontSize: "10px" }}
                  className="form__text-field__error"
                >
                  <span>Required</span>
                </div>
              ) : null}
              {videoData ? (
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

export default VideoAdCreatives;
