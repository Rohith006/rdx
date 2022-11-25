import {
    advertiser as Advertiser,
    audience as Audience,
    audioAdCreative as AudioAdCreative,
    billingDetails as BillingDetails,
    budget as Budget,
    campaign as Campaign,
    creativeTag as CreativeTag,
    inventory as Inventory,
    publisher as Publisher,
    campaignAudience as CampaignAudience,
    Sequelize,
    videoAdCreative as VideoAdCreative,
} from '../../models';
import * as TrafficOptimizationService from '../trafficOptimization.service';
import {getAdvertiserCampaignIds} from '../../utils/campaigns';
import {getCategories} from '../../utils/categories';
import {REMOVED} from '../../constants/campaign';
import {asyncForEach, validateBeforeRedis} from '../../utils/common';
import {handler, wlid} from '../../../config';
import {clients} from '../clients';
import AudienceService from '../audience.service';

const Op = Sequelize.Op;
let redisClient;

export const cacheAllCampaigns = async () => {
  const multi = redisClient.multi();
  const campaigns = await Campaign.findAll({
    where: {status: {[Op.ne]: REMOVED}},
    include: [
      {model: Budget},
      {model: Inventory, attributes: ['publisherId', 'payout']},
      {model: CreativeTag},
      {model : CampaignAudience}
    ],
  });
  campaigns.map(async (campaign) => {
    const data = campaign.get();
    if (data.monetizationType === 'VIDEO') {
      const responseDb = await VideoAdCreative.findOne({where: {campaignId: data.id}});
      if (!responseDb) {
        return;
      }
      data.videoCreative = responseDb.get();
      data.videoCreative.videoCreativeUrl = encodeURI(data.videoCreative.videoCreativeUrl);
      const key = `campaign:${data.id}:${data.status}`;
      redisClient.setAsync(key, JSON.stringify(data));
    } else if(data.monetizationType === 'AUDIO'){
      const responseDb = await AudioAdCreative.findOne({where: {campaignId: data.id}});
      if(!responseDb){
        return;
      }
      data.audioCreative = responseDb.get();
      data.audioCreative.audioCreativeUrl = encodeURI(data.audioCreative.audioCreativeUrl);
      const key = `campaign:${data.id}:${data.status}`;
      redisClient.setAsync(key, JSON.stringify(data));
    } else {
      const key = `campaign:${data.id}:${data.status}`;
      multi.set(key, JSON.stringify(data));
    }
  });
  await multi.execAsync();
};

export const cacheAllUsers = async () => {
  const multi = redisClient.multi();
  const advertisers = await Advertiser.findAll();
  const publishers = await Publisher.findAll();

  for (const user of publishers) {
    const data = user.get();
    validateBeforeRedis(data);
    const key = `user:${data.id}:${data.role}`;
    multi.hmset(key, data);
  }
  await multi.execAsync();

  for (const user of advertisers) {
    const data = user.get();
    data.campaignsIds = JSON.stringify(await getAdvertiserCampaignIds(data.id));
    validateBeforeRedis(data);
    const key = `user:${data.id}:${data.role}`;
    multi.hmset(key, data);
  }
  await multi.execAsync();
};

export const cacheWlidSettings = async () => {
  const arr1 = handler.impressionDomain.split('/');
  const arr2 = handler.clickDomain.split('/');
  const settings = {
    wl_id: Number(wlid),
    impression_domain: `${arr1[0]}//${arr1[2]}`,
    click_domain: `${arr2[0]}//${arr2[2]}`,
  };
  await clients.redisClientCacheForHandler.setAsync(`settings:${wlid}`, JSON.stringify(settings));
};

// TODO need refactoring

export const cacheAllCampaignWBlistSubIds = async () => {
  // Cache white listed sub ids
  const campaignWlists = await TrafficOptimizationService.getCampaignWBlistedSubIds('WHITELIST');
  await redisClient.setAsync('campaignWhiteListSubIds', JSON.stringify(campaignWlists));
  // Cache black listed sub ids
  const campaignBlists = await TrafficOptimizationService.getCampaignWBlistedSubIds('BLACKLIST');
  await redisClient.setAsync('campaignBlackListSubIds', JSON.stringify(campaignBlists));
};

export const cacheAllAudienceUsers = async () => {
  const audiences = await Audience.findAll({where: {status: 'ACTIVE'}});

  if (!audiences || !audiences.length) {
    return;
  }

  const cacheData = new Map();

  await asyncForEach(audiences, async (item) => {
    const users = await AudienceService.loadAudienceUsers(item.id);
    if (!users || !users.length) {
      return;
    }
    const ifas = new Set();
    users.map((el) => ifas.add(el.ifa));
    cacheData.set(item.id, JSON.stringify(ifas));
  });

  await redisClient.setAsync('audiences', JSON.stringify(cacheData));
};

export const cacheAllIntegrationCampaigns = async () => {
  const campaigns = await Campaign.findAll({
    where: {apiCampaignId: {[Op.ne]: null}},
    attributes: ['id', 'apiCampaignId', 'advertiserId'],
  });
  const multi = redisClient.multi();

  campaigns.forEach((campaign) => {
    const data = campaign.get();
    redisClient.hmset(`integration:${data.apiCampaignId}:${data.advertiserId}`, {
      id: data.id,
      apiCampaignId: data.apiCampaignId,
    });
  });
  await multi.execAsync();
};

export const cacheCheckList = async () => {
  let checkList = await Campaign.findAll({
    where: {disableTestLink: false},
  });

  const multi = redisClient.multi();
  checkList.forEach((item) => {
    const data = item.get();
    const obj = {
      campaignId: data.id,
      status: data.status,
    };
    multi.hmset(`check:${data.id}`, obj);
  });
  await multi.execAsync();

  checkList = await Campaign.findAll({
    where: {disableTestLink: true},
  });

  checkList.forEach((item) => {
    const data = item.get();
    multi.del(`check:${data.id}`);
  });
  await multi.execAsync();
};

export const cacheAllBillingDetails = async () => {
  const billingDetails = await BillingDetails.findAll();
  const multi = redisClient.multi();

  billingDetails.forEach((billingDetail) => {
    const data = billingDetail.get();
    validateBeforeRedis(data);
    multi.hmset(`billingDetails:${data.id}:${data.userId}`, data);
  });

  await multi.execAsync();
};

export const cacheAllBudget = async () => {
  const budgets = await Budget.findAll();
  const multi = redisClient.multi();
  budgets.forEach((budget) => {
    const data = budget.get();
    validateBeforeRedis(data);
    multi.hmset(`budget:${data.campaignId}`, data);
  });
  await multi.execAsync();
};

export const cacheSelectedCampaigns = async (campaigns) => {
  const multi = redisClient.multi();

  campaigns.forEach((campaign) => {
    const data = campaign.get();
    multi.set(`campaign:${data.id}:${data.status}`, JSON.stringify(data));
  });

  await multi.execAsync();
};

export const cacheCategories = async () => {
  const categories = await getCategories();
  await redisClient.setAsync('categories', JSON.stringify(categories));
};

/**
 * Multi rename redis entry keys
 * @param entries - array that contains entry keys (example: [{previousKey: 'PREVIOUS_KEY', anotherKey: 'ANOTHER_KEY'}])
 * @returns {Promise<void>}
 */
export const renameEntryKey = async (entries) => {
  for (const entry of entries) {
    const matchedKeys = await redisClient.scanAsync(0, 'MATCH', entry.previousKey, 'COUNT', 100000);
    if (matchedKeys[1].length) {
      const multi = redisClient.multi();
      for (const previousKey of matchedKeys[1]) {
        multi.rename(previousKey, entry.anotherKey);
      }
      await multi.execAsync();
    }
  }
};

export const setRedisClient = (client) => {
  redisClient = client;
};
