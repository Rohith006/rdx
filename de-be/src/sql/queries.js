import {wlid} from '../../config';

const PAYOUT_QUERY = (ids, time) => {
  let where = `wlid='${wlid}'`;

  if (time) {
    where += ` AND createdAt BETWEEN '${time.start}' AND '${time.end}'`;
  }

  return `      
      SELECT 
        t0.campaignId as campaign,
        t1.payout + t2.payout as payout 
      FROM (
        SELECT arrayJoin([${ids}] as src) as campaignId) as t0
        
        LEFT JOIN (
        SELECT 
          floor( sumIf( price, status = 'APPROVED' ),6 ) AS payout,
          campaignId
        FROM dsp.distributed_impressions_local_v3
        WHERE ${where}
        GROUP BY campaignId) as t1 
        ON toUInt32(t0.campaignId) = toUInt32(t1.campaignId)
       
        LEFT JOIN (
        SELECT 
          floor( sumIf( price, status = 'APPROVED' ),6 ) AS payout,
          campaignId
        FROM dsp.distributed_clicks_local_v3
        WHERE ${where}
        GROUP BY campaignId) as t2
        ON toUInt32(t0.campaignId) = toUInt32(t2.campaignId)
    `;
};

const TOTAL_IMPRESSIONS_QUERY = (campaigns) => {
  const where = `wlid='${wlid}'`;

  return `      
    SELECT 
      t0.campaignId as campaign,
      t1.impressions as impressions 
    FROM (
      SELECT arrayJoin([${campaigns}] as src) as campaignId) as t0
      
      LEFT JOIN (
      SELECT 
        floor( countIf( viewType = 'image' ),6 ) AS impressions,
        campaignId
      FROM dsp.distributed_impressions_local_v3
      WHERE ${where}
      GROUP BY campaignId) as t1 
      ON toUInt32(t0.campaignId) = toUInt32(t1.campaignId)
  `;
};

module.exports = {
  getCampaignPayoutsSql: PAYOUT_QUERY,
  getCampaignImpressionsSql: TOTAL_IMPRESSIONS_QUERY,
};
