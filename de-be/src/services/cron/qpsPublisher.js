import {publisher as Publisher} from '../../models';
import moment from 'moment';
import config from '../../../config';
import chCluster from '../../utils/client/chCluster';

import log from '../../../logger'

export const runTaskUpdatePubQps = async () => {
  try {
    let pubs = await Publisher.findAll({
      attributes: ['id'],
    });
    pubs = pubs.map((pub) => pub.get().id);

    if (!pubs.length) {
      return;
    }
    const timeStart = moment().subtract(2, 'minutes').utc().format('YYYY-MM-DD HH:mm');
    const sql = `
      select publisherId as pid, sum(queries) / 60 as qps 
      from dsp.distributed_qpm_local_v1 where wlid='${config.wlid}'and createdAt='${timeStart}:00' and status!='total'
      group by publisherId
    `;
    const response = await chCluster.querying(sql);
    pubs.map(async (pid) => {
      const result = response.data.find((item) => item.pid === pid);
      const qps = result ? result.qps : 0;
      await Publisher.update({qps: Math.round(qps)}, {
        where: {id: pid},
      });
    });
  } catch (e) {
    log.error(`could not update pub qps \n ${e}`)
  }
};
