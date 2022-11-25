import {campaign as Campaign, sequelize,} from '../models';
import {REMOVED} from '../constants/campaign';

export const getCampaignsStatistics = (options) => new Promise(async (resolve, reject) => {
  const partitionWhere = [];
  /* Start query */
  //const whereFilter = `and wlid='${wlid}' ${generateSqlWhere(filters)}`;
  let SEARCH_CAMPAIGNS_QUERY = `
  select c."id", 
  c."campaignName",
  c."advertiserId",
  c."apiCampaignId",
  c."status",
  c."accessStatus",
  c."advertisingChannel",
  c."platform",
  c."kpiType",
  c."listTags",
  c."createdAt",
  c."modelPayment",
  c."monetizationType",
  c."statusReason",
  a."name" as "advertiserName",
  b."companyName",
  b."isCorporation"
  from campaigns c 
  left join advertisers a on a."id" = c."advertiserId" 
  left join "billingDetails" b on b."userId" = c."advertiserId"
 `;

  if (!options.status) {
    partitionWhere.push(`c."status" != '${REMOVED}' `);
  }
  if (options.campaignType) {
    partitionWhere.push(`c."modelPayment" = '${options.campaignType}' `);
  }
  if(options.startDate && options.endDate){
    partitionWhere.push(`date(c."createdAt") >= '${options.startDate}' and date(c."createdAt") <= '${options.endDate}'`)
  }
  if (options.modelPayment) {
    partitionWhere.push(`c."modelPayment" = '${options.modelPayment}' `);
  }
  if (options.os) {
    partitionWhere.push(`c."platform" = '${options.os}' `);
  }
  if (options.status) {
    partitionWhere.push(`c."status" = '${options.status}' `);
  }
  if (options.advertiserId) {
    const {advertiserId} = options;
    let values;
    if (Array.isArray(advertiserId)) {
      values = advertiserId.length > 1 ? advertiserId.join(',') : advertiserId[0];
    } else {
      values = advertiserId;
    }
    partitionWhere.push(`c."advertiserId" IN (${values}) `);
  }
  if (options.countries && options.countries.length) {
    const countries = `'{${options.countries.toString()}}'::varchar[]`;
    partitionWhere.push(`c."geography" && ${countries} `);
  }

  let whereString = partitionWhere.length ? 'where ' + partitionWhere[0] : '';
  for (let i = 1; i <= partitionWhere.length - 1; i++) {
    whereString += `and ${partitionWhere[i]}`;
  }
  SEARCH_CAMPAIGNS_QUERY += whereString;
  /* End query */
  SEARCH_CAMPAIGNS_QUERY += `group by c."id", a."id", b."companyName", b."isCorporation" order by c."createdAt" desc`;
  try {
    const campaigns = await sequelize.query(SEARCH_CAMPAIGNS_QUERY, {type: sequelize.QueryTypes.SELECT});
    resolve(campaigns.map((campaign) => ({
      ...campaign,
      advertiserName: !campaign.isCorporation ? campaign.advertiserName : campaign.companyName,
    })));
  } catch (err) {
    reject(err);
  }
});

export const getCampaignsIds = async (where) => {
  const ids = await Campaign.findAll({where, attributes: ['id']});
  return ids.map((id) => id.get().id.toString());
};
