import moment from 'moment';

const today = moment().format('YYYY-MM-DD');
const dayShift = (s=0) => moment().subtract(s, 'day').utc().format('YYYY-MM-DD');

export default {
  today,
  dayShift,
};
