import {clickhouse, wlid} from '../../config';

const {
  versionTable,
  VERSION_BIDREQUEST_TABLE,
    distributed_impressions,
    distributed_clicks
} = clickhouse;

export const getAdvertiserSql = (ids, startDate, endDate) => (
  `select
     advertiserId,
     floor(sumIf( price, status='APPROVED' ), 2) as spend 
    from dsp.impressions_${versionTable} 
    where advertiserId in (${ids}) and createdDate between '${startDate}' and '${endDate}' and wlid='${wlid}'
    group by advertiserId
  `
);


export const topCampaignsAdvertiserSql = (id, campaignId) => (
  `select (select floor(sum( price ), 2) from dsp.impressions_${versionTable} where advertiserId=${id} and wlid='${wlid}' and campaignId=${campaignId} AND status='APPROVED' ) as spent`
);

export const getPublisherTopCampaign = (id, campaignId) => (
  `select (select floor(sum( payout ), 2) from dsp.distributed_impressions_${versionTable} where publisherId=${id} and wlid='${wlid}' and campaignId=${campaignId} AND status='APPROVED' ) as payout`
);

export const getAdvertiserTopCampaign = (id, campaignId, startDate, endDate) => (
  `select (select floor(sum( price ), 2) from dsp.${distributed_impressions} where advertiserId=${id} and wlid='${wlid}' and campaignId=${campaignId} AND status='APPROVED' AND createdDate BETWEEN '${startDate}' AND '${endDate}' ) as payout`
);
export const getAdvertiserTop5Creatives = (id, startDate, endDate) => (
    `select campaignId, adType, size, count(*) FROM dsp.${distributed_clicks} WHERE advertiserId=${id} AND wlid='${wlid}' AND status='APPROVED' AND createdDate BETWEEN '${startDate}' AND '${endDate}' GROUP BY size, adType, campaignId ORDER BY count() desc limit 5`
)
export const getAdvertiserCountSql = (where) => (
    `   select a."id", a."name", a."email", a."managerId", a."createdAt", a."role", a."skype", a."status",
        m."name" AS "managerName", b."country", b."companyName", count(distinct c.id) AS "campaignsCount"
        from advertisers a
        left join "campaigns" c on a."id" = c."advertiserId"
        left join "admins" m on a."managerId" = m."id"
        left join "billingDetails" b on a."id" = b."userId" and b."userType" = 'ADVERTISER'
        ${where}
        group by a."id", m."name", b."id" order by a."createdAt" desc`
);

export const statsDaySql = (id, startDate, endDate) => (
  `select
  (select floor(sum( price ), 6) from dsp.impressions_${clickhouse.versionTable} where campaignId = ${id} and createdAt between '${startDate}' and '${endDate}' and wlid='${wlid}' and status='APPROVED' ) as revenue`
);

