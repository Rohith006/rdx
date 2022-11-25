import _ from 'lodash';
import numeral from 'numeral';
import date from '../utils/date';
import {wlid} from '../../config';

const parseStringPromise = require('xml2js').parseStringPromise;

const isYYYYMMDD = RegExp(/^[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]/);

export async function xml1ToTSV(entity, data) {
  const obj = await parseStringPromise(data, {explicitArray: false});
  // console.info(JSON.stringify(obj));

  // generate tsv string
  let strTsv = '';
  if (obj.stats && obj.stats.breakdown && obj.stats.breakdown.$.date) {
    if (_.isArray(obj.stats.breakdown)) {
      obj.stats.breakdown.map((item) => {
        strTsv += concatStrTsv(item, entity);
      });
    } else {
      const item = obj.stats.breakdown;
      item.date = obj.stats.breakdown.$.date;
      strTsv += concatStrTsv(item, entity);
    }
  } else if (obj.response && obj.response.result) {
    if (_.isArray(obj.response.result)) {
      obj.response.result.record.map((i) => {
        if (isYYYYMMDD.test(i.name)) {
          strTsv += concatStrTsv(i, entity);
        }
      });
    } else {
      strTsv += concatStrTsv(obj.response.result.record, entity);
    }
  } else if (obj.report && obj.report.dataList) {
    const arr = obj.report.dataList.data;
    if (_.isArray(arr)) {
      arr.map((item) => {
        if (isYYYYMMDD.test(item.date)) {
          strTsv += concatStrTsv(item, entity);
        }
      });
    } else {
      strTsv += concatStrTsv(arr, entity);
    }
  } else if (obj.results && obj.results.record) {
    const arr = obj.results.record;
    if (_.isArray(arr)) {
      arr.map((item) => {
        if (isYYYYMMDD.test(item.date)) {
          strTsv += concatStrTsv(item, entity);
        }
      });
    } else {
      strTsv += concatStrTsv(arr, entity);
    }
  }
  console.info(strTsv);
  return strTsv;
}

export async function json10ToTSV(entity, data, startDate) {
  const keys = Object.keys(data);
  const key = `${startDate} - ${startDate}`;
  // console.info(JSON.stringify(data));

  // generate tsv string
  let strTsv = '';
  if (_.isArray(data.data)) {
    data.data.map((item) => {
      strTsv += concatStrTsv(item, entity);
    });
  } else if (_.isArray(data.stats)) {
    data.stats.map((item) => {
      strTsv += concatStrTsv(item, entity);
    });
  } else if (_.isArray(data)) {
    data.map((item) => {
      strTsv += concatStrTsv(item, entity);
    });
  } else if (_.isObject(data) && data[key]) {
    if (data[key]) {
      const stat = Object.values(data[key])[0];
      if (stat) {
        const item = stat;
        item.date = startDate;
        strTsv += concatStrTsv(item, entity);
      }
    }
  } else if (keys[0] === startDate) {
    keys.map((item) => {
      strTsv += `${wlid}\t${entity.id}\t${item}\t${data[item].spend || data[item].revenue || 0}\t${data[item].impressions || 0}\t0\t${data[item].responses || 0}\t0\t${entity.advertiserId}\n`;
    });
  } else if (_.isArray(data.body)) {
    data.body.map((item) => {
      strTsv += concatStrTsv(item, entity);
    });
  } else if (data.stat) {
    const item = data.stat;
    strTsv += concatStrTsv(item, entity);
  } else if (_.isObject(data) && data.result && _.isArray(data.result)) {
    const item = data.result[0];
    strTsv += concatStrTsv(item, entity);
  } else if (_.isObject(data) && data.response && _.isArray(data.response)) {
    const item = data.response[0];
    strTsv += concatStrTsv(item, entity);
  } else if (_.isObject(data) && data.response && data.response.result && data.response.result.PID) {
    const item = data.response.result.PID;
    strTsv += concatStrTsv(item, entity);
  } else if (_.isObject(data) && data.rows && data.rows.length) {
    data.rows.map((item) => {
      strTsv += concatStrTsv(item, entity);
    });
  } else if (_.isObject(data) && data.items && _.isArray(data.items)) {
    data.items.map((item) => {
      strTsv += concatStrTsv(item, entity);
    });
  } else if (_.isObject(data) && data.response && _.isArray(data.response.rows)) {
    data.response.rows.map((item) => {
      strTsv += concatStrTsv(item, entity);
    });
  } else if (_.isObject(data) && data.data && _.isArray(data.data.details)) {
    data.data.details.map((item) => {
      strTsv += concatStrTsv(item, entity);
    });
  } else if (_.isObject(data) && data.results && _.isArray(data.results)) {
    data.results.map((item) => {
      strTsv += concatStrTsv(item, entity);
    });
  } else {
    return null;
  }
  console.info(strTsv);
  return strTsv;
}

function concatStrTsv(item, entity) {
  if (!item) {
    return '';
  }
  const obj = {
    wlid,
    entityId: entity.id,
    date: item.date || item.DATE ||item.RequestDate || item.startDate || item.period ||item.time || item.name ||
      item.ts_title || item.date_label || item.stat_date || item.day || item.ddate,
    revenue: item.spend || item.net_revenue || item.revenue || item.payout || item.pay || item.earning || item.Revenue ||
      item.price || item.money || item.cost || item.PUB_PAYOUT || item.GROSS_REVENUE || item.earn ||
      item.publisher_profit || item.amt_omoney || item.net || item.earnings || item.wages || item.revshare || item.paid || 0,
    impressions: item.impressions || item.wins || item.impression || item.hits || item.Impressions ||
      item.IMPRESSIONS || item.estimated_impressions || item.shows || 0,
    requests: item.requests || item.cnt_request || 0,
    responses: item.responses || item.bids || 0,
    clicks: item.net_clicks || item.clicks || item.accepted_clicks || 0,
    advertiserId: entity.advertiserId || 0,
  };
  if (!obj.date) {
    return '';
  }
  obj.date = date.formatYYYYMMDD(obj.date);
  obj.revenue = numeral(obj.revenue).format('0.0000');
  obj.impressions = numeral(obj.impressions).format('0');
  obj.requests = numeral(obj.requests).format('0');
  obj.responses = numeral(obj.responses).format('0');
  obj.clicks = numeral(obj.clicks).format('0');

  let str;
  switch (entity.type) {
    case 'publisher': {
      str = `${obj.wlid}\t${obj.entityId}\t${obj.date}\t${obj.revenue}\t${obj.impressions}\t${obj.requests}\t${obj.responses}\t${obj.clicks}\n`;
      break;
    }
    default: break;
  }
  return str;
}
