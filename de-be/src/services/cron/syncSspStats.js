import getStatsToday from '../uploadRemoteStats/uploadRemoteStatToday';
import log from '../../../logger'

const Publisher = require('../../models/index').publisher;

export default async function runTaskUploadSspStatsToday() {
  try {
    let pubs = await Publisher.findAll({where: {}, attributes: ['id', 'sspStatisticUrl']});
    pubs = pubs.map((item) => item.get());

    for (const pub of pubs) {
      if (!pub.sspStatisticUrl || !pub.sspStatisticUrl.includes('{START_DATE}')) {
        continue;
      }
      pub.type = 'publisher';
      await getStatsToday(pub);
    }
  } catch (e) {
    log.error(`getting stats for today \n ${e}`);
  }
}
