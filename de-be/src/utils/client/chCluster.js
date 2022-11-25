const ClickHouse = require('@apla/clickhouse');
const {clickhouseCluster} = require('../../../config');

const chCluster = new ClickHouse({
  host: clickhouseCluster.host,
  port: clickhouseCluster.port,
  user: clickhouseCluster.user,
  password: clickhouseCluster.password,
  dataObjects: true,
});

export default chCluster;
