let redisClient;
import moment from 'moment';
import {campaign as Campaign} from '../../models';

import log from '../../../logger';

// TASK: {"task":"UPDATE_STATUS_CAMPAIGN","campaignId":"5","status":"SUSPENDED","statusReason":"exceeded total budget"}
export const runTask = async () => {
  try {
    const task = await redisClient.lpopAsync('campaignsQ');
    if (!task) {
      return true;
    }
    const {campaignId, status, statusReason} = JSON.parse(task);
    log.debug(`TASK: ${task}`);
    await Campaign.update(
        {status, statusReason},
        {
          where: {id: campaignId.id},
          returning: true,
          deactivatedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
        },
    );
  } catch (e) {
    log.error(`changing campaign status failed \n ${e}`);
  }
};

export const setRedisClient = (client) => {
  redisClient = client;
};
