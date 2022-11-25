import {campaign as Campaign} from '../../models';
import moment from 'moment';
import config from '../../../config';
import {clients} from '../clients';
import chCluster from '../../utils/client/chCluster';
import {errorLog} from '../../utils/common';

import log from '../../../logger'

export const runTaskCachingCampaignData = async () => {
  try {
    const campaigns = await Campaign.findAll({
      attributes: ['id', 'status'],
    });
    const campaignIds = campaigns.map((c) => c.get().id);

    if (!campaignIds.length) {
      return;
    }
    const timeStart = moment().startOf('month').format('YYYY-MM-DD');
    const timeEnd = moment().format('YYYY-MM-DD');

    const response1 = await chCluster.querying(sql1(campaignIds, timeStart, timeEnd));
    await clients.redisClient.setAsync(`cache-campaign-data`, JSON.stringify(response1.data));

    const activeCampaignIds = campaigns.filter((item) => item.status !== 'REMOVED')
        .map((campaign) => campaign.get().id);

    if (!activeCampaignIds.length) {
      return;
    }

    const response2 = await chCluster.querying(sql2(activeCampaignIds, timeStart, timeEnd));
    await clients.redisClient.setAsync(`cache-top-five-campaign`, JSON.stringify(response2.data));
  } catch (e) {
    log.error(`caching campaign data \n ${e.stack}`)
    errorLog(`caching campaign data \n ${e.message}`);
  }
};

function sql1(campaignIds, timeStart, timeEnd) {
  return `
    SELECT 
      t1.campaignId as campaignId,
      toUInt32(impressionsCount) as impressionsCount,
      toUInt32(clicksCount) as clicksCount,
      0 as conversionsCount,
      t2.price + t3.price as revenue,
      t2.payout + t3.payout as payout,
      revenue - payout as profit
    FROM (
      SELECT arrayJoin([${campaignIds}]) as campaignId) as t1
      
      LEFT JOIN (
        SELECT 
          campaignId as cid,
          countMerge(amount) as impressionsCount,
          floor(sumMergeIf(sumPrice, status='APPROVED'), 6) as price,
          floor(sumMergeIf(sumPayout, status='APPROVED'), 6) as payout
        FROM dsp.${config.clickhouseCluster.IMP_COUNTER_CAMPAIGN}
        WHERE createdDate >= '${timeStart}' and createdDate <= '${timeEnd}' and wlid='${config.wlid}'
        GROUP BY cid
      ) as t2
      ON toUInt32(t1.campaignId) = toUInt32(t2.cid)
      
      LEFT JOIN (
        SELECT 
          campaignId as cid,
          countMerge(amount) as clicksCount,
          floor(sumMergeIf(sumPrice, paymentModel='CPC' and status = 'APPROVED'), 6) as price,
          floor(sumMergeIf(sumPayout, paymentModel='CPC' and status = 'APPROVED'), 6) as payout
        FROM dsp.${config.clickhouseCluster.CLICK_COUNTER_CAMPAIGN}
        WHERE createdDate >= '${timeStart}' and createdDate <= '${timeEnd}' and wlid='${config.wlid}'
        GROUP BY cid
      ) as t3
      ON toUInt32(t1.campaignId) = toUInt32(t3.cid)
    `;
}

function sql2(campaignIds, timeStart, timeEnd) {
  return `
    SELECT 
      t1.campaignId as campaignId,
      t2.price + t3.price as revenue
    FROM (
      SELECT arrayJoin([${campaignIds}]) as campaignId) as t1
      
      LEFT JOIN (
        SELECT 
          campaignId as cid, 
          floor(sumMergeIf(sumPrice, paymentModel='CPM' and status='APPROVED'), 6) as price
        FROM dsp.${config.clickhouseCluster.IMP_COUNTER_CAMPAIGN}
        WHERE createdDate >= '${timeStart}' and createdDate <= '${timeEnd}' and wlid='${config.wlid}'
        GROUP BY cid
      ) as t2
      ON toUInt16(t1.campaignId) = toUInt16(t2.cid)
      
      LEFT JOIN (
        SELECT 
          campaignId as cid, 
          floor(sumMergeIf(sumPrice, paymentModel='CPC' and status = 'APPROVED'), 6) as price
        FROM dsp.${config.clickhouseCluster.CLICK_COUNTER_CAMPAIGN}
        WHERE createdDate >= '${timeStart}' and createdDate <= '${timeEnd}' and wlid='${config.wlid}'
        GROUP BY cid
      ) as t3
      ON toUInt32(t1.campaignId) = toUInt32(t3.cid)
    ORDER BY revenue DESC LIMIT 5
    `;
}
