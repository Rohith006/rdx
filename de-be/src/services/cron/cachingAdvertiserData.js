import moment from 'moment';

import {advertiser as Advertiser} from '../../models';
import {getAdvertiserSql} from '../../utils/clickhouseQq2';
import {clients} from '../clients';
import chCluster from '../../utils/client/chCluster';

import log from '../../../logger'

export const runTaskCachingAdvertiserData = async () => {
  try {
    const startDate = moment().startOf('month').format('YYYY-MM-DD');
    const endDate = moment().format('YYYY-MM-DD');
    const advertisers = await Advertiser.findAll({attributes: ['id']});
    const adverIds = advertisers.map((a) => a.get().id);
    const response = await chCluster.querying(getAdvertiserSql(adverIds, startDate, endDate));
    await clients.redisClient.setAsync(`cache-advertiser-data`, JSON.stringify(response.data));
  } catch (e) {
    log.error(`caching advertiser data \n ${e.stack}`);
  }
};
