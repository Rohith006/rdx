import getStatsToday from '../uploadRemoteStats/uploadRemoteStatToday';
import date from '../../utils/date';
import log from '../../../logger'

const Publisher = require('../../models/index').publisher;

export default async function runTaskUploadSspStatsYesterday() {
  try {
    let pubs = await Publisher.findAll({where: {}, attributes: ['id', 'sspStatisticUrl']});
    pubs = pubs.map((item) => item.get());

    for (const pub of pubs) {
      if (!pub.sspStatisticUrl || !pub.sspStatisticUrl.includes('{START_DATE}')) {
        continue;
      }
      pub.date = date.yesterday;
      pub.type = 'publisher';
      await getStatsToday(pub);
    }
  } catch (e) {
    log.error(`uploading SSP stats for yesterday \n ${e}`);
  }
}
