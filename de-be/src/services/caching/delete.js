import {getAdvertiserCampaignIds, getAdvertiserId} from '../../utils/campaigns';
import {clients} from '../../services/clients';
import {wlid} from '../../../config';

let redisClient;

export const cacheRemoveCampaign = async (campaignId) => {
  const scanned = await redisClient.scanAsync(0, 'MATCH', `campaign:${campaignId}:*`, 'COUNT', 1000000);
  const keys = scanned[1];
  /* let apiOfferId = await redisClient.hmgetAsync(keys[0], 'apiCampaignId');
    console.log(apiOfferId);*/
  const advertiserId = await getAdvertiserId(campaignId);
  console.log(`advertiserId:${advertiserId}`)
  if (keys.length !== 0) {
    await redisClient.delAsync(String(keys[0]));
    // await redisClient.delAsync(`integration:${apiOfferId[0]}:${advertiserId}`);
  }
  /* -------------refresh advertiser: { campaignsIds: [] }---------*/
  const campaignsIds = JSON.stringify(await getAdvertiserCampaignIds(advertiserId));
  await redisClient.hset(`user:${advertiserId}:ADVERTISER`, 'campaignsIds', campaignsIds);
};

export const cacheRemoveBudget = async (campaignId) => {
  await redisClient.delAsync(`budget:${campaignId}`);
};

export const cacheRemoveCampaignAudience = async (campaignId) => {
  await redisClient.delAsync(`campaignAudience:${campaignId}`)
}

export const cacheRemoveUser = async (userId) => {
  await redisClient.delAsync(`user:permissions:${userId}`);

  const scanned = await redisClient.scanAsync(0, 'MATCH', `user:${userId}:*`, 'COUNT', 1);
  const keys = scanned[1];
  if (keys.length !== 0) {
    await redisClient.delAsync(keys[0]);
  }
};

export const cacheBulkRemoveByKeys = async (keys) => {
  try {
    const multi = redisClient.multi();
    multi.del(keys);
    await multi.execAsync();
  } catch (e) {
    console.error(`Error delete multiple items from redis: ${e.message}`);
  }
};

export const cacheRemoveEntity = async (entity, id) => {
  await clients.redisClientCacheForHandler.delAsync(`${entity}:${Number(wlid)}:${id}`);
};

export const setRedisClient = (client) => {
  redisClient = client;
};
