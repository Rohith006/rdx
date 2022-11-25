import * as EmailValidator from 'email-validator';
import isUrl from 'is-url';
import {isMoment} from 'moment';
const xml2js = require('xml2js');

import localization from '../localization';
const parser = new xml2js.Parser({explicitArray: false});
/**
 * Check if `value` isn't empty
 *
 * @returns Returns `undefined` if `value` isn't empty, else `error message`.
 */
export const required = (value) => value && (typeof value === 'string' ? value.trim() : value) ? undefined : localization.validate.required;

/**
 * Check if `value` is alphanumeric
 *
 * @returns Returns `undefined` if `value` is `alphanumeric`, else `error message`.
 */
export const isAlphanumeric = (value) => /^\w+$/.test(value) ? undefined : localization.validate.alphanumericOnly;

/**
 * Check if `value` is Integer and greater than 0
 *
 * @param value
 * @returns Returns `undefined` if `value` is `Integer`, else `error message`.
 */
export const isInteger = (value) => !value || /^\d*[1-9]\d*$/.test(value) ? undefined : localization.validate.valueIsNotInteger;

/**
 * Check if `value` is number and greater than 0
 *
 * @param value
 * @returns Returns `undefined` if `value` is `number`, else `error message`.
 */
export const isNumber = (value) => !value || /^\d+(\.\d+)?$/.test(value) ? undefined : localization.validate.valueIsNotNumber;
/**
 * A simple regexp to validate most legal URLs
 *
 * @param value
 * @returns {undefined | string}
 */
export const isUrlFormat = (value) => {
  if (!value) return undefined;
  return isUrl(value) ? undefined : localization.validate.invalidUrl;
};

/**
 * Check if `value` corresponds to the email format
 *
 * @returns Returns `undefined` if `value` is email, else `error message`.
 */
export const isEmail = (value) => EmailValidator.validate(value) ? undefined : localization.validate.invalidEmail;

/**
 * Check if `value` corresponds to the zip code format
 *
 * @returns Returns `undefined` if `value` is zip code, else `error message`.
 */
export const isZipCode = (value) => /^(?=.{0,10}$)[a-z0-9]+(?:[\s-][a-z0-9]+)?$/i.test(value) ? undefined : localization.validate.zipCode;

/**
 * Check if `value` corresponds to the moment date format
 *
 * @returns {boolean} Returns `undefined` if `value` is moment date, else `error message`.
 */
export const isMomentDate = (value) => isMoment(value) ? undefined : localization.validate.invalidDate;

/**
 * Check if `value` is not greater than limit
 *
 * @returns Returns `undefined` if `value` is less or equal than limit, else `error message`.
 */
export const maxLength = (limit) => (value) => value && value.toString().length > limit ? localization.formatString(localization.validate.maxLength, limit) : undefined;

export const validateXml2js = (value) => {
  if (!value) {
    return 'Invalid xml value';
  }

  parser.parseStringPromise(value).then((result) => {
    console.dir(result);
    console.log('Done');
    return null;
  }).catch((err) => {
    console.error(err);
    return 'Invalid xml value';
  });
};

/**
 * Validation for Video Duration
 * @param value
 * @returns {string|undefined}
 */

export const videoDurationValidator = (value) => {
  if (!value) {
    return undefined;
  }
  if (value < 5) {
    return localization.createCampaignForm.videoCreatives.validate.greater;
  } else if (value > 60) {
    return localization.createCampaignForm.videoCreatives.validate.less;
  }
};
export const audioDurationValidator = (value) => {
  if (!value) {
    return undefined;
  }
  if (value < 5) {
    return localization.createCampaignForm.audioCreatives.validate.greater;
  } else if (value > 60) {
    return localization.createCampaignForm.audioCreatives.validate.less;
  }
};

export const arrayChecker = (errArr, finalArr) => {
	const result = errArr.some((item) => finalArr && finalArr.includes(item))
  return result
}
