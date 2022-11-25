const ClickHouse = require('@apla/clickhouse');
const {clickhouse} = require('../../config');

const {CH_HOST, CH_PORT, CH_USER, CH_PASSWORD} = clickhouse;

// TODO: drop ch1
const ch = new ClickHouse({
  host: CH_HOST,
  port: CH_PORT,
  user: CH_USER,
  password: CH_PASSWORD,
  dataObjects: true,
});

export default ch;
