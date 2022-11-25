import React, { Component, Fragment } from "react";
import axios from "axios";
import uuid from "uuid/v4";
import { NotificationManager } from "react-notifications";
import classNames from "classnames";
import { Field } from "redux-form";

import {
  CREATIVE_EXTENSIONS,
  MAX_CREATIVE_FILE_SIZE,
  BANNER_RESOLUTIONS,
} from "../../../constants/app";
import { SvgDelete, SvgDownLoadArr } from "../Icons";
import GridList from "../../WhiteBlackList/Grid";
import localization from "../../../localization";
import { normalizeBoolean } from "../../../utils/normalizers";
import { required, isUrlFormat } from "../../../utils/validatorUtils";
import Dropdown from "../Views/Resolution/ResolutionList";
import { drop } from "lodash";
import { BiFontSize } from "react-icons/bi";

const urlCreativesInfo = "/database/load/creatives-info/";

const columnDefsWlist = [
  {
    headerName: "Date",
    field: "createdAt",
    headerClass: "ag-grid-header-cell",
    minWidth: 90,
    width: 100,
    maxWidth: 300,
  },
  {
    headerName: "Id",
    field: "id",
    width: 40,
  },
  {
    headerName: "File",
    field: "name",
    headerClass: "ag-grid-header-cell",
    maxWidth: 500,
    cellRenderer: "creativeNameRenderer",
  },
  {
    headerName: "Resolution",
    field: "resolution",
    headerClass: "ag-grid-header-cell",
  },
  {
    headerName: "Size",
    field: "size",
    headerClass: "ag-grid-header-cell",
  },
  {
    headerName: "",
    field: "userEditor",
    cellRenderer: "renderEditor",
    width: 40,
  },
];

class Creatives extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uploadedCreatives: [],
      inputFileName: "Choose file",
      widthImg: null,
      heightImg: null,
      frameworkComponents: {
        creativeNameRenderer: this.creativeNameRenderer.bind(this),
      },
      cursor: 0,
    };
    this.handleUpload = this.handleUpload.bind(this);
    this.remove = this.remove.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.changeFile = this.changeFile.bind(this);
  }

  componentDidMount() {
    this.loadCreatives();
  }

  loadCreatives() {
    const { campaign } = this.props;

    if (campaign && campaign.id) {
      axios.get(`${urlCreativesInfo}${campaign.id}`).then((response) => {
        const { creatives, tag } = response.data;

        for (const i in tag) {
          this.props.change(i, tag[i]);
        }

        creatives.forEach(
          (item) =>
            (item.resolution = `${item.width || 0} x ${item.height || 0}`)
        );
        this.setState({ uploadedCreatives: creatives });
      });
    }
  }

  async handleUpload(e) {
    e.preventDefault();
    const { campaign, addCreative } = this.props;
    const { widthImg, heightImg } = this.state;
    const file = this.uploadInput.files[0];
    this.uploadInput = null;

    const toBase64 = (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });
    const data = {
      campaignId: campaign.id || -1,
      widthImg: widthImg || 0,
      heightImg: heightImg || 0,
      name: file.name,
      size: file.size,
      creative: await toBase64(file),
    };
    addCreative(data);
    const creative = {
      createdAt: new Date().toISOString(),
      name: file.name,
      resolution: `${widthImg} x ${heightImg}`,
      size: (file.size / 1000).toFixed(2),
      id: uuid(),
    };
    this.setState((prevState) => ({
      uploadedCreatives: [...prevState.uploadedCreatives, creative],
      inputFileName: "Choose a file",
      widthImg: null,
      heightImg: null,
    }));
  }

  onSubmit() {
    const { handleSubmit, reset, invalid } = this.props;
    if (!invalid) {
      reset();
    }
  }

  creativeNameRenderer(params) {
    return (
      <a href={params.node.data.creativeUrl} target="_blank">
        <span className="item">{params.node.data.name}</span>
      </a>
    );
  }

  changeFile() {
    const file = this.uploadInput.files[0];
    const pattern =
      "(" + CREATIVE_EXTENSIONS.join("|").replace(/\./g, "\\.") + ")$";
    const cancelFileUpload = (message) => {
      // If the reason for cancellation is an error, inform the user
      if (message) {
        NotificationManager.error(message);
      }

      this.uploadInput = null;
      this.setState((prevState) => ({
        uploadedCreatives: [...prevState.uploadedCreatives],
        inputFileName: "Choose a file",
        widthImg: null,
        heightImg: null,
      }));
    };

    if (!new RegExp(pattern, "i").test(file.name)) {
      cancelFileUpload(
        `Wrong ${file.name} file format. Please upload images only.`
      );
      return;
    }

    if (file.size > MAX_CREATIVE_FILE_SIZE) {
      cancelFileUpload(`File ${file.name} is too large.`);
      return;
    }

    const _URL = window.URL || window.webkitURL;
    const img = new Image();
    img.onload = () => {
      const resolution = `${img.width}x${img.height}`;
      if (!BANNER_RESOLUTIONS.includes(resolution)) {
        cancelFileUpload(`Current banner resolution is not supported`);
        return false;
      }

      this.setState({
        inputFileName: file.name.slice(0, 13),
        widthImg: img.width,
        heightImg: img.height,
      });
    };
    img.src = _URL.createObjectURL(file);
  }

  async remove(obj) {
    if (obj.id) {
      this.setState((prevState) => ({
        uploadedCreatives: prevState.uploadedCreatives.filter(
          (item) => item.id !== obj.id
        ),
      }));

      const data = {
        id: obj.id,
        campaignId: this.props.campaign.id,
      };
      await axios.delete("/database/delete/creatives", { data });
      this.loadCreatives();
    }
  }

  appendMacros(macros) {
    const str = this.props.tagUrl || "";
    const beforeString = str.substr(0, this.state.cursor);
    const afterString = str.substr(this.state.cursor);
    const resultString = beforeString + macros + afterString;

    this.props.change("tagUrl", resultString);
  }

  macrosValidation(value) {
    if (!value) {
      return "Tag is required";
    }
    // if (value && !/\{BANNER_URL\}/gm.test(value)) {
    //   return localization.createCampaignForm.creatives.validate.bannerUrlMacros;
    // } else if (value && !/\{IMPRESSION_URL\}/gm.test(value)) {
    //   return localization.createCampaignForm.creatives.validate.impressionUrlMacros;
    // }
  }

  setCursorPosition(target) {
    this.setState({
      cursor: target.selectionStart,
    });
  }

  renderExtraFields() {
    return (
      <div className="flex w100" style={{ marginTop: "15px" }}>
        <div className="card_body-item mr2">
          <Field
            name="tagUrl"
            title={localization.createCampaignForm.creatives.labels.tagLabel}
            getCursor={this.setCursorPosition.bind(this)}
            validate={[required, this.macrosValidation]}
            component={this.props.renderTextAreaField}
          />
          <div className="macros-group">
            {/* <div>*/}
            {/* <span>{localization.createCampaignForm.creatives.labels.requiredMacros}:</span>*/}
            {/* <button onClick={() => this.appendMacros('{BANNER_URL}')} type="button" className="link">{localization.createCampaignForm.creatives.labels.bannerUrl}</button>*/}
            {/* </div>*/}
            <div>
              <span>
                {
                  localization.createCampaignForm.creatives.labels
                    .optionalMacros
                }
                :
              </span>
              <button
                onClick={() => this.appendMacros("{CLICK_URL}")}
                type="button"
                className="link"
              >
                {localization.createCampaignForm.creatives.labels.clickUrl}
              </button>
              <button
                onClick={() => this.appendMacros("{IMPRESSION_URL}")}
                type="button"
                className="link"
              >
                {localization.createCampaignForm.creatives.labels.impressionUrl}
              </button>
            </div>
          </div>
          {/* resolutions */}
          {<Dropdown {...this.props} />}
        </div>
      </div>
    );
  }

  renderRadioField({ input, id, val, title, checked, disabled }) {
    return (
      <div
        className={`radio-control pill-control ${disabled ? "disabled" : ""}`}
      >
        <input
          {...input}
          type="radio"
          onChange={input.onChange}
          disabled={disabled}
          id={id}
          value={val}
          checked={checked}
        />
        <label htmlFor={id}>
          <span className="radio-control__indicator" />
          {title}
        </label>
      </div>
    );
  }

  render() {
    const { uploadedCreatives } = this.state;
    const { campaign, modelPayment } = this.props;
    const iconImageClasses = classNames({
      "form__text-field__name": true,
    });
    const iconImage = classNames({
      form__icon: true,
    });

    return (
      <div className="card_body flex-column">
        <div className="form-group">
          <div className="flex w100">
            <div className="card_body-item">
              {modelPayment === "CPM" ? (
                <Fragment>
                  <div className="form__text-field__name">
                    {localization.createCampaignForm.creatives.labels.tag}
                  </div>
                  <div className="form-group_row">
                    <Field
                      name="tagEnable"
                      component={this.renderRadioField}
                      title={
                        localization.createCampaignForm.targeting.fields.disable
                      }
                      val={false}
                      checked={!this.props.tagEnable}
                      normalize={normalizeBoolean}
                    />
                    <Field
                      name="tagEnable"
                      component={this.renderRadioField}
                      title={
                        localization.createCampaignForm.targeting.fields.enable
                      }
                      val={true}
                      checked={this.props.tagEnable}
                      normalize={normalizeBoolean}
                    />
                  </div>
                </Fragment>
              ) : null}
            </div>
          </div>
          {this.props.tagEnable ? this.renderExtraFields() : null}
        </div>
        {!this.props.tagEnable && (
          <Fragment>
            <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 5 }}>
              <label>Upload creative</label>
              <div className="tooltip info">
                <span className="tooltiptext">
                  <p>Banner resolutions: </p>
                  <p>
                    250 x 250, 200 x 200, 468 x 60, 728 x 90, 300 x 250, 336 x
                    280, 120 x 600, 160 x 600, 300 x 600, 970 x 90
                  </p>
                  <p>300x550 320x50 300x250 320x480 480x320 728x90</p>
                  <br />
                  <p>File formats:</p>
                  <p>.jpg, .jpeg, .png, .tiff, .gif, .bmp</p>
                  <br />
                  <p>Max file size - 500 Kb</p>
                </span>
              </div>
            </div>
            <div className="card_body-item-creative">
              {/* <span className={iconImage}>
                {localization.createCampaignForm.creatives.labels.image}
              </span> */}

              <div className="upload">
                <input
                  type="file"
                  name="file[]"
                  id="file"
                  className="inputfile"
                  ref={(ref) => (this.uploadInput = ref)}
                  onChange={this.changeFile}
                />
                <label
                  htmlFor="file"
                  className=" btn dark-blue"
                  style={{ backgroundColor: "#3E66FB" }}
                >
                  <svg
                    width="24"
                    height="16"
                    viewBox="0 0 24 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M19.35 6.04C18.67 2.59 15.64 0 12 0C9.11 0 6.6 1.64 5.35 4.04C2.34 4.36 0 6.91 0 10C0 13.31 2.69 16 6 16H19C21.76 16 24 13.76 24 11C24 8.36 21.95 6.22 19.35 6.04ZM19 14H6C3.79 14 2 12.21 2 10C2 7.95 3.53 6.24 5.56 6.03L6.63 5.92L7.13 4.97C8.08 3.14 9.94 2 12 2C14.62 2 16.88 3.86 17.39 6.43L17.69 7.93L19.22 8.04C20.78 8.14 22 9.45 22 11C22 12.65 20.65 14 19 14ZM8 9H10.55V12H13.45V9H16L12 5L8 9Z"
                      fill="white"
                    />
                  </svg>

                  <span>{this.state.inputFileName}</span>
                </label>
                {this.uploadInput && this.uploadInput.files.length ? (
                  <span onClick={this.handleUpload} className="btn add-blue">
                    Add
                  </span>
                ) : null}
              </div>
            </div>
            <GridList
              users={uploadedCreatives || []}
              columnDefs={columnDefsWlist}
              remove={this.remove} {...this.props}
              renderComponents={this.state.frameworkComponents}
              renderEditor={campaign && campaign.id ? RenderEditor : null}
            />
          </Fragment>
        )}
      </div>
    );
  }
}

class RenderEditor extends Component {
  constructor(props) {
    super(props);
    this.onDelete = this.onDelete.bind(this);
  }

  async onDelete() {
    const { data } = this.props;
    const obj = {
      id: data.id,
    };
    await this.props.remove(obj);
  }

  render() {
    const { data } = this.props;
    return (
      <div className="icon_cover">
        <a href={data.creativeUrl} target="_blank" className="editor-control">
          <SvgDownLoadArr />
        </a>
        <span className="editor-control" onClick={this.onDelete}>
          <SvgDelete />
        </span>
      </div>
    );
  }
}

export default Creatives;
