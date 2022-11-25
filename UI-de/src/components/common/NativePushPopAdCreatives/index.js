import React, { useEffect, useState, useRef, Fragment, useMemo } from 'react'
import { Field } from 'redux-form'
import cloud from '../../.././../assets/images/icons/cloud.svg'
import cloud2 from '../../.././../assets/images/icons/cloud2.svg'
import localization from '../../../localization'
import StarRatings from 'react-star-ratings'
import {
  NATIVE_ADS_CREATIVE_EXTENSIONS,
  NATIVE_ADS_CREATIVE_ICON_IMAGE_RESOLUTION,
  NATIVE_ADS_CREATIVE_MAIN_IMAGE_RESOLUTION,
  MAX_NATIVE_AD_CREATIVE_FILE_SIZE,
} from '../../../constants/app'
import { NotificationManager } from 'react-notifications'
import Table from 'antd/es/table'
import { SvgDelete, SvgDownLoadArr } from '../Icons'
import classNames from 'classnames'
import axios from 'axios'
import { required } from '../../../utils/validatorUtils'
import { PUSH } from '../../../constants/campaigns'

const urlCreativesInfo = '/database/load/creatives-info/'

export const maxLengthLimit15 = (value, limit) =>
  value && value.length > limit
    ? localization.formatString(localization.validate.maxLength, limit)
    : undefined
export const maxLengthLimit30 = (value, limit) =>
  value && value.length > limit
    ? localization.formatString(localization.validate.maxLength, limit)
    : undefined

const NativePushPopAdCreatives = ({
  campaign,
  renderRegularTextField,
  renderTextAreaField,
  renderSelect,
  change,
  firstSubmit,
  trackingUrl,
  monetizationType,
}) => {
  const [starRating, setStarRating] = useState(0)
  const [mainImageData, setMainImageData] = useState(null)
  const [iconImageData, setIconImageData] = useState(null)
  const [creativeImages, setCreativeImages] = useState([])

  const [dataLoading, setDataLoading] = useState(false)

  const iconUploadInput = useRef()
  const mainUploadInput = useRef()

  useEffect(() => {
    if (campaign.id) {
      loadCreatives()
    }
  }, [campaign])

  const loadCreatives = () => {
    if (campaign && campaign.id) {
      if (dataLoading) return

      setDataLoading(true)

      axios
        .get(
          `${urlCreativesInfo}${campaign.id}?type=${campaign.monetizationType}`,
        )
        .then((response) => {
          const { data } = response
          const iconImage = {
            key: Date.now(),
            createdAt: data.iconImageCreatedAt,
            name: data.iconImageName,
            resolution: data.iconImageResolution,
            size: (data.iconImageSize / 1024).toFixed(2),
            type: 'Icon',
            url: data.iconImageCreativeUrl,
          }

          const mainImage = {
            key: Date.now() + 1,
            createdAt: data.mainImageCreatedAt,
            name: data.mainImageName,
            resolution: data.mainImageResolution,
            size: (data.mainImageSize / 1024).toFixed(2),
            type: 'Main Image',
            url: data.mainImageCreativeUrl,
          }

          const mainData = {
            widthImg: data.mainImageWidth,
            heightImg: data.mainImageHeight,
            name: data.mainImageName,
            size: data.mainImageSize,
            img: data.mainImageCreativeUrl,
            type: 'main',
            createdAt: data.iconImageCreatedAt,
          }

          const iconData = {
            widthImg: data.iconImageWidth,
            heightImg: data.iconImageHeight,
            name: data.iconImageName,
            size: data.iconImageSize,
            img: data.iconImageCreativeUrl,
            type: 'icon',
            createdAt: data.iconImageCreatedAt,
          }

          if (data.rating) {
            const rating = parseFloat(data.rating)
            change('creativeRating', rating)
            setStarRating(rating)
          }

          change('creativeName', data.name)
          change('creativeCta', data.cta)
          change('creativeDescription', data.description)
          change('creativeSponsored', data.sponsored)
          change('creativeMainImage', mainData)
          change('creativeIconImage', iconData)

          setCreativeImages([iconImage, mainImage])

          setDataLoading(false)
        })
    }
  }

  const columns = useMemo(
    () => [
      {
        title: 'Date',
        dataIndex: 'createdAt',
        key: 'createdAt',
      },
      {
        title: 'File',
        dataIndex: 'name',
        key: 'name',
        render: (text, item) => {
          if (item.url) {
            return (
              <a href={item.url} target="_blank">
                {text}
              </a>
            )
          } else {
            return <span>{text}</span>
          }
        },
      },
      {
        title: 'Resolution',
        dataIndex: 'resolution',
        key: 'resolution',
      },
      {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
      },
      {
        title: 'Size (kb)',
        dataIndex: 'size',
        key: 'size',
      },
      {
        title: '',
        dataIndex: 'actions',
        key: 'actions',
        width: 40,
        render: (text, item) => {
          return (
            <div className="icon_cover">
              {item.url ? (
                <a href={item.url} target="_blank" className="editor-control">
                  <SvgDownLoadArr />
                </a>
              ) : null}
              <span className="editor-control" onClick={() => onDelete(item)}>
                <SvgDelete />
              </span>
            </div>
          )
        },
      },
    ],
    [creativeImages],
  )

  const onDelete = (item) => {
    item.type === 'Icon'
      ? change('creativeIconImage', null)
      : change('creativeMainImage', null)
    setCreativeImages(
      creativeImages.filter((image) => image.type !== item.type),
    )
  }

  const ratingOptions = [
    0.5,
    1,
    1.5,
    2,
    2.5,
    3,
    3.5,
    4,
    4.5,
    5,
  ].map((ratingOption) => ({ label: ratingOption, value: ratingOption }))

  const cancelFileUpload = (message, type) => {
    // If the reason for cancellation is an error, inform the user
    if (message) {
      NotificationManager.error(message)
    }

    type === 'icon'
      ? (iconUploadInput.current.value = '')
      : (mainUploadInput.current.value = '')
  }

  const changeFile = (type) => {
    const file =
      type === 'icon'
        ? iconUploadInput.current.files[0]
        : mainUploadInput.current.files[0]

    const pattern =
      '(' +
      NATIVE_ADS_CREATIVE_EXTENSIONS.join('|').replace(/\./g, '\\.') +
      ')$'

    if (!new RegExp(pattern, 'i').test(file.name)) {
      cancelFileUpload(
        `Wrong ${file.name} file format. Please upload images only.`,
        type,
      )
      return
    }

    if (file.size > MAX_NATIVE_AD_CREATIVE_FILE_SIZE) {
      cancelFileUpload(`File ${file.name} is too large.`, type)
      return
    }

    const _URL = window.URL || window.webkitURL

    const img = new Image()

    img.onload = () => {
      const resolution = `${img.width}x${img.height}`

      const RESOLUTIONS =
        type === 'icon'
          ? NATIVE_ADS_CREATIVE_ICON_IMAGE_RESOLUTION
          : NATIVE_ADS_CREATIVE_MAIN_IMAGE_RESOLUTION

      // if (!RESOLUTIONS.includes(resolution)) {
      //   cancelFileUpload(`Current banner resolution is not supported.`, type);
      //   return false;
      // }

      const data = {
        inputFileName: file.name.slice(0, 13),
        widthImg: img.width,
        heightImg: img.height,
        fileName: file.name,
      }

      type === 'icon' ? setIconImageData(data) : setMainImageData(data)
    }
    img.src = _URL.createObjectURL(file)
  }

  const handleUpload = async (e, type) => {
    const { widthImg, heightImg } =
      type === 'icon' ? iconImageData : mainImageData
    e.preventDefault()
    const file =
      type === 'icon'
        ? iconUploadInput.current.files[0]
        : mainUploadInput.current.files[0]
    const toBase64 = (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result)
        reader.onerror = (error) => reject(error)
      })
    const createdAt = new Date().toISOString()
    const data = {
      widthImg: widthImg || 0,
      heightImg: heightImg || 0,
      name: file.name,
      size: file.size,
      createdAt,
    }
    const creative = {
      key: Date.now(),
      campaignId: campaign.id || null,
      createdAt: createdAt,
      name: file.name,
      resolution: `${widthImg} x ${heightImg}`,
      size: (parseInt(file.size) / 1024).toFixed(2),
      type: type === 'icon' ? 'Icon' : 'Main Image',
    }
    if (type === 'icon') {
      data.img = await toBase64(file)
      data.type = 'icon'
      const findMainImage = creativeImages.find(
        (item) => item.type === 'Main Image',
      )
      const newCreativeImages = [creative]
      if (findMainImage) {
        newCreativeImages.push(findMainImage)
      }
      setCreativeImages(newCreativeImages)
      setIconImageData(null)
      change('creativeIconImage', data)
    } else {
      data.img = await toBase64(file)
      data.type = 'main'
      const findIconImage = creativeImages.find((item) => item.type === 'Icon')
      const newCreativeImages = [creative]
      if (findIconImage) {
        newCreativeImages.push(findIconImage)
      }
      setCreativeImages(newCreativeImages)
      setMainImageData(null)
      change('creativeMainImage', data)
    }
    type === 'icon'
      ? (iconUploadInput.current.value = '')
      : (mainUploadInput.current.value = '')
  }

  const mainImageClasses = classNames({
    'form__text-field__name': true,
    errored:
      firstSubmit &&
      !creativeImages.find((image) => image.type === 'Main Image'),
  })

  const iconImageClasses = classNames({
    'form__text-field__name': true,
    errored:
      firstSubmit && !creativeImages.find((image) => image.type === 'Icon'),
  })

  const starRatingClasses = classNames({
    'form__text-field__name': true,
  })

  const appendMacros = (macros) => {
    change('trackingUrl', (trackingUrl || '') + macros)
  }

  return (
    <div className="card_body flex-column native-ads-creatives">
      <div className="form-group">
        <div className="flex w100">
          <div className="card_body-item mr2">
            <Field
              type="text"
              name="creativeName"
              title={
                <Fragment>
                  {
                    localization.createCampaignForm.creativesNativeAds.labels
                      .creativeName
                  }
                  <div className="tooltip info">
                    <span className="tooltiptext">
                      {
                        localization.createCampaignForm.creativesNativeAds
                          .tooltips.creativeName
                      }
                    </span>
                  </div>
                </Fragment>
              }
              validate={required}
              component={renderRegularTextField}
            />
          </div>
          {monetizationType && monetizationType.toUpperCase() !== PUSH && (
            <Fragment>
              <div className="card_body-item">
                <div className="form-group">
                  <div className="form-group_col">
                    <Field
                      type="text"
                      name="creativeRating"
                      component={renderSelect}
                      title={
                        <Fragment>
                          {
                            localization.createCampaignForm.creativesNativeAds
                              .labels.creativeRating
                          }
                          <div className="tooltip info">
                            <span className="tooltiptext">
                              {
                                localization.createCampaignForm
                                  .creativesNativeAds.tooltips.creativeRating
                              }
                            </span>
                          </div>
                        </Fragment>
                      }
                      data={ratingOptions}
                      change={setStarRating}
                    />
                  </div>
                  <div className="form-group2_col star">
                    <StarRatings
                      rating={starRating}
                      starDimension="40px"
                      starSpacing="15px"
                      starRatedColor="#FFBD3C"
                    />
                  </div>
                </div>
              </div>
            </Fragment>
          )}
        </div>
        <div className="flex w100">
          {monetizationType && monetizationType.toUpperCase() !== PUSH && (
            <Fragment>
              <div className="card_body-item mr2">
                <Field
                  type="text"
                  title={
                    <Fragment>
                      {
                        localization.createCampaignForm.creativesNativeAds
                          .labels.creativeCta
                      }
                      <div className="tooltip info">
                        <span className="tooltiptext">
                          {
                            localization.createCampaignForm.creativesNativeAds
                              .tooltips.creativeCta
                          }
                        </span>
                      </div>
                    </Fragment>
                  }
                  name="creativeCta"
                  validate={[required, maxLengthLimit15]}
                  component={renderRegularTextField}
                />
                <br />
                <Field
                  type="text"
                  title={
                    <Fragment>
                      {
                        localization.createCampaignForm.creativesNativeAds
                          .labels.creativeSponsored
                      }
                      <div className="tooltip info">
                        <span className="tooltiptext">
                          {
                            localization.createCampaignForm.creativesNativeAds
                              .tooltips.creativeSponsored
                          }
                        </span>
                      </div>
                    </Fragment>
                  }
                  name="creativeSponsored"
                  validate={[required, maxLengthLimit30]}
                  component={renderRegularTextField}
                />
              </div>
            </Fragment>
          )}
          <div className="card_body-item">
            <Field
              type="text"
              title={
                <Fragment>
                  {
                    localization.createCampaignForm.creativesNativeAds.labels
                      .creativeDescription
                  }
                  <div className="tooltip info">
                    <span className="tooltiptext">
                      World wide when nothing selected
                    </span>
                  </div>
                </Fragment>
              }
              name="creativeDescription"
              validate={required}
              component={renderTextAreaField}
            />
          </div>
        </div>
      </div>
      <div className="form-group">
        <div className="flex w100">
          <div className="card_body-item mr2">
            <span className={iconImageClasses}>
              {
                localization.createCampaignForm.creativesNativeAds.labels
                  .creativeIconImage
              }
            </span>
            <div className="nativeAd_container">
              <div className="upload">
                <input
                  type="file"
                  name="iconFile"
                  id="iconFile"
                  className="inputfile"
                  ref={iconUploadInput}
                  onChange={() => changeFile('icon')}
                />
                <label htmlFor="iconFile" className=" btn cloud mr2">
                  <img className="mrIcon" src={cloud2} />
                  <span>
                    {iconImageData ? iconImageData.fileName : 'CHOOSE ICON'}
                  </span>
                </label>
                {firstSubmit &&
                !creativeImages.find((image) => image.type === 'Icon') ? (
                  <div
                    style={{ fontSize: '10px' }}
                    className="form__text-field__error"
                  >
                    <span>Required</span>
                  </div>
                ) : null}
                {iconImageData ? (
                  <span
                    onClick={(e) => handleUpload(e, 'icon')}
                    className="btn dark-blue2"
                  >
                    Add
                  </span>
                ) : null}
                {/* <div className="tooltip info">*/}
                {/*  <span className="tooltiptext">*/}
                {/*    <p>Banner resolutions: </p>*/}
                {/*    <p>{ NATIVE_ADS_CREATIVE_ICON_IMAGE_RESOLUTION.join(', ') }</p><br/>*/}
                {/*    <p>File formats:</p>*/}
                {/*    <p>{ NATIVE_ADS_CREATIVE_EXTENSIONS.join(', ') }</p><br/>*/}
                {/*    <p>Max file size - { MAX_NATIVE_AD_CREATIVE_FILE_SIZE / 1024 } Kb</p>*/}
                {/*  </span>*/}
                {/* </div>*/}

                <div className="">
                  <input
                    type="file"
                    name="mainFile"
                    id="mainFile"
                    className="inputfile"
                    ref={mainUploadInput}
                    onChange={() => changeFile('main')}
                  />
                  <label htmlFor="mainFile" className="btn cloud-blue">
                    <img className="mrIcon" src={cloud} />
                    <span>
                      {mainImageData ? mainImageData.fileName : 'CHOOSE BANNER'}
                    </span>
                  </label>
                  {firstSubmit &&
                  !creativeImages.find(
                    (image) => image.type === 'Main Image',
                  ) ? (
                    <div
                      style={{ fontSize: '10px' }}
                      className="form__text-field__error"
                    >
                      <span>Required</span>
                    </div>
                  ) : null}
                  {mainImageData ? (
                    <span
                      onClick={(e) => handleUpload(e, 'main')}
                      className="btn dark-blue1"
                    >
                      Add
                    </span>
                  ) : null}
                  {/* <div className="tooltip info">*/}
                  {/*  <span className="tooltiptext">*/}
                  {/*    <p>Banner resolutions: </p>*/}
                  {/*    <p>{ NATIVE_ADS_CREATIVE_MAIN_IMAGE_RESOLUTION.join(', ') }</p><br/>*/}
                  {/*    <p>File formats:</p>*/}
                  {/*    <p>{ NATIVE_ADS_CREATIVE_EXTENSIONS.join(', ') }</p><br/>*/}
                  {/*    <p>Max file size - { MAX_NATIVE_AD_CREATIVE_FILE_SIZE / 1024 } Kb</p>*/}
                  {/*  </span>*/}
                  {/* </div>*/}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="list-table mt2">
        <Table
          pagination={false}
          columns={columns}
          dataSource={creativeImages}
        />
      </div>
    </div>
  )
}

export default NativePushPopAdCreatives
