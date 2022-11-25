import moment from 'moment';
import {isString} from 'lodash';

const DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';

const checkDate = (obj) => {
  if (obj.startDate === null) {
    obj.startDate = moment();
  }
  if (obj.endDate === null) {
    obj.endDate = moment().add(1, 'month');
  }
};

/**
 * Return the current time in 'YYYY-MM-DD HH:mm:ss' format
 *
 * @returns {string}
 */
const now = (format = DATE_FORMAT, byUTC = true) => byUTC ? moment().utc().format(format) : moment().format(format);

/**
 * Return the start of date
 *
 * @param unit - unit of time: year/day/...etc {string}
 * @param amount - value to adding the time (if positive) or decreasing (if negative) {Integer}
 * @param format - expected Date format {string}
 * @returns {string}
 */
const startOf = (unit, amount, format = DATE_FORMAT) => {
  const date = moment().utc();
  if (amount && Number.isInteger(amount)) {
    // Get day in the past or future
    const currentDay = amount > 0 ? date.add(Math.abs(amount), unit) : date.subtract(Math.abs(amount), unit);
    return currentDay.startOf(unit).format(format);
  } else if (amount && isString(amount)) {
    return moment(amount).startOf(unit).format(format);
  }
  // Start of current day
  return date.startOf(unit).format(format);
};

/**
 * Return the end of date
 *
 * @param unit - unit of time: year/day/...etc {string}
 * @param amount - value to adding the time (if positive) or decreasing (if negative) {Integer}
 * @param format - expected Date format {string}
 * @returns {string}
 */
const endOf = (unit, amount, format = DATE_FORMAT) => {
  const date = moment().utc();
  if (amount && Number.isInteger(amount)) {
    // Get day in the past or future
    const currentDay = amount > 0 ? date.add(Math.abs(amount), unit) : date.subtract(Math.abs(amount), unit);
    return currentDay.endOf(unit).format(format);
  } else if (amount && isString(amount)) {
    return moment(amount).endOf(unit).format(format);
  }
  // End of current day
  return date.endOf(unit).format(format);
};

/**
 * Splits date range by day
 *
 * @param startDate - start of the range {string}
 * @param endDate - end of the range {string}
 * @param daysOnly {boolean}
 * @returns {Array}
 */
const range = (startDate, endDate, daysOnly = true) => {
  let rangeByDays = Array.from(moment().range(startDate, endDate).by('day'));
  // format results
  rangeByDays = rangeByDays.map((day) => {
    const interval = {day: day.format('YYYY-MM-DD')};
    if (!daysOnly) {
      interval.startOfDay = day.startOf('day').format(DATE_FORMAT);
      interval.endOfDay = day.endOf('day').format(DATE_FORMAT);
    }
    return interval;
  });

  return rangeByDays;
};

const yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
const formatYYYYMMDD = (date) => moment(date).format('YYYY-MM-DD');
const hourShift = (s=0) => moment().subtract(s, 'hour').utc().format('HH');
const minuteShift = (s=0) => moment().subtract(s, 'minutes').utc().format('YYYY-MM-DD HH:mm:00');

export default {
  now,
  checkDate,
  startOf,
  endOf,
  range,
  yesterday,
  formatYYYYMMDD,
  hourShift,
  minuteShift,
};
