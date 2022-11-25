import {publisher as Publisher} from '../../models';
import moment from 'moment';
import config from '../../../config';
import {clients} from '../clients';
import chCluster from '../../utils/client/chCluster';

import log from '../../../logger';

export const runTaskCachingPubData = async () => {
  try {
    const pubs = await Publisher.findAll({
      attributes: ['id', 'status'],
    });
    const pubIds = pubs.map((pub) => pub.get().id);

    if (!pubIds.length) {
      return;
    }
    const timeStart = moment().startOf('month').format('YYYY-MM-DD');
    const timeEnd = moment().format('YYYY-MM-DD');

    const response1 = await chCluster.querying(sql1(pubIds, timeStart, timeEnd));
    await clients.redisClient.setAsync(`cache-publisher-data`, JSON.stringify(response1.data));

    const activePubIds = pubs.filter((item) => item.status !== 'REMOVED')
        .map((pub) => pub.get().id);

    if (!activePubIds.length) {
      return;
    }

    const response2 = await chCluster.querying(sql2(activePubIds, timeStart, timeEnd));
    await clients.redisClient.setAsync(`cache-top-five-ssp`, JSON.stringify(response2.data));
  } catch (e) {
    log.error(`caching publisher data \n ${e.stack}`);
  }
};

function sql1(pubIds, timeStart, timeEnd) {
  return `SELECT 
      t1.publisherId as pid,
      t2.payout + t3.payout as payout
    FROM (
      SELECT arrayJoin([${pubIds}]) as publisherId) as t1
      LEFT JOIN (
        SELECT publisherId, floor(sumMergeIf(sumPayout, status='APPROVED'), 6) as payout
        FROM dsp.${config.clickhouseCluster.IMP_COUNTER_DAILY}
        WHERE createdDate >= '${timeStart}' and createdDate <= '${timeEnd}' and wlid='${config.wlid}'
        GROUP BY publisherId
      ) as t2
      ON toUInt16(t1.publisherId) = toUInt16(t2.publisherId)
      
      LEFT JOIN (
        SELECT publisherId, floor(sumMergeIf(sumPayout, paymentModel='CPC' and status = 'APPROVED'), 6) as payout
        FROM dsp.${config.clickhouseCluster.CLICK_COUNTER_DAILY}
        WHERE createdDate >= '${timeStart}' and createdDate <= '${timeEnd}' and wlid='${config.wlid}'
        GROUP BY publisherId
      ) as t3
      ON toUInt32(t1.publisherId) = toUInt32(t3.publisherId)
    `;
}

function sql2(pubIds, timeStart, timeEnd) {
  return `
    SELECT 
      t1.publisherId as publisherId,
      t2.price + t3.price as revenue
    FROM (
      SELECT arrayJoin([${pubIds}]) as publisherId) as t1
      LEFT JOIN (
        SELECT 
          publisherId as pid, 
          floor(sumMergeIf(sumPrice, paymentModel='CPM' and status='APPROVED'), 6) as price
        FROM dsp.${config.clickhouseCluster.IMP_COUNTER_DAILY}
        WHERE createdDate >= '${timeStart}' and createdDate <= '${timeEnd}' and wlid='${config.wlid}'
        GROUP BY pid
      ) as t2
      ON toUInt16(t1.publisherId) = toUInt16(t2.pid)
      LEFT JOIN (
        SELECT 
          publisherId as pid, 
          floor(sumMergeIf(sumPrice, paymentModel='CPC' and status = 'APPROVED'), 6) as price
        FROM dsp.${config.clickhouseCluster.CLICK_COUNTER_DAILY}
        WHERE createdDate >= '${timeStart}' and createdDate <= '${timeEnd}' and wlid='${config.wlid}'
        GROUP BY pid
      ) as t3
      ON toUInt16(t1.publisherId) = toUInt16(t3.pid)
    ORDER BY revenue DESC LIMIT 5
    `;
}
