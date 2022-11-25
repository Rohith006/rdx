import {domainName, red, wlid} from '../../config';
import _ from 'lodash';
import crypto from 'crypto';
import forOwn from 'lodash/forOwn';
import SqlString from 'sqlstring';
import {clients} from '../services/clients';
import log from '../../logger'

const {Parser} = require('json2csv');



const SUB_DOMAINS = {
  ADMIN: 'admin',
  ACCOUNT_MANAGER: 'manager',
  ADVERTISER: 'advertiser',
  PUBLISHER: 'publisher',
};

export const getUrl = (protocol, role) => {
  return `${protocol}://${SUB_DOMAINS[role]}.${domainName}`;
};

export const forEach= async (array, callback) => {
  if (!array) return;

  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

export const asyncForEach= async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

export const splitArrayByChunk = (array, chunkSize) => {
  if (chunkSize >= array.length) {
    return [array];
  }
  return [].concat.apply([], array.map(function(elem, i) {
    return i % chunkSize ? [] : [array.slice(i, i + chunkSize)];
  }));
};

export const isNumber = new RegExp('^[0-9]+$');

export const validateBeforeRedis = (data) => {
  Object.keys(data).forEach((key) => {
    data[key] === null ? data[key] = 'null' : data[key];
    _.isArray(data[key]) && (data[key] = data[key].toString());
  });
};

export const randomString = (length) => {
  if (!Number.isInteger(length)) {
    throw new TypeError('Wrong type. Expected a number');
  }
  return crypto.randomBytes(Math.ceil((length * 3) / 4)).toString('hex').slice(0, length);
};

export const generateSqlWhere = (filters) => {
  let where = '';
  forOwn(filters, (value, key) => {
    if (!value.length) {
      return;
    }
    switch (key) {
      case 'selectedAdvertiser': {
        where += ` and advertiserId in(${SqlString.escape(filters.selectedAdvertiser)})`;
        break;
      }
      case 'selectedPublisher': {
        where += ` and publisherId in(${SqlString.escape(filters.selectedPublisher)})`;
        break;
      }
      case 'selectedCampaign': {
        where += ` and campaignId in (${SqlString.escape(filters.selectedCampaign)})`;
        break;
      }
      case 'selectedAdType': {
        where += ` and adType in(${SqlString.escape(filters.selectedAdType)})`;
        break;
      }
      case 'selectedInventoryType': {
        where += ` and inventoryType in(${SqlString.escape(filters.selectedInventoryType)})`;
        break;
      }
      case 'selectedBidType': {
        where += ` and paymentModel in(${SqlString.escape(filters.selectedBidType)})`;
        break;
      }
      case 'selectedProtocolType': {
        where += ` and protocol in(${SqlString.escape(filters.selectedProtocolType)})`;
        break;
      }
    }
  });
  return where;
};

export const parseQueryParams = (req) => {
  const {
    keys, selectedProtocolType,
    selectedAdType, selectedInventoryType,
    selectedBidType, selectedPublisher,
    selectedAdvertiser,
    selectedCampaign,
  } = req.query;
  if (selectedPublisher) {
    req.query.selectedPublisher = JSON.parse(selectedPublisher);
  }
  if (selectedAdvertiser) {
    req.query.selectedAdvertiser = JSON.parse(selectedAdvertiser);
  }
  if (selectedCampaign) {
    req.query.selectedCampaign = JSON.parse(selectedCampaign);
  }
  if (selectedProtocolType) {
    req.query.selectedProtocolType = JSON.parse(selectedProtocolType);
  }
  if (selectedAdType) {
    req.query.selectedAdType = JSON.parse(selectedAdType);
  }
  if (selectedInventoryType) {
    req.query.selectedInventoryType = JSON.parse(selectedInventoryType);
  }
  if (selectedBidType) {
    req.query.selectedBidType = JSON.parse(selectedBidType);
  }
  if (keys) {
    req.query.keys = JSON.parse(keys);
  }
};

export const getRtbFormat = async (entity, eid) => {
  let data = {bidrequest: null, bidresponse: null};

  const cacheData = await clients.redisClientTraff.lrangeAsync(`${entity}_requests:${wlid}:${eid}`, 0, -1);
  if (cacheData) {
    const arr = [];
    cacheData.map((d) => arr.push(JSON.parse(d)));
    data = arr.filter((d) => d.status_code === 200);
    if (!data.length) {
      data = arr.filter((d) => d.status_code === 204);
    }
    if (data && data[0]) {
      data = {
        bidrequest: data[0].request_url ? {url: data[0].request_url} : JSON.parse(data[0].request),
        bidresponse: data[0].response ? JSON.parse(data[0].response) : null,
      };
    }
  }
  return data;
};

export const js2csv = (data) => {
  const fields = ['field1', 'field2', 'field3'];
  const opts = {fields};

  try {
    const parser = new Parser();
    // console.log(csv);
    return parser.parse(data);
  } catch (err) {
    console.error(err);
  }
};

export const errorLog = (text) => {
  log.error(text)
  console.error(`${red}${text}`);
};
