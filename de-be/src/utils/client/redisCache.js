import redis from 'redis';
import {redisCreds, redisCreds2} from '../../../config';
import {clients} from '../../services/clients';

const creds = {cacheData: redisCreds};

if (process.env.NODE_ENV === 'PRODUCTION') {
  creds.cacheData = redisCreds2;
}

function initRedisForBidder() {
  clients.redisClientCacheForHandler = redis.createClient({
    host: creds.cacheData.host,
    port: creds.cacheData.port,
    password: creds.cacheData.password,
  });
}

export default initRedisForBidder;
