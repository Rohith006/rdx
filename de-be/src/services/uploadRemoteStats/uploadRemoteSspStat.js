import ch from '../../utils/clickhouse';
import {wlid} from '../../../config/index';

const Publisher = require('../../models/index').publisher;
const moment = require('moment');
const axios = require('axios');
const parseStringPromise = require('xml2js').parseStringPromise;

async function uploadData() {
  try {
    if (!process.env.IDS) {
      return console.error('can\'t convert pubs ids');
    }

    const pubIds = process.env.IDS.split(',');
    const users = await Publisher.findAll({where: {id: pubIds}, attributes: ['id', 'sspStatisticUrl', 'createdAt']});

    for (const user of users) {
      const pub = user.get();
      if (pub.sspStatisticUrl) {
        console.dir(pub);
        let url = pub.sspStatisticUrl;
        const startDate = moment(pub.createdAt).format('YYYY-MM-DD');
        const endDate = moment().subtract(1, 'day').format('YYYY-MM-DD');
        url = url.replace('{START_DATE}', startDate).replace('{END_DATE}', endDate);

        // get stats
        const response = await axios.get(url);

        // parsing xml
        const obj = await parseStringPromise(response.data);

        // generate tsv string
        let strTsv = '';
        obj.stats.breakdown.map((item) => {
          strTsv += `${wlid}\t${pub.id}\t${item.$.date}\t0\t${item.responses[0]}\t${item.impressions[0]}\t${item.revenue[0]}\n`;
        });

        // delete pub rows;
        const deleteRows = `ALTER TABLE dsp.publisher_remote_statistic_local_v1 DELETE WHERE publisherId=${pub.id}`;
        await ch.querying(deleteRows);

        // save to db
        const sql = 'INSERT INTO dsp.publisher_remote_statistic_local_v1 FORMAT TSV';
        const writableStream = ch.query(sql, (err) => {
          if (!err) {
            console.error(err);
          }
          console.log('Insert complete!');
        });

        writableStream.write(strTsv);
        writableStream.end();
      }
    }
  } catch (e) {
    console.error(e);
  }
}

const IS_UPLOADER = process.env.IS_UPLOADER;

if (+IS_UPLOADER === 1) {
  uploadData();
}
