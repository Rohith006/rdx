import {getAdvertiserCampaignIds} from '../../utils/campaigns';
import {getCampaignInventories} from '../../utils/inventory';
import {getCampaignBudget} from '../../utils/budget';
import {getCampaignAudioCreative, getCampaignCreativeTag, getCampaignVideoCreative} from '../../utils/creative';

let redisClient;

export const cacheCampaign = async (campaign) => {
  campaign = Object.assign({}, campaign);
  campaign.inventories = await getCampaignInventories(campaign.id);
  campaign.budget = await getCampaignBudget(campaign.id);
  campaign.creativeTag = await getCampaignCreativeTag(campaign.id);
  campaign.videoCreative = await getCampaignVideoCreative(campaign.id);
  campaign.audioCreative = await getCampaignAudioCreative(campaign.id);

  const scanned = await redisClient.scanAsync(0, 'MATCH', `campaign:${campaign.id}:*`, 'COUNT', 1000000);
  //await redisClient.delAsync(scanned[1][0]);
  await redisClient.setAsync(`campaign:${campaign.id}:${campaign.status}`, JSON.stringify(campaign));

  const campaignsIds = JSON.stringify(await getAdvertiserCampaignIds(campaign.advertiserId));
  await redisClient.hsetAsync(`user:${campaign.advertiserId}:ADVERTISER`, 'campaignsIds', campaignsIds);
};

export const cacheCpmCampaign = async (campaign) => {
  campaign.inventories = await getCampaignInventories(campaign.id);
  campaign.budget = await getCampaignBudget(campaign.id);
  campaign.creativeTag = await getCampaignCreativeTag(campaign.id);
  const scanned = await redisClient.scanAsync(0, 'MATCH', `campaign:${campaign.id}:*`, 'COUNT', 1000000);
  //await redisClient.delAsync(scanned[1][0]);
  await redisClient.setAsync(`campaign:${campaign.id}:${campaign.status}`, JSON.stringify(campaign));
};

export const cacheCheckItem = async (obj) => {
  const multi = redisClient.multi();
  multi.hmset(`check:${obj.campaignId}`, obj);
  await multi.execAsync();
};

export const cacheRemoveCheckItem = async (id) => {
  redisClient.delAsync(`check:${id}`);
};

export const removeCampaignFromCache = async (id) => {
  const scanned = await redisClient.scanAsync(0, 'MATCH', `campaign:${id}:*`, 'COUNT', 1000000);
  if (scanned[1][0]) {
    return redisClient.delAsync(scanned[1][0]);
  }
};

export const removeAllCampaignFromCache = async () => {
  const multi = redisClient.multi();
  const scanned = await redisClient.scanAsync(0, 'MATCH', `campaign:*`, 'COUNT', 1000000);

  for (let i = 0; i < scanned[1].length; i++) {
    if (scanned[1][i]) {
      multi.delAsync(scanned[1][i]);
    }
  }
  await multi.execAsync();
};

export const cacheExcludeList = async (ids) => {
  return redisClient.setAsync('exclude-campaign', JSON.stringify(ids));
};

export const getCampaignImpsCounter = async (cid) => {
  return redisClient.getAsync(`campaign-${cid}-icon-imp-counter`);
};

export const cacheCampaignStatus = async (campaign) => {
  campaign.inventories = await getCampaignInventories(campaign.id);
  campaign.budget = await getCampaignBudget(campaign.id);
  campaign.creativeTag = await getCampaignCreativeTag(campaign.id);
  const scanned = await redisClient.scanAsync(0, 'MATCH', `campaign:${campaign.id}:*`, 'COUNT', 1000000);
  const redisCampaignKey = scanned[1][0];
  redisClient.delAsync(redisCampaignKey);
  redisClient.setAsync(`campaign:${campaign.id}:${campaign.status}`, JSON.stringify(campaign));
};

export const cacheAdvertiser = async (user) => {
  user.channel = user.channel ? user.channel[0] : 'null';
  Object.keys(user).forEach((key) => user[key] === null ? user[key] = 'null' : user[key]);
  const key = `user:${user.id}:${user.role}`;
  redisClient.hmsetAsync(key, user);
};

export const cacheAdvertiserUpdate = async (user) => {
  const multi = redisClient.multi();
  Object.keys(user).forEach((key) => user[key] === null ? user[key] = 'null' : user[key]);
  multi.del(`user:${user.id}:ADVERTISER`).hmset(`user:${user.id}:ADVERTISER`, user);
  multi.execAsync();
};

export const cachePublisher = async (user) => {
  user.channel = user.channel ? user.channel[0] : 'null';
  Object.keys(user).forEach((key) => user[key] === null ? user[key] = 'null' : user[key]);
  const key = `user:${user.id}:${user.role}`;
  redisClient.hmsetAsync(key, user);
};

export const cachePublisherUpdate = async (user) => {
  const multi = redisClient.multi();
  user.channel = user.channel ? user.channel[0] : 'null';
  Object.keys(user).forEach((key) => user[key] === null ? user[key] = 'null' : user[key]);
  multi.del(`user:${user.id}:PUBLISHER`).hmset(`user:${user.id}:${user.role}`, user);
  multi.execAsync();
};

export const cacheBillingDetails = async (billingDetails) => {
  billingDetails = Object.assign({}, billingDetails);

  Object.keys(billingDetails).forEach((key) => billingDetails[key] === null ? billingDetails[key] = 'null' : billingDetails[key]);

  await redisClient.hmset(`billingDetails:${billingDetails.id}:${billingDetails.userId}`, billingDetails);
};

export const cacheBudget = async (budget) => {
  budget = Object.assign({}, budget);

  Object.keys(budget).forEach((key) => budget[key] === null ? budget[key] = 'null' : budget[key]);

  await redisClient.hmset(`budget:${budget.campaignId}`, budget);
};

export const setRedisClient = (client) => {
  redisClient = client;
};
