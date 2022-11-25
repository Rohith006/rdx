import {setRedisClient as setClient2} from '../services/caching/bulkCreate';
import {setRedisClient as setClient3} from '../services/caching/create';
import {setRedisClient as setClient4} from '../services/caching/delete';
import {setRedisClient as setClient6} from '../middlewares/v1/utils';
import {setRedisClient as setClient10} from '../services/cron/inventorySummary';
import {setRedisClient as setClient11} from '../middlewares/v1/database/load';
import {setRedisClient as setClient13} from '../middlewares/v1/publishers';
import {setRedisClient as setClient16} from '../middlewares/v1/dashboard';
import {clients} from './clients';

export const initRedisClient = async (redisClient) => {
  setClient2(redisClient);
  setClient3(redisClient);
  setClient4(redisClient);
  setClient6(redisClient);
  setClient10(redisClient);
  setClient11(redisClient);
  setClient13(redisClient);
  setClient16(redisClient);
  clients.redisClient = redisClient;
};
