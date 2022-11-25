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
const {clickhouse} = require('../../../config');

async function runFreezing() {
  try {
    const {CH_HOST, CH_PORT, CH_USER, CH_PASSWORD} = clickhouse;

    const ch = new ClickHouse({
      host: CH_HOST,
      port: CH_PORT,
      user: CH_USER,
      password: CH_PASSWORD,
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
      const sql = `ALTER TABLE dsp.publisher_statuscode_local_v1 ATTACH PARTITION ('${moment(interval[inc]).format('YYYY-MM-DD')}', '1')`;
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
