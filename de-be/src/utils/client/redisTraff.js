import redis from 'redis';
import {redisCreds, redisTraffCreds} from '../../../config';
import {clients} from '../../services/clients';

let redisConf = redisCreds;
if (process.env.NODE_ENV === 'PRODUCTION') {
  redisConf = redisTraffCreds;
}
function initRedisTraff() {
  clients.redisClientTraff = redis.createClient(redisConf);
}
export default initRedisTraff;
