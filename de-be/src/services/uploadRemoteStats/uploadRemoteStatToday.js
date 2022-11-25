const util = require('util');
const moment = require('moment');
const axios = require('axios');
const https = require('https');

import {json10ToTSV, xml1ToTSV} from '../../utils/feeds';
import chCluster from '../../utils/client/chCluster';
import {isProduction, wlid} from '../../../config';
import {errorLog} from '../../utils/common';

import log from '../../../logger'

const instance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
});

export default async function getStatsToday(entity) {
  try {
    if (entity.sspStatisticUrl) {
      let today = entity.date || moment().format('YYYY-MM-DD');
      let repUrl1 = entity.sspStatisticUrl;
      if (repUrl1.includes('login.jordanobruno.live/xmlstats.php')) {
        today = moment(today).format('YYYYMMDD');
      }
      repUrl1 = repUrl1.replace('{START_DATE}', today).replace('{END_DATE}', today);

      let response;

      // get stats
      const config = {
        method: 'GET',
        url: repUrl1,
      };

      response = await instance.get(encodeURI(repUrl1), config);

      if (!response.data) {
        const today = moment().format('YYYYMMDD');
        const repUrl2 = entity.sspStatisticUrl.replace('{START_DATE}', today).replace('{END_DATE}', today);
        response = await instance.get(encodeURI(repUrl2));
      }

      log.debug(response.data);

      // get content type
      const contentType = response.headers['content-type'];
      // parse response.data xml or json
      let tsv = null;
      if (contentType.includes('xml')) {
        tsv = await xml1ToTSV(entity, response.data);
      } else if (contentType.includes('json') || contentType.includes('text') || response.config.url.includes('mmrtb.com')) {
        tsv = await json10ToTSV(entity, response.data, today);
      }

      if (!tsv) {
        log.error(`error parsing to entity ${entity.type} ${entity.id}, can't find field date`);
        return;
      }

      if (isProduction) {
        // delete current entity stat row;
        let delSql = '';
        switch (entity.type) {
          case 'publisher': {
            delSql = `ALTER TABLE dsp.publisher_remote_statistic_local_v1 DELETE WHERE publisherId=${entity.id} and createdDate='${moment(today).format('YYYY-MM-DD')}' and wlid='${wlid}'`;
            break;
          }
        }
        await chCluster.querying(delSql);
      }
    }
  } catch (e) {
    errorLog(`${entity.type}:${entity.id} ${e}`);
  }
}
