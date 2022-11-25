import localization from '../localization';
import {strongPassRegex} from './regExp';
import {config} from '../config';
import Hashids from 'hashids';
import {NotificationManager} from 'react-notifications';
import numeral from 'numeral';

export const setCaretInput = (event, callback) => {
  setTimeout(() => callback(event.target.name, event.target.selectionStart), 0);
};

export const toBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = (error) => reject(error);
});

export const trimmer = (value) => value && value.trim();
export const toNumber = (value) => value && Number(value) ? Number(value) : value;
export const onNumberFieldChange = (e, onChange) => {
  const value = e.target.value;
  /^\d*\.?\d{0,4}$/.test(value) || !value ? onChange(e) : e.preventDefault();
};

export const validateUserForm = (values) => {
  const errors = {};
  if (!values.name) {
    errors.name = localization.validate.required;
  } else if (values.name.length < 2) {
    errors.name = 'Must be 2 characters or more';
  }
  if (!values.email) {
    errors.email = localization.validate.required;
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,16}$/i.test(values.email)) {
    errors.email = 'Invalid email address';
  }
  if (!values.role) {
    errors.role = localization.validate.required;
  }
  if (values.password) {
    if (!strongPassRegex.test(values.password)) {
      errors.password = localization.validate.passwordLong;
    }
  }
  if (values.password !== values.confirmPassword) {
    errors.confirmPassword = localization.validate.passwordMatch;
  }
  return errors;
};

export const hasSubArray = (masterArray, subArray) => {
  if (typeof subArray !== 'object' || !subArray.length) {
    return false;
  }
  let isExists = false;
  for (const value of subArray) {
    isExists = (masterArray.indexOf(value) >= 0);
    if (isExists) {
      break;
    }
  }
  return isExists;
};

const {salt, ln, alphabet} = config.hashIds;
export const hashids = new Hashids(salt, ln, alphabet);

export const showSuccessNotification = (text) => NotificationManager.success(text);

export const numFormatComa = (num) => numeral(num).format('0,0');
