import {NotificationManager} from 'react-notifications';

export default function validatorResolution(value, options) {
  const notify = (msg) => NotificationManager.error(msg);
  const x = 'x';
  const isNumber = (pos) => Number(value.split(x)[pos]);
  const list = options.map((el) => el.label);

  if (!value.includes(x)) {
    notify('Incorrect value format');
    return false;
  }
  if (!isNumber(0) || !isNumber(1)) {
    notify('Incorrect value format');
    return false;
  }
  if (list.includes(value)) {
    notify('Already exist!');
    return false;
  }
  return true;
}
