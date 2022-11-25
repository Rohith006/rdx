import React, { useEffect, useState, useRef, Fragment } from 'react'
import { Field } from 'redux-form'
import localization from '../../../localization'
import Select from 'react-select'
import makeAnimated from 'react-select/animated'
import url from 'url-parse'
import isUrl from 'is-url'
import axios from 'axios'
import Spinner from 'react-loader-spinner'
import classNames from 'classnames'
import StarRatings from 'react-star-ratings'
import {
  MAX_CREATIVE_FILE_SIZE,
  NATIVE_ADS_CREATIVE,
  NATIVE_ADS_CREATIVE_RESOLUTION,
} from '../../../constants/app'
import { NotificationManager } from 'react-notifications'

const creativeDeliveryTypes = [
  { value: 'app_install', label: 'App Install' },
  { value: 'common_link', label: 'Common Link' },
]

const NativeAdsCreatives = ({
  renderRegularTextField,
  renderTextAreaField,
  change,
}) => {
  const [creativeDeliveryType, setCreativeDeliveryType] = useState(
    creativeDeliveryTypes[0],
  )
  const [appLinkError, setAppLinkError] = useState(null)
  const [appData, setAppData] = useState({})
  const [isAppLinkRequestPending, setAppLinkRequestPending] = useState(false)

  const [fileName, setFileName] = useState('Choose a file')
  const [imgData, setImageData] = useState(null)

  const uploadInput = useRef()
  const imgRef = useRef()

  useEffect(() => {
    setAppData({})
  }, [creativeDeliveryType])

  let appLinkRequestTimeout

  const animatedComponents = makeAnimated()

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

  const onAppLinkChange = (e) => {
    const trimmedValue = e.target.value.trim()
    setAppLinkRequestPending(true)

    const appStoreIdParam = trimmedValue.match(/id\d{1,}/gm)
    const geo = e.target.value.match(/\w\w(?=\/app)/g)

    const appStoreId = appStoreIdParam && appStoreIdParam[0].match(/\d+/gm)[0]

    let playMarketId
    if (!appStoreId) {
      const parsedAppLink = url(trimmedValue, true)
      playMarketId = parsedAppLink.query && parsedAppLink.query.id
    }

    clearTimeout(appLinkRequestTimeout)

    appLinkRequestTimeout = setTimeout(async () => {
      try {
        if ((!playMarketId && !appStoreId) || !isUrl(trimmedValue))
          throw 'App not found'

        if (appStoreId) {
          const response = await axios.get(
            `${__INTERNAL_API_URL__}/utils/ios-app-info/${geo[0]}/${appStoreId}`,
          )

          if (!response.data.results[0]) throw 'App not found'

          const {
            artworkUrl100,
            trackName,
            description,
            averageUserRatingForCurrentVersion,
          } = response.data.results[0]

          const data = {
            appImage: artworkUrl100,
            appTrackName: trackName,
            appDescription: description,
            appRating: averageUserRatingForCurrentVersion,
          }

          setAppData(data)
          setChanges(data)
        } else if (playMarketId) {
          const response = await axios.get(
            `${__INTERNAL_API_URL__}/utils/android-app-info/${playMarketId}`,
          )

          if (!response.data.appId) throw 'App not found'

          const { icon, title, description, score } = response.data
          const data = {
            appImage: icon,
            appTrackName: title,
            appDescription: description,
            appRating: score,
          }

          setAppData(data)
          setChanges(data)
        }

        setAppLinkError(null)
        setAppLinkRequestPending(false)
      } catch (e) {
        setAppLinkError('App not found')
        setAppLinkRequestPending(false)
        setAppData({})
      }
    }, 1000)
  }

  const setChanges = ({ appImage, appTrackName, appDescription }) => {
    change('appTrackName', appTrackName)
    change('appDescription', appDescription)
  }

  const cancelFileUpload = (message) => {
    // If the reason for cancellation is an error, inform the user
    if (message) {
      NotificationManager.error(message)
    }
  }

  const changeFile = () => {
    const file = uploadInput.current.files[0]

    const pattern =
      '(' + NATIVE_ADS_CREATIVE.join('|').replace(/\./g, '\\.') + ')$'

    if (!new RegExp(pattern, 'i').test(file.name)) {
      cancelFileUpload(
        `Wrong ${file.name} file format. Please upload images only.`,
      )
      return
    }

    if (file.size > MAX_CREATIVE_FILE_SIZE) {
      cancelFileUpload(`File ${file.name} is too large.`)
      return
    }

    const _URL = window.URL || window.webkitURL

    const img = new Image()
    imgRef.current = img

    img.onload = () => {
      const resolution = `${img.width}x${img.height}`
      let extension = file.name.split('.')
      extension = extension[extension.length - 1]
      if (
        !NATIVE_ADS_CREATIVE_RESOLUTION.includes(resolution) ||
        extension !== 'jpg'
      ) {
        cancelFileUpload(
          `Current banner resolution is not supported. 520 x 260, 640 x 250, jpg only`,
        )
        return false
      }

      setImageData({
        inputFileName: file.name.slice(0, 13),
        widthImg: img.width,
        heightImg: img.height,
      })
    }
    img.src = _URL.createObjectURL(file)
  }

  const handleUpload = () => {}

  const renderAppInstall = () => {
    return (
      <Fragment>
        <div className="form-group">
          <div className="form__text-field__name">
            {localization.createCampaignForm.creativesNativeAds.labels.appUrl}
            <div className="tooltip info">
              <span className="tooltiptext">
                World wide when nothing selected
              </span>
            </div>
          </div>
          <div className="form-group_row">
            <div
              className={classNames('form__text-field ', {
                errored: appLinkError,
              })}
            >
              <div className="form__text-field__wrapper">
                <input
                  id="appLink"
                  autoComplete="off"
                  type="text"
                  name="appLink"
                  onChange={onAppLinkChange}
                />
                <div className="form__text-field__error ml2">
                  {appLinkError}
                </div>
              </div>
            </div>
          </div>
          {isAppLinkRequestPending ? (
            <div className="btn light-blue ml2">
              <Spinner type="Oval" color="#0076ff" height={14} width={14} />
            </div>
          ) : null}
        </div>

        {appData.appTrackName ? (
          <div className="form-group">
            <div className="form__text-field__name">
              {
                localization.createCampaignForm.creativesNativeAds.labels
                  .appTrackName
              }
              <div className="tooltip info">
                <span className="tooltiptext">
                  World wide when nothing selected
                </span>
              </div>
            </div>
            <Field
              type="text"
              name="appTrackName"
              required
              component={renderRegularTextField}
            />
          </div>
        ) : null}

        {Object.keys(appData).length ? (
          <div className="form-group">
            <div className="form__text-field__name">
              {
                localization.createCampaignForm.creativesNativeAds.labels
                  .appBrandName
              }
              <div className="tooltip info">
                <span className="tooltiptext">
                  World wide when nothing selected
                </span>
              </div>
            </div>
            <Field
              type="text"
              name="appBrandName"
              required
              component={renderRegularTextField}
            />
          </div>
        ) : null}

        {appData.appRating ? (
          <div className="form-group">
            <div className="form__text-field__name">
              {
                localization.createCampaignForm.creativesNativeAds.labels
                  .appRating
              }
              <div className="tooltip info">
                <span className="tooltiptext">
                  World wide when nothing selected
                </span>
              </div>
            </div>
            <div className="form__text-field">
              <div className="form__text-field__wrapper">
                <StarRatings
                  rating={appData.appRating}
                  starDimension="40px"
                  starSpacing="15px"
                />
              </div>
            </div>
          </div>
        ) : null}

        {appData.appDescription ? (
          <div className="form-group">
            <div className="form__text-field__name">
              {
                localization.createCampaignForm.creativesNativeAds.labels
                  .appDescription
              }
              <div className="tooltip info">
                <span className="tooltiptext">
                  World wide when nothing selected
                </span>
              </div>
            </div>
            <Field
              type="text"
              name="appDescription"
              required
              component={renderTextAreaField}
            />
          </div>
        ) : null}

        <div className="upload">
          <input
            type="file"
            name="file[]"
            id="file"
            className="inputfile"
            ref={uploadInput}
            onChange={changeFile}
          />
          <label htmlFor="file" className=" btn dark-blue mr2">
            <span>{fileName}</span>
          </label>
          {uploadInput &&
          uploadInput.current &&
          uploadInput.current.files.length ? (
            <span onClick={handleUpload} className="btn dark-blue">
              Add
            </span>
          ) : null}
          <div className="tooltip info">
            <span className="tooltiptext">
              <p>Banner resolutions: </p>
              <p>520 x 260, 640 x 250, jpg only</p>
              <br />
              <p>File formats:</p>
              <p>.jpg, .png, .gif</p>
              <br />
              <p>Max file size - 500 Kb</p>
            </span>
          </div>
        </div>
      </Fragment>
    )
  }

  const renderCommonLink = () => {
    return (
      <Fragment>
        <div className="form-group">
          <div className="form__text-field__name">
            {
              localization.createCampaignForm.creativesNativeAds.labels
                .appTrackName
            }
            <div className="tooltip info">
              <span className="tooltiptext">
                World wide when nothing selected
              </span>
            </div>
          </div>
          <Field
            type="text"
            name="appTrackName"
            required
            component={renderRegularTextField}
          />
        </div>
        <div className="form-group">
          <div className="form__text-field__name">
            {
              localization.createCampaignForm.creativesNativeAds.labels
                .appBrandName
            }
            <div className="tooltip info">
              <span className="tooltiptext">
                World wide when nothing selected
              </span>
            </div>
          </div>
          <Field
            type="text"
            name="appBrandName"
            required
            component={renderRegularTextField}
          />
        </div>
        <div className="form-group">
          <div className="form-group_col">
            <div className="form__text-field__name">
              {
                localization.createCampaignForm.creativesNativeAds.labels
                  .appRating
              }
              <div className="tooltip info">
                <span className="tooltiptext">
                  World wide when nothing selected
                </span>
              </div>
            </div>
            <StarRatings
              rating={appData.appRating}
              starDimension="40px"
              starSpacing="15px"
            />
          </div>
          <div className="form-group_col common-link-rating">
            <Select
              options={ratingOptions}
              value={ratingOptions.find(
                (ratingOption) => ratingOption.value === appData.appRating,
              )}
              onChange={(option) =>
                setAppData({ appRating: parseFloat(option.value) })
              }
              components={animatedComponents}
            />
          </div>
        </div>
      </Fragment>
    )
  }

  return (
    <div className="card_body flex-column native-ads-creatives">
      <div className="card_body-item">
        <div className="form-group">
          <Field
            type="text"
            name="creativeName"
            title={
              localization.createCampaignForm.creativesNativeAds.labels
                .creativeName
            }
            required
            component={renderRegularTextField}
          />
        </div>
        <div className="form-group">
          <div className="form__text-field__name">
            {
              localization.createCampaignForm.creativesNativeAds.labels
                .deliveryType
            }
            <div className="tooltip info">
              <span className="tooltiptext">
                World wide when nothing selected
              </span>
            </div>
          </div>
          <div className="w100">
            <Select
              options={creativeDeliveryTypes}
              value={creativeDeliveryType}
              onChange={(field) => {
                setCreativeDeliveryType(field)
                change('creativeDeliveryType', field.value)
              }}
              components={animatedComponents}
            />
          </div>
        </div>
        {creativeDeliveryType.value === 'app_install'
          ? renderAppInstall()
          : renderCommonLink()}
      </div>
    </div>
  )
}

export default NativeAdsCreatives
