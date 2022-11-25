import {
    campaignPubSubIdBWlist as CampaignPubSubIdBWlist,
    campaignToWBListItems as CampaignToWBListItems,
    sequelize,
    Sequelize,
    whiteBlackListItems as WhiteBlackListItems,
} from '../models';
import SqlString from 'sqlstring';
import {getCampaignsIds} from './campaign.service';

const Op = Sequelize.Op;

/**
 *
 * @param params
 * @returns {Promise<*>}
 */
export const fetchCampaignWBlistedItems = async (params, user) => {
  const {campaignId, publisherId, list, type} = params;
  const {id, role} = user;
  let campaigns;
  if (role === 'ADVERTISER') {
    campaigns = await getCampaignsIds({advertiserId: id});
  }
  try {
    let where = 'cToWB.id > 0';
    if (campaignId) {
      where += ` AND cp."campaignId" in ('${campaignId}', 'ALL')`;
    } else if (campaigns) {
      campaigns.push('ALL');
      where += ` AND cp."campaignId" in (${SqlString.escape(campaigns)})`;
    }
    if (publisherId) {
      where += ` AND cp."publisherId" in ('${publisherId}', 'ALL')`;
    }
    if (type) {
      where += ` AND cp."type" = '${type}'`;
    }
    const sqlQuery = `
      SELECT 
        cToWB.id, wbli.value, wbli."demandType", cp.list, cp."campaignId", cp."publisherId", cp."type"   
      FROM "whiteBlackListItems" wbli 
        LEFT JOIN "campaignToWBListItems" cToWB ON cToWB."whiteBlackListItemId" = wbli.id 
        LEFT JOIN "campaignPubSubIdBWlists" cp ON cp.id = cToWB."campaignPubSubIdBWlistId"  
      WHERE  ${where}
      ORDER BY wbli."createdAt" DESC 
    `;

    return await sequelize.query(sqlQuery, {type: sequelize.QueryTypes.SELECT});
  } catch (e) {
    console.error(e);
  }
};

/**
 * Add category list of subIds to WHITE/BLACK LIST
 *
 * @param data {subId, demand, publisher, list, category, type}
 * @returns {Promise<void>}
 */
export const addSubIdsToFilterList = async (data) => {
  const subIds = parseSubIdList(data.subId);
  const demand = data.demand && data.demand.toString() || 'ALL';
  const publisher = data.publisherId && data.publisherId.toString() || 'ALL';
  const type = data.type || 'subId';

  const params = {
    list: data.list,
    category: data.category,
    values: subIds,
    demand,
    publisher,
    type,
  };

  try {
    if (data.category === 'campaign') {
      await updateCampaignWBSubIds(params);
    }
  } catch (e) {
    console.error(e);
  }
};

/**
 *
 * @param params
 * @returns {Promise<void>}
 */
export const removeCampaignSubIds = async (params) => {
  let {isRemoveAll, list, campaign, publisher, rows, type} = params;
  const campaignId = campaign && campaign.toString() || 'ALL';
  const publisherId = publisher && publisher.toString() || 'ALL';
  type = type || 'subId';
  try {
    const ids = rows.map((item) => item.id);

    if (isRemoveAll === true) {
      const item = await CampaignPubSubIdBWlist.findOne({
        where: {
          campaignId: campaignId, publisherId: publisherId, list: list, type: type,
        },
      });

      if (item) {
        await CampaignToWBListItems.destroy({where: {campaignPubSubIdBWlistId: item.id}});
      }
    }

    await CampaignToWBListItems.destroy({where: {id: {[Op.in]: ids}}});
  } catch (e) {
    console.error(e);
  }
};

const updateCampaignWBSubIds = async (params) => {
  const {demand, publisher, type, list, values} = params;

  // Add or update white-black list filters
  let filter = await CampaignPubSubIdBWlist.findOne({where: {campaignId: demand, publisherId: publisher, type: type, list: list}});
  if (!filter) {
    const data = await CampaignPubSubIdBWlist.create(
        {campaignId: demand, publisherId: publisher, type, list},
        {returning: true},
    );
    filter = data.get();
  }

  // Find and skip duplicate sub ids
  const existingWb = await WhiteBlackListItems.findAll({
    where: {value: {[Op.in]: values}, demandType: 'CAMPAIGN', type: type, list: list},
    attributes: ['id', 'value'],
  });

  const diff = [];
  // There are no white/black listed sub ids - save all
  if (!existingWb.length) {
    values.forEach((val) => diff.push({value: val, demandType: 'CAMPAIGN', list, type}));
  } else {
    const existingWbItemsSet = new Set();
    existingWb.forEach((el) => existingWbItemsSet.add(el.value));
    // Find diff in two arrays
    values.forEach((val) => {
      if (!existingWbItemsSet.has(val)) {
        diff.push({value: val, demandType: 'CAMPAIGN', list, type});
      }
    });
  }
  // Save new subIds
  if (diff.length) {
    await WhiteBlackListItems.bulkCreate(diff);
  }

  let wbListItems = await WhiteBlackListItems.findAll({
    where: {value: {[Op.in]: values}, demandType: 'CAMPAIGN', type: type, list: list},
    include: [{model: CampaignToWBListItems}],
    attributes: ['id', 'value'],
  });

  wbListItems = wbListItems.filter((item) => {
    if (!item.campaignToWBListItems.length) {
      return true;
    }
    const pKey = item.campaignToWBListItems.find((el) => el.campaignPubSubIdBWlistId === filter.id);
    // Skip if already exists
    return !pKey;
  }).map((item) => ({campaignPubSubIdBWlistId: filter.id, whiteBlackListItemId: item.id}));

  await CampaignToWBListItems.bulkCreate(wbListItems);
};

const parseSubIdList = (subIds) => {
  if (!subIds) return [];

  // Replace enter, comma on space for better splitting
  const modifiedSubIds = subIds.toString().replace(/[\n, ]/g, ' ');
  let array = modifiedSubIds.split(' ');
  // Filter subIds and remove empty values
  array = array.filter((item) => item);
  // return array of unique values
  return Array.from(new Set(array));
};

export const getCampaignWBlistedSubIds = async (listType) => {
  try {
    const sqlQuery = `
      SELECT 
        cp.list, cp."type", cp."campaignId", cp."publisherId", cp.id, wbLI."demandType", wbLI.value 
      FROM "campaignToWBListItems" cToWbL 
        LEFT JOIN "campaignPubSubIdBWlists" cp ON cToWbL."campaignPubSubIdBWlistId" = cp.id 
        LEFT JOIN "whiteBlackListItems" wbLI ON wbLI.id = cToWbL."whiteBlackListItemId"
      WHERE wbLI."demandType" = 'CAMPAIGN' AND wbLI.list = '${listType}';     
    `;

    return await sequelize.query(sqlQuery, {type: sequelize.QueryTypes.SELECT});
  } catch (e) {
    console.error(e);
  }
};

export const getCampaignWBlistedSubIds2 = async (listType) => {
  try {
    const sqlQuery = `
      SELECT 
        "publisherId",
        "campaignId",
        t3."type" as type,
        ARRAY_AGG(distinct value) as list
      FROM "campaignToWBListItems" t1 
        LEFT JOIN "campaignPubSubIdBWlists" t2 
        ON t1."campaignPubSubIdBWlistId" = t2.id 
        LEFT JOIN "whiteBlackListItems" t3 
        ON t1."whiteBlackListItemId" = t3.id
      WHERE t3."demandType" = 'CAMPAIGN' AND t3.list = '${listType}'
      GROUP BY "publisherId", "campaignId", t3.type
    `;

    return await sequelize.query(sqlQuery, {type: sequelize.QueryTypes.SELECT});
  } catch (e) {
    console.error(e);
  }
};
