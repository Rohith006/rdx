import {
    getSummaryTodayAdminSql,
    getSummaryYesterdayAdminSql,
    trafficStatisticsSqlAdmin,
} from '../../../utils/clickhouseQq2';
import {clients} from '../../clients';
import chCluster from '../../../utils/client/chCluster';

import log from '../../../../logger'

const Moment = require('moment');
const MomentRange = require('moment-range');

const moment = MomentRange.extendMoment(Moment);

export const runTaskCachingAdminTrafficStatistics = async () => {
  try {
    const dateRange = 30;
    const startDate = moment().utc().subtract(dateRange - 1, 'days').startOf('day');
    const endDate = Number(dateRange) === 1 ? moment().utc().add(1, 'day').startOf('day') : moment();

    const interval = Array.from(moment().range(startDate, endDate).by('day')).map((day) => day.format('YYYY-MM-DD'));

    const {data} = await chCluster.querying(trafficStatisticsSqlAdmin(interval));
    data.forEach((item) => {
      for (const key in item) {
        if (!item[key]) {
          item[key] = 0;
        }
      }
      item.date = moment(item.date).format('DD MMM');
    });

    // save graffic-stats to redis
    await clients.redisClient.set('cache-dashboard-graf', JSON.stringify(data));

    // calculate summary on dashboard
    const startOfToday = moment().utc().startOf('day').format('YYYY-MM-DD');
    const startOfYesterday = moment().utc().subtract(1, 'days').startOf('day').format('YYYY-MM-DD');
    const endOfYesterday = moment().utc().subtract(1, 'days').endOf('day').format('YYYY-MM-DD');
    const now = moment().utc().format('YYYY-MM-DD');
    const yesterdayStats = await chCluster.querying(getSummaryYesterdayAdminSql(startOfYesterday, endOfYesterday));
    const todayStats = await chCluster.querying(getSummaryTodayAdminSql(startOfToday, now));
    const summary = {...todayStats.data[0], ...yesterdayStats.data[0]};

    // save summary-stats to redis
    await clients.redisClient.set('cache-dashboard-summary', JSON.stringify(summary));
  } catch (err) {
    log.error(`caching admin traffic stats \n  ${err.stack}`);
  }
};
