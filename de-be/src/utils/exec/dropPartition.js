const dotEnvExpand = require('dotenv-expand');
dotEnvExpand(require('dotenv').config());

require('babel-register')({
  presets: ['env', 'es2015'],
  plugins: ['transform-object-rest-spread'],
});
require('babel-polyfill');

const MomentRange = require('moment-range');
const Moment = require('moment');
const moment = MomentRange.extendMoment(Moment);
const ClickHouse = require('@apla/clickhouse');
const {clickhouseCluster} = require('../../../config');

async function runFreezing() {
  try {
    const ch = new ClickHouse({
      host: clickhouseCluster.host,
      port: clickhouseCluster.port,
      user: clickhouseCluster.user,
      password: clickhouseCluster.password,
      dataObjects: true,
    });
    const startDate = process.env.sd;
    const endDate = process.env.ed;
    if (!startDate || !endDate) {
      return console.error('bad date range');
    }
    const interval = Array.from(moment().range(startDate, endDate).by('day')).map((day) => day.format('YYYY-MM-DD'));
    let inc = 0;
    async function recurcive() {
      console.log(inc, interval[inc]);
      if (inc >= interval.length) {
        return;
      }
      const sql = `ALTER TABLE dsp.bidrequests_counter_sites_advertisers_v6 DROP PARTITION ('${moment(interval[inc]).format('YYYY-MM-DD')}', '12')`;
      const response = await ch.querying(sql);
      console.log(interval[inc], response);
      inc++;
      await recurcive();
    }
    await recurcive();
  } catch (e) {
    console.error(e);
  }
}
runFreezing();
