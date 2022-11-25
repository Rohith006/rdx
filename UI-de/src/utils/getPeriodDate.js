import {LAST_MONTH, LAST_WEEK, LAST_YEAR, THIS_WEEK} from '../constants/reports';
import moment from 'moment';

export default (value) => {
  switch (value) {
    case THIS_WEEK: {
      const startDate = moment().day(1);
      const endDate = moment().day(moment().get('date') + 1);
      return {
        startDate,
        endDate,
      };
    }
    case LAST_WEEK: {
      const startDate = moment().day(-6);
      const endDate = moment().day(0);
      return {
        startDate,
        endDate,
      };
    }
    case LAST_MONTH: {
      const startDate = moment().month(moment().get('month') - 1).date(1);
      const endDate = moment().month(moment().get('month')).date(0);
      return {
        startDate,
        endDate,
      };
    }
    case LAST_YEAR: {
      const startDate = moment().year(moment().get('year') - 1).month(0).date(1);
      const endDate = moment().year(moment().get('year') - 1).month(12).date(0);
      return {
        startDate,
        endDate,
      };
    }
  }
};

export const getStartDate = () => moment(new Date()).add(-6, 'days').format('YYYY-MM-DD');
export const getEndDate = () => moment(new Date()).add(0, 'days').format('YYYY-MM-DD');
