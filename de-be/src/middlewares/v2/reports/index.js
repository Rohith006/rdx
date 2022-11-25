import Moment from 'moment';
import {wlid} from '../../../../config';
import {
    advertiser as Advertiser,
    campaign as Campaign,
    creative as Creative,
    inventory as Inventory,
    publisher as Publisher,
    Sequelize,
    sequelize,
} from '../../../models';
import {
    getConversionsClicksSql,
    getGoalsClicksSql,
    getReportsAdvertiserSql,
    getReportsAppsCSVSql,
    getReportsAppsPubSql2,
    getReportsAppsSql2,
    getReportsCampaignSql,
    getReportsClicksSql,
    getReportsCountryPubSql,
    getReportsCountrySql,
    getReportsCreativesSizes2,
    getReportsDailyAccountManagerSql,
    getReportsDailyAdminSql,
    getReportsDailyPubSql,
    getReportsHourlyAdminSql,
    getReportsImpressionsSql,
    getReportsOsSql2,
    getReportsPublisherErrorSql,
    getReportsPublisherSql,
    getReportsPubNoMatchSql,
    getReportsSitesPubSql2,
    getReportsSitesSql2,
    getReportsSubIdPubSql2,
    getReportsSubIdSql2,
} from '../../../utils/clickhouseQq2';

import {REMOVED} from '../../../constants/campaign';
import {permissions, roles} from '../../../constants/user';
import chCluster from '../../../utils/client/chCluster';
import {parseQueryParams} from '../../../utils/common';
import log from '../../../../logger';

const MomentRange = require('moment-range');

const moment = MomentRange.extendMoment(Moment);
const Op = Sequelize.Op;

export const loadDaily2 = async (req, res) => {
  try {
    const {startDate, endDate, keys, selectedPublisher, selectedAdvertiser, switcherStatus} = req.query;
    parseQueryParams(req);
    const {role, id, permissions} = req.user;

    let pubs = [];
    let pubsIds = [];
    let advertiserIds = [];

    const dateRange = Array.from(moment().range(startDate, endDate).by('day')).map((day) => ({
      day: day.format('YYYY-MM-DD'),
    }));

    const filters = {...req.query};

    const campaignOptions = {attributes: ['id', 'campaignName']};
    const publisherOptions = {attributes: ['id', 'name']};

    if (role === roles.ACCOUNT_MANAGER) {
      const managerAdvertisers = await Advertiser.findAll({
        where: {managerId: req.user.id},
        attributes: ['id'],
      });

      advertiserIds = managerAdvertisers.map((item) => item.get().id);

      campaignOptions.where = {advertiserId: advertiserIds};
      publisherOptions.where = {managerId: id};
    }

    if ((keys && keys.length && keys.includes('publisher')) || role === roles.ACCOUNT_MANAGER) {
      if (selectedPublisher) {
        publisherOptions.where = {...publisherOptions.where, id: filters.selectedPublisher};
      }
      pubs = await Publisher.findAll(publisherOptions);
      pubs = pubs.map((item) => item.get());
      pubsIds = pubs.map((item) => item.id).sort((a, b) => a - b);
    }

    const range = dateRange.map((item) => `'${item.day}'`);

    let response;
    let responseCount;
    switch (role) {
      case roles.PUBLISHER:
        filters.selectedPublisher = [id];
        response = await chCluster.querying(getReportsDailyPubSql(filters, range)[0]);
        responseCount = await chCluster.querying(getReportsDailyPubSql(filters, range)[1]);
        break;
      case roles.ADVERTISER:
        filters.selectedAdvertiser = [id];
        response = await chCluster.querying(getReportsDailyAdminSql(filters, range, null, null, role)[0]);
        responseCount = await chCluster.querying(getReportsDailyAdminSql(filters, range, null, null)[1]);
        break;
      case roles.ADMIN:
        response = await chCluster.querying(getReportsDailyAdminSql(filters, range, pubsIds)[0]);
        responseCount = await chCluster.querying(getReportsDailyAdminSql(filters, range, pubsIds)[1]);
        break;
      case roles.ACCOUNT_MANAGER:
        if (switcherStatus === 'PERFORMANCE') {
          const campaigns = await Campaign.findAll(campaignOptions);
          const campaignIds = campaigns.map((item) => item.get().id).sort((a, b) => a - b);

          filters.selectedAdvertiser = req.query.selectedAdvertiser || advertiserIds;
          filters.selectedCampaign = req.query.selectedCampaign || campaignIds;
        }

        if (permissions.includes('ADVERTISERS')) {
          if (permissions.includes('PUBLISHERS') && req.query.selectedPublisher) {
            filters.selectedPublisher = req.query.selectedPublisher;
          }

          pubsIds = []; // ignore get stats by publisher
        }

        if (permissions.includes('PUBLISHERS') && !permissions.includes('ADVERTISERS')) {
          delete filters.selectedAdvertiser;
          delete filters.selectedCampaign;

          filters.selectedPublisher = req.query.selectedPublisher || pubsIds;
        }

        if (!keys) {
          pubsIds = [];
        }
        const query = getReportsDailyAccountManagerSql(filters, range, pubsIds);
        response = await chCluster.querying(query[0]);
        responseCount = await chCluster.querying(query[1]);
        break;
    }

    let {data} = response;
    data = data.map((item) => {
      item.revenue = Number(item.revenue.toFixed(2));
      item.payout = Number(item.payout.toFixed(2));
      item.profit = Number(item.profit.toFixed(2));
      if (item.pid) {
        const pub = pubs.find((p) => p.id === item.pid);
        if (pub) {
          item.publisher = `(${item.pid}) ${pub.companyName || pub.name}`;
        }
      }
      if (role === roles.ADVERTISER) {
        delete item.profit;
        delete item.payout;
        item.spends = item.revenue;
        delete item.revenue;
      }
      if (role === roles.PUBLISHER) {
        delete item.profit;
        delete item.revenue;
      }
      if (role === roles.ACCOUNT_MANAGER) {
        if (!permissions.includes('ADVERTISERS')) {
          delete item.revenue;
          delete item.eCPM;
          delete item.profit;
        }
        if (!permissions.includes('PUBLISHERS')) {
          delete item.payout;
          delete item.profit;
          delete item.pid;
        }
        if (!permissions.includes('SEE_PROFIT')) {
          delete item.profit;
        }
      }
      return item;
    });
    res.send({data, count: +responseCount.data[0].count});
  } catch (e) {
    //next({err, mesg:"});
    log.error(`loading daily reports \n ${e}`);
    res.sendStatus(500);
  }
};

export const loadHourly2 = async (req, res) => {
  try {
    const {date, keys, selectedPublisher, selectedAdvertiser} = req.query;
    parseQueryParams(req);
    let pubs = [];
    let pubsIds = [];

    if (keys && keys.length) {
      if (keys.includes('publisher')) {
        if (selectedPublisher) {
          pubs = await Publisher.findAll({where: {id: req.query.selectedPublisher}, attributes: ['id', 'name']});
        } else {
          pubs = await Publisher.findAll({attributes: ['id', 'name']});
        }
        pubs = pubs.map((item) => item.get());
        pubsIds = pubs.map((item) => item.id).sort((a, b) => a - b);
      }

    }

    let count;
    if (pubsIds.length) {
      count = pubsIds.length * 24;
    } else {
      count = 24;
    }

    let response;
    const {role, id, permissions} = req.user;

    switch (role) {
      case roles.PUBLISHER:
        // response = await chCluster.querying(getReportsDailySql(item.day, item.day, keys, `and publisherId=${id}`, req.query));
        response.data = [];
        break;
      case roles.ADVERTISER:
        // response = await chCluster.querying(getReportsDailyAdvertiserSql(item.day, item.day, keys, `and advertiserId=${id}`, req.query, id));
        response.data = [];
        break;
      case roles.ADMIN:
      case roles.ACCOUNT_MANAGER:
        response = await chCluster.querying(getReportsHourlyAdminSql(req.query, [], pubsIds));
        break;
    }

    let {data} = response;
    data = data.map((item) => {
      item.revenue = Number(item.revenue.toFixed(2));
      item.payout = Number(item.payout.toFixed(2));
      item.profit = Number(item.profit.toFixed(2));
      item.h = item.hour < 10 ? `${date} 0${item.hour}:00:00` : `${date} ${item.hour}:00:00`;
      if (item.pid) {
        const pub = pubs.find((p) => p.id === item.pid);
        item.publisher = `(${item.pid}) ${pub.companyName || pub.name}`;
      }
      if (role === roles.ACCOUNT_MANAGER) {
        !permissions.includes('ADVERTISERS') && delete item.revenue;
        !permissions.includes('PUBLISHERS') && delete item.payout;
        !permissions.includes('SEE_PROFIT') && delete item.profit;
      }
      return item;
    });
    res.send({data, count});
  } catch (e) {
    log.error(`loading hourly reports \n ${e}`);
    res.sendStatus(500);
  }
};

export const loadCampaigns2 = async (req, res) => {
  try {
    const {startDate, endDate, keys} = req.query;
    const {role, id, permissions} = req.user;
    let sql;
    parseQueryParams(req);

    let campaigns = [];

    switch (role) {
      case roles.ADVERTISER:
        if (!req.query.selectedCampaign) {
          campaigns = await Campaign.findAll({where: {advertiserId: id}});
          req.query.selectedCampaign = campaigns.map((c) => c.id);
        }else{
          campaigns = await Campaign.findAll({where: {id: req.query.selectedCampaign}});
        }
        req.query.selectedAdvertiser = [id];
        sql = getReportsCampaignSql(startDate, endDate, req.user, req.query, keys);
        break;
      case roles.ACCOUNT_MANAGER:
        const where = {};

        if (req.user.permissions.includes('ADVERTISERS')) {
          const managerAdvertisers = await Advertiser.findAll({
            where: {managerId: req.user.id},
            attributes: ['id'],
          });

          where.advertiserId = managerAdvertisers.map((item) => item.get().id);
        }

        campaigns = await Campaign.findAll({
          where,
          attributes: ['campaignName', 'id', 'advertiserId'],
          include: [{model: Inventory, attributes: ['publisherId']}],
        });

        const campaignIds = campaigns.map((c) => c.id);

        sql = getReportsCampaignSql(startDate, endDate, req.user, req.query, keys, campaignIds);

        break;
      default:
        campaigns = await Campaign.findAll({
          attributes: ['campaignName', 'id', 'advertiserId'],
          include: [{model: Inventory, attributes: ['publisherId']}],
        });
        sql = getReportsCampaignSql(startDate, endDate, req.user, req.query, keys);
        break;
    }

    const {statisticsQuery, countQuery} = sql;

    // run queries
    const statistics = await chCluster.querying(statisticsQuery);
    const responseCount = await chCluster.querying(countQuery);
    const count = +responseCount.data[0].count;

    let data = [];
    if (statistics.data && statistics.data.length) {
      data = statistics.data.map((el) => {
        el.revenue = Number(el.revenue.toFixed(2));
        el.profit = Number(el.profit.toFixed(2));
        el.payout = Number(el.payout.toFixed(2));
        const item = campaigns.find((c) => c.id === el.id);
        if (item) {
          if (role === roles.ADVERTISER) {
            delete el.profit;
            delete el.payout;
            delete el.approvedPayout;
            el.spends = el.revenue;
            delete el.revenue;
          }
          if (role === roles.ACCOUNT_MANAGER) {
            if (!permissions.includes('ADVERTISERS')) {
              delete el.revenue;
              delete el.eCPM;
              delete el.profit;
            }
            if (!permissions.includes('PUBLISHERS')) {
              delete el.payout;
              delete el.approvedPayout;
              delete el.perApprovedPayout;
              delete el.profit;
            }
            if (!permissions.includes('SEE_PROFIT')) {
              delete el.profit;
            }
          }
          return {
            ...el,
            ...{
              name: `(${item.id}) ${item.campaignName}`,
              advertiserId: item.advertiserId,
              publishers: item.inventories ? item.inventories.length : 0,
            },
          };
        }
        // return el;
        return null;
      }).filter((item) => item !== null);
    }

    res.send({data, count});
  } catch (e) {
    log.error(`loading campaigns \n ${e.stack}`);
    res.sendStatus(500);
  }
};

export const loadPublishers2 = async (req, res) => {
  try {
    const {startDate, endDate, keys} = req.query;
    const {id, role, permissions} = req.user;
    parseQueryParams(req);

    let publishers = []; let publisherIds = [];

    if (role === roles.ACCOUNT_MANAGER) {
      publishers = await Publisher.findAll({where: {managerId: id}, attributes: ['name', 'id']});
      publisherIds = publishers.map((p) => p.id);
    } else {
      publishers = await Publisher.findAll({attributes: ['name', 'id']});
    }

    const {statisticsQuery, countQuery} = getReportsPublisherSql(startDate, endDate, req.query, publisherIds);

    // run queries
    const statistics = await chCluster.querying(statisticsQuery);
    const responseCount = await chCluster.querying(countQuery);
    const count = +responseCount.data[0].count;

    let data = [];
    if (statistics.data.length) {
      data = statistics.data.map((el) => {
        el.revenue = Number(el.revenue.toFixed(2));
        el.payout = Number(el.payout.toFixed(2));
        el.profit = Number(el.profit.toFixed(2));
        const item = publishers.find((pub) => pub.id === el.id);
        if (item) {
          if (role === roles.ACCOUNT_MANAGER) {
            if (!permissions.includes('ADVERTISERS')) {
              delete el.revenue;
              delete el.remoteRevenue;
              delete el.eCPM;
              delete el.profit;
            }
            if (!permissions.includes('PUBLISHERS')) {
              delete el.payout;
              delete el.payoutNet;
              delete el.profit;
            }
            if (!permissions.includes('SEE_PROFIT')) {
              delete el.profit;
            }
          }
          return {
            ...el,
            name: `(${item.id}) ${item.name}`,
          };
        }
        // return el;
        return null;
      }).filter((item) => item !== null);
    }

    res.send({data, count});
  } catch (e) {
    log.error(`loading publisher \n ${e}`);
    res.sendStatus(500);
  }
};

export const loadAdvertisers2 = async (req, res) => {
  try {
    const {startDate, endDate} = req.query;

    const {id, role, permissions} = req.user;

    parseQueryParams(req);

    let advertisers = []; let advertiserIds = [];

    if (role === roles.ACCOUNT_MANAGER) {
      advertisers = await Advertiser.findAll({where: {managerId: id}, attributes: ['name', 'id']});
      advertiserIds = advertisers.map((p) => p.id);
    } else {
      advertisers = await Advertiser.findAll({attributes: ['name', 'id']});
    }

    const {statisticsQuery, countQuery} = getReportsAdvertiserSql(startDate, endDate, req.query, advertiserIds);
    // run queries
    const statistics = await chCluster.querying(statisticsQuery);
    const responseCount = await chCluster.querying(countQuery);
    const count = +responseCount.data[0].count;

    let data = [];
    if (statistics.data.length) {
      data = statistics.data.map((el) => {
        el.revenue = Number(el.revenue.toFixed(2));
        el.profit = Number(el.profit.toFixed(2));
        el.payout = Number(el.payout.toFixed(2));
        const item = advertisers.find((adv) => adv.id === el.id);
        if (item) {
          if (role === roles.ACCOUNT_MANAGER) {
            if (!permissions.includes('ADVERTISERS')) {
              delete el.revenue;
              delete el.revenueNet;
              delete el.eCPM;
              delete el.profit;
            }
            if (!permissions.includes('PUBLISHERS')) {
              delete el.payout;
              delete el.profit;
            }
            if (!permissions.includes('SEE_PROFIT')) {
              delete el.profit;
            }
          }

          return {...el, ...item.get()};
        }
        return null;
      }).filter((item) => item !== null);
    }
    data = data.map((el) => {
      const {rejectedImpressions, impressions} = el;
      let rejectedImpressionsResult = rejectedImpressions / impressions * 100;
      let newItem;
      if (rejectedImpressionsResult) {
        rejectedImpressionsResult = rejectedImpressionsResult.toFixed(1);
        newItem = `${rejectedImpressions} / ${rejectedImpressionsResult}%`;
      } else {
        newItem = `${rejectedImpressions} / 0%`;
      }
      return {...el, rejectedImpressions: newItem};
    });
    res.send({data, count});
  } catch (e) {
    log.error(`loading advertiser \n ${e.stack}`);
    res.sendStatus(500);
  }
};

export const loadPublisherErrorsRtb2 = async (req, res) => {
  try {
    const {startDate, endDate, offset, limit, selectedPublisher} = req.query;
    const {id, role, permissions} = req.user;
    const wherePostgres = {status: {[Op.ne]: REMOVED}, protocolType: 'oRTB'};
    if (selectedPublisher && JSON.parse(selectedPublisher).length) {
      wherePostgres.id = JSON.parse(selectedPublisher);
    }
    if (role === roles.PUBLISHER) {
      wherePostgres.id = id;
    } else if (role === roles.ACCOUNT_MANAGER) {
      wherePostgres.managerId = id;
    }
    const pubs = await Publisher.findAll({
      order: [['id', 'DESC']],
      where: wherePostgres,
      attributes: ['id', 'name', 'status'],
      offset,
      limit,
    });

    if ((role === roles.ACCOUNT_MANAGER && !permissions.includes('PUBLISHERS')) || !pubs.length) {
      return res.send({
        data: [],
        count: 0,
      });
    }

    const publisherIds = pubs.map((p) => p.get().id);

    req.query.selectedPublisher = JSON.stringify(publisherIds);
    parseQueryParams(req);

    const count = publisherIds.length;

    const sql = getReportsPublisherErrorSql(startDate, endDate, req.query);

    const dbresponse = await chCluster.querying(sql);
    const pubIds = await sequelize.query('select "publisherId" from inventories');
    dbresponse.data.map((item) => {
      pubs.map((pub) => {
        const data = pub.get();
        if (data.id === item.id) {
          item.name = `(${data.id}) ${data.name}`;
          item.status = data.status;
        }
      });
    });

    const data = dbresponse.data.filter((el) => pubs.find((p) => p.id === el.id));

    res.send({
      data,
      count: role === roles.PUBLISHER ? undefined : count,
    });
  } catch (e) {
    log.error(`loading publisher error \n ${e}`);
    res.sendStatus(500);
  }
};

export const loadPublisherErrorsXml2 = async (req, res) => {
  try {
    const {startDate, endDate, offset, limit, selectedPublisher} = req.query;
    const {id, role, permissions} = req.user;
    const wherePostgres = {status: {[Op.ne]: REMOVED}, protocolType: {[Op.ne]: 'oRTB'}};
    if (selectedPublisher && JSON.parse(selectedPublisher).length) {
      wherePostgres.id = JSON.parse(selectedPublisher);
    }
    if (role === roles.PUBLISHER) {
      wherePostgres.id = id;
    } else if (role === roles.ACCOUNT_MANAGER) {
      wherePostgres.managerId = id;
    }

    const pubs = await Publisher.findAll({
      order: [['id', 'DESC']],
      where: wherePostgres,
      attributes: ['id', 'name', 'status'],
      offset,
      limit,
    });
    if ((role === roles.ACCOUNT_MANAGER && !permissions.includes('PUBLISHERS')) || !pubs.length) {
      return res.send({
        data: [],
        count: 0,
      });
    }

    const publisherIds = pubs.map((p) => p.get().id);

    req.query.selectedPublisher = JSON.stringify(publisherIds);

    parseQueryParams(req);

    const count = publisherIds.length;

    const sql = getReportsPublisherErrorSql(startDate, endDate, req.query);
    const dbresponse = await chCluster.querying(sql);
    dbresponse.data.map((item) => {
      pubs.map((pub) => {
        const data = pub.get();
        if (data.id === item.id) {
          item.name = `(${data.id}) ${data.name}`;
          item.status = data.status;
        }
      });
    });

    const data = dbresponse.data.filter((el) => pubs.find((p) => p.id === el.id));

    res.send({
      data,
      count: role === roles.PUBLISHER ? undefined : count,
    });
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
};

export const loadNoMatchStats2 = async (req, res) => {
  try {
    const {reportsType, selectedPublisher, selectedAdvertiser, switcherStatus} = req.query;
    parseQueryParams(req);
    const {role, id, permissions} = req.user;

    let advertiserIds = [];

    const filters = {...req.query};

    const campaignOptions = {attributes: ['id', 'campaignName']};
    const publisherOptions = {attributes: ['id', 'name']};

    if (role === roles.ACCOUNT_MANAGER) {
      if (!permissions.includes('ADVERTISERS') || !permissions.includes('PUBLISHERS')) {
        res.send({data: [], count: 0});
        return;
      }

      const managerAdvertisers = await Advertiser.findAll({
        where: {managerId: req.user.id},
        attributes: ['id'],
      });

      advertiserIds = managerAdvertisers.map((item) => item.get().id);

      campaignOptions.where = {advertiserId: advertiserIds};
      publisherOptions.where = {managerId: id};
    }

    const campaigns = await Campaign.findAll(campaignOptions);
    const campaignIds = campaigns.map((item) => item.get().id).sort((a, b) => a - b);

    if (selectedPublisher) {
      publisherOptions.where = {...publisherOptions.where, id: JSON.parse(req.query.selectedPublisher)};
    }
    const pubs = await Publisher.findAll(publisherOptions);
    const pubsIds = pubs.map((item) => item.get().id).sort((a, b) => a - b);

    if (role === roles.ACCOUNT_MANAGER) {
      filters.selectedAdvertiser = req.query.selectedAdvertiser || advertiserIds;
      filters.selectedCampaign = req.query.selectedCampaign || campaignIds;
      filters.selectedPublisher = req.query.selectedPublisher || pubsIds;
    }

    const reportsPubNoMatchSql = getReportsPubNoMatchSql(filters);

    let {data} = await chCluster.querying(reportsPubNoMatchSql[0]);
    data = data.map((item) => {
      const {pid, cid} = item;
      if (pid) {
        const pub = pubs.find((item) => item.id === pid);
        item.publisher = `(${pid}) ${pub ? pub.companyName || pub.name : ''}`;
      }
      if (cid) {
        const c = campaigns.find((item) => item.id === cid);
        item.campaign = `(${cid}) ${c ? c.campaignName : ''}`;
      }
      item.geos = item.geo;
      item.sizes = item.size;
      delete item.size;
      delete item.geo;
      return item;
    });
    const counter = await chCluster.querying(reportsPubNoMatchSql[1]);
    res.send({data, count: Number(counter.data[0].count)});
  } catch (e) {
    log.error(`loading no match stats reports \n ${e}`);
    res.sendStatus(500);
  }
};

export const loadCountry2 = async (req, res) => {
  try {
    const {startDate, endDate, offset, limit} = req.query;
    const {role, id} = req.user;
    let response;
    let responseCount;
    parseQueryParams(req);
    switch (role) {
      case 'PUBLISHER':
        req.query.selectedPublisher = [id];
        response = await chCluster.querying(getReportsCountryPubSql(startDate, endDate, limit, offset, req.query)[0]);
        responseCount = await chCluster.querying(getReportsCountryPubSql(startDate, endDate, limit, offset, req.query)[1]);
        break;
      case 'ADVERTISER':
        req.query.selectedAdvertiser = [id];
        response = await chCluster.querying(getReportsCountrySql(startDate, endDate, limit, offset, req.query, req.user.role, req.user.id)[0]);
        responseCount = await chCluster.querying(getReportsCountrySql(startDate, endDate, limit, offset, req.query, req.user.role, req.user.id)[1]);
        break;
      case 'ADMIN':
        response = await chCluster.querying(getReportsCountrySql(startDate, endDate, limit, offset, req.query, req.user.role, req.user.id)[0]);
        responseCount = await chCluster.querying(getReportsCountrySql(startDate, endDate, limit, offset, req.query, req.user.role, req.user.id)[1]);
        break;
    }
    let {data} = response;
    data = data.map((item) => {
      item.revenue = Number(item.revenue.toFixed(2));
      item.payout = Number(item.payout.toFixed(2));
      item.profit = Number(item.profit.toFixed(2));
      if (role === roles.ADVERTISER) {
        delete item.profit;
        delete item.payout;
        item.spends = item.revenue;
        delete item.revenue;
      }
      if (role === roles.PUBLISHER) {
        delete item.profit;
        delete item.revenue;
      }
      return item;
    });
    res.send({data, count: Number(responseCount.data[0].count)});
  } catch (e) {
    log.error(`loading country reports \n ${e}`);
    res.sendStatus(500);
  }
};

export const loadSubId2 = async (req, res) => {
  try {
    const {startDate, endDate, selectedPublisher, selectedAdvertiser, keys} = req.query;
    const {role, id} = req.user;
    parseQueryParams(req);

    let pubs = [];

    if (keys && keys.length) {
      if (keys.includes('publisher')) {
        if (selectedPublisher) {
          pubs = await Publisher.findAll({where: {id: req.query.selectedPublisher}, attributes: ['id', 'name']});
        } else {
          pubs = await Publisher.findAll({attributes: ['id', 'name']});
        }
        pubs = pubs.map((item) => item.get());
      }

    }

    let response;
    let responseCount;
    switch (role) {
      case roles.PUBLISHER:
        req.query.selectedPublisher = [id];
        response = await chCluster.querying(getReportsSubIdPubSql2(startDate, endDate, req.query)[0]);
        responseCount = await chCluster.querying(getReportsSubIdPubSql2(startDate, endDate, req.query)[1]);
        break;
      case roles.ADVERTISER:
        req.query.selectedAdvertiser = [id];
        response = await chCluster.querying(getReportsSubIdSql2(startDate, endDate, req.query, role, id)[0]);
        responseCount = await chCluster.querying(getReportsSubIdSql2(startDate, endDate, req.query, role, id)[1]);
        break;
      case roles.ADMIN:
        response = await chCluster.querying(getReportsSubIdSql2(startDate, endDate, req.query, role, id)[0]);
        responseCount = await chCluster.querying(getReportsSubIdSql2(startDate, endDate, req.query, role, id)[1]);
        break;
    }
    // let {data} = await chCluster.querying(getReportsSubIdSql2(startDate, endDate, req.query, role, id)[0]);
    // responseCount = await chCluster.querying(getReportsSubIdSql2(startDate, endDate, req.query, role, id)[1]);
    let {data} = response;
    data = data.map((item) => {
      item.revenue = Number(item.revenue.toFixed(2));
      item.profit = Number(item.profit.toFixed(2));
      item.payout = Number(item.payout.toFixed(2));
      if (item.pid) {
        const pub = pubs.find((p) => p.id === item.pid);
        if (pub) {
          item.publisher = `(${item.pid}) ${pub.companyName || pub.name}`;
        }
      }
      if (role === roles.ADVERTISER) {
        delete item.profit;
        delete item.payout;
        item.spends = item.revenue;
        delete item.revenue;
      }
      return item;
    });
    res.json({
      data,
      count: Number(responseCount.data[0].count),
    });
  } catch (e) {
    log.error(`loading sub ID reports \n ${e}`);
    res.sendStatus(500);
  }
};

export const loadOs2 = async (req, res) => {
  try {
    const {startDate, endDate, selectedPublisher, selectedAdvertiser, keys} = req.query;
    const {role, id} = req.user;
    parseQueryParams(req);

    let pubs = [];

    if (keys && keys.length) {
      if (keys.includes('publisher')) {
        if (selectedPublisher) {
          pubs = await Publisher.findAll({where: {id: req.query.selectedPublisher}, attributes: ['id', 'name']});
        } else {
          pubs = await Publisher.findAll({attributes: ['id', 'name']});
        }
        pubs = pubs.map((item) => item.get());
      }
    }

    let response;
    let responseCount;
    switch (role) {
      case roles.PUBLISHER:
        req.query.selectedPublisher = [id];
        response = await chCluster.querying(getReportsOsSql2(startDate, endDate, req.query)[0]);
        responseCount = await chCluster.querying(getReportsOsSql2(startDate, endDate, req.query)[1]);
        break;
      case roles.ADVERTISER:
        let campaignIds = await Campaign.findAll({where:{advertiserId:id}});
        campaignIds = campaignIds.map((item) => item.id);
        response = await chCluster.querying(getReportsOsSql2(startDate, endDate, req.query, campaignIds, role, id)[0]);
        responseCount = await chCluster.querying(getReportsOsSql2(startDate, endDate, req.query, campaignIds, role, id)[1]);
        break;
      case roles.ADMIN:
        response = await chCluster.querying(getReportsOsSql2(startDate, endDate, req.query, role, id)[0]);
        responseCount = await chCluster.querying(getReportsOsSql2(startDate, endDate, req.query, role, id)[1]);
        break;
    }
    let {data} = response;
    data = data.map((item) => {
      item.revenue = Number(item.revenue.toFixed(2));
      item.profit = Number(item.profit.toFixed(2));
      item.payout = Number(item.payout.toFixed(2));
      if (item.pid) {
        const pub = pubs.find((p) => p.id === item.pid);
        if (pub) {
          item.publisher = `(${item.pid}) ${pub.companyName || pub.name}`;
        }
      }
      if(role === roles.ADVERTISER){
        delete item.profit;
        delete item.payout;
        item.spends = item.revenue;
        delete item.revenue;
      }
      return item;
    });
    res.json({
      data,
      count: Number(responseCount.data[0].count),
    });
  } catch (e) {
    log.error(`loading os reports \n ${e}`);
    res.sendStatus(500);
  }
};

export const loadApps2 = async (req, res) => {
  try {
    const {startDate, endDate} = req.query;
    const {role, id} = req.user;
    let campaigns;
    parseQueryParams(req);
    let response;
    let responseCount;
    switch (role) {
      case roles.PUBLISHER:
        req.query.selectedPublisher = [id];
        response = await chCluster.querying(getReportsAppsPubSql2(startDate, endDate, req.query, role, id)[0]);
        responseCount = await chCluster.querying(getReportsAppsPubSql2(startDate, endDate, req.query, role, id)[1]);
        break;
      case roles.ADVERTISER:
        req.query.selectedAdvertiser = [id];
        campaigns = await Campaign.findAll({
          where: {
            advertiserId: id
          }
        });
        const campaignIds = campaigns.map((c) => c.id);
        response = await chCluster.querying(getReportsAppsSql2(startDate, endDate, req.query, role, id, campaignIds)[0]);
        responseCount = await chCluster.querying(getReportsAppsSql2(startDate, endDate, req.query, role, id, campaignIds)[1]);
        break;
      case roles.ADMIN:
        response = await chCluster.querying(getReportsAppsSql2(startDate, endDate, req.query, role, id)[0]);
        responseCount = await chCluster.querying(getReportsAppsSql2(startDate, endDate, req.query, role, id)[1]);
        break;
    }
    // const {data} = await chCluster.querying(getReportsAppsSql2(startDate, endDate, req.query, role, id)[0]);
    // responseCount = await chCluster.querying(getReportsAppsSql2(startDate, endDate, req.query, role, id)[1]);
    const count = Number(responseCount.data[0].count);
    let {data} = response;
    if (role === roles.ADVERTISER) {
      data = data.map((item) => { // Delete unnecessary values from the response according to the USER ROLE
        item.revenue = Number(item.revenue.toFixed(2));
        item.payout = Number(item.payout.toFixed(2));
        item.profit = Number(item.profit.toFixed(2));
        if (role === roles.ADVERTISER) {
          delete item.profit;
          delete item.payout;
          item.spends = item.revenue;
          delete item.revenue;
        }
        return item;
      });
    } 
    res.json({data, count});
  } catch (e) {
    log.error(`loading apps reports \n ${e}`);
    res.sendStatus(500);
  }
};

export const loadSites2 = async (req, res) => {
  try {
    const {startDate, endDate} = req.query;
    const {role, id} = req.user;
    let campaigns;
    parseQueryParams(req);
    let response;
    let responseCount;
    switch (role) {
      case roles.PUBLISHER:
        req.query.selectedPublisher = [id];
        response = await chCluster.querying(getReportsSitesPubSql2(startDate, endDate, req.query)[0]);
        responseCount = await chCluster.querying(getReportsSitesPubSql2(startDate, endDate, req.query)[1]);
        break;
      case roles.ADVERTISER:
        campaigns = await Campaign.findAll({
          where: {
            advertiserId: id
          }
        });
        const campaignIds = campaigns.map((c) => c.id);
        req.query.selectedAdvertiser = [id];
        response = await chCluster.querying(getReportsSitesSql2(startDate, endDate, req.query, role, id, campaignIds)[0]);
        responseCount = await chCluster.querying(getReportsSitesSql2(startDate, endDate, req.query, role, id, campaignIds)[1]);
        break;
      case roles.ADMIN:
        response = await chCluster.querying(getReportsSitesSql2(startDate, endDate, req.query, role, id)[0]);
        responseCount = await chCluster.querying(getReportsSitesSql2(startDate, endDate, req.query, role, id)[1]);
        break;
    }
    // const {data} = await chCluster.querying(getReportsSitesSql2(startDate, endDate, req.query, role, id)[0]);
    // responseCount = await chCluster.querying(getReportsSitesSql2(startDate, endDate, req.query, role, id)[1]);
    const count = Number(responseCount.data[0].count);
    let {data} = response;
    if (role === roles.ADVERTISER) {
      data = data.map((item) => { // Delete unnecessary values from the response according to the USER ROLE
        item.revenue = Number(item.revenue.toFixed(2));
        item.profit = Number(item.profit.toFixed(2));
        item.payout = Number(item.payout.toFixed(2));
        if (role === roles.ADVERTISER) {
          delete item.profit;
          delete item.payout;
          item.spends = item.revenue;
          delete item.revenue;
        }
        return item;
      });
    } 
    res.json({data, count});
  } catch (e) {
    log.error(`loading sites reports \n ${e}`);
    res.sendStatus(500);
  }
};

export const loadCreativesSizes2 = async (req, res) => {
  try {
    const {startDate, endDate, selectedPublisher, selectedAdvertiser, keys, reportsType} = req.query;
    const {role, id} = req.user;
    parseQueryParams(req);

    let pubs = [];
    const campaings = [];
    let creatives = [];

    if (keys && keys.length) {
      if (keys.includes('publisher')) {
        if (selectedPublisher) {
          pubs = await Publisher.findAll({where: {id: req.query.selectedPublisher}, attributes: ['id', 'name']});
        } else {
          pubs = await Publisher.findAll({attributes: ['id', 'name']});
        }
        pubs = pubs.map((item) => item.get());
      }
    }

    creatives = await Creative.findAll({
      attributes: ['id'],
      include: [
        {
          model: Campaign,
          attributes: ['id', 'campaignName'],
        },
      ],
    });

    let campaignsIds = [];
    if(role === roles.ADVERTISER){
      campaignsIds = await Campaign.findAll({where:{advertiserId:id}});
      campaignsIds = campaignsIds.map((c) => c.id);
    }
    let {data} = await chCluster.querying(getReportsCreativesSizes2(startDate, endDate, req.query, campaignsIds, role, id)[0]);
    const responseCount = await chCluster.querying(getReportsCreativesSizes2(startDate, endDate, req.query, campaignsIds, role, id)[1]);

    data = data.map((item) => {
      item.revenue = Number(item.revenue.toFixed(2));
      item.payout = Number(item.payout.toFixed(2));
      item.profit = Number(item.profit.toFixed(2));

      if (item.pid) {
        const pub = pubs.find((p) => p.id === item.pid);
        if (pub) {
          item.publisher = `(${item.pid}) ${pub.companyName || pub.name}`;
        }
      }
      if(role === roles.ADVERTISER){
        delete item.profit;
        delete item.payout;
        item.spends = item.revenue;
        delete item.revenue;
      }
      if (reportsType === 'CREATIVES') {
        const creative = creatives.find((c) => Number(c.id) === Number(item.crId));
        if (creative) {
          item.campaign = `(${creative.campaign.id}) ${creative.campaign.campaignName}`;
        } else {
          item.campaign = 'Deleted creatives'
        }
      }
      return item;
    });

    res.json({
      data,
      count: Number(responseCount.data[0].count),
    });
  } catch (e) {
    log.error(`loading creative size reports \n ${e}`);
    res.sendStatus(500);
  }
};

export const loadImpressions2 = async (req, res) => {
  try {
    const {startDate, endDate, offset, limit} = req.query;
    const {selectedAdvertiser, selectedPublisher, selectedCampaign} = req.query;
    if (selectedPublisher) {
      req.query.selectedPublisher = JSON.parse(selectedPublisher);
    }
    if (selectedAdvertiser) {
      req.query.selectedAdvertiser = JSON.parse(selectedAdvertiser);
    }
    if (selectedCampaign) {
      req.query.selectedCampaign = JSON.parse(selectedCampaign);
    }
    const {data} = await chCluster.querying(getReportsImpressionsSql(startDate, endDate, limit, offset, req.query)[0]);
    const responseCount = await chCluster.querying(getReportsImpressionsSql(startDate, endDate, limit, offset, req.query)[1]);
    const count = +responseCount.data[0].count;
    res.send({data, count});
  } catch (e) {
    log.error(`loading impression reports \n ${e}`);
    res.sendStatus(500);
  }
};

export const loadClicks2 = async (req, res) => {
  try {
    let {startDate, endDate, offset, limit} = req.query;
    const {selectedAdvertiser, selectedPublisher, selectedCampaign} = req.query;
    startDate = moment(startDate).format('YYYY-MM-DD HH:mm:ss');
    endDate = moment(endDate).format('YYYY-MM-DD HH:mm:ss');
    if (selectedPublisher) {
      req.query.selectedPublisher = JSON.parse(selectedPublisher);
    }
    if (selectedAdvertiser) {
      req.query.selectedAdvertiser = JSON.parse(selectedAdvertiser);
    }
    if (selectedCampaign) {
      req.query.selectedCampaign = JSON.parse(selectedCampaign);
    }
    const {data} = await chCluster.querying(getReportsClicksSql(startDate, endDate, limit, offset, req.query)[0]);
    const responseCount = await chCluster.querying(getReportsClicksSql(startDate, endDate, limit, offset, req.query)[1]);
    const count = +responseCount.data[0].count;
    res.send({data, count});
  } catch (e) {
    log.error(`loading click reports \n ${e}`);
    res.sendStatus(500);
  }
};

export const loadConversions2 = async (req, res) => {
  try {
    let {startDate, endDate, offset, limit} = req.query;
    startDate = moment(startDate).format('YYYY-MM-DD HH:mm:ss');
    endDate = moment(endDate).endOf('day').format('YYYY-MM-DD HH:mm:ss');

    const {data} = await chCluster.querying(getConversionsClicksSql(startDate, endDate, limit, offset, req.query)[0]);
    const responseCount = await chCluster.querying(getConversionsClicksSql(startDate, endDate, limit, offset, req.query)[1]);
    const count = +responseCount.data[0].count;

    res.send({data, count});
  } catch (e) {
    log.error(`loading conversions reports \n ${e}`);
    res.sendStatus(500);
  }
};

export const loadGoals2 = async (req, res) => {
  try {
    let {startDate, endDate, offset, limit} = req.query;
    startDate = moment(startDate).format('YYYY-MM-DD HH:mm:ss');
    endDate = moment(endDate).endOf('day').format('YYYY-MM-DD HH:mm:ss');

    const {data} = await chCluster.querying(getGoalsClicksSql(startDate, endDate, limit, offset, req.query)[0]);
    const responseCount = await chCluster.querying(getGoalsClicksSql(startDate, endDate, limit, offset, req.query)[1]);
    const count = +responseCount.data[0].count;

    res.send({data, count});
  } catch (e) {
    log.error(`loading goals reports \n ${e}`);
    res.sendStatus(500);
  }
};

export const loadCsvApps2 = async (req, res) => {
  try {
    const {startDate, endDate} = req.query;

    let count = await chCluster.querying(`
    SELECT count (DISTINCT appId, appName, appBundle, publisherId) as count
    FROM dsp.bidrequests_counter_apps_v5 
    WHERE date>='${startDate}' and date<='${endDate}' and wlid='${wlid}'
    `);
    count = count.data[0].count;

    let publishers = await Publisher.findAll({
      order: [['id', 'DESC']],
      attributes: ['id', 'name', 'status'],
    });

    publishers = publishers.map((item) => item.get());
    const publishersList = {};
    publishers.map((item) => {
      publishersList[item.id] = item;
    });

    res.statusCode = 200;
    res.setHeader('Content-type', 'application/csv');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-disposition', `attachment; filename="apps-${startDate}-${endDate}.csv"`);
    res.write('appId,appName,appBundle,publisher,requests,responses,impressions,clicks,ctr,bidFloor,fillRate,winRate,eCPM,revenue,payout,profit\n');

    if (count > 20000) {
      const limit = 20000;
      const iterr = new Array(Math.round(count / limit));
      iterr[0] = limit;

      for (let i = 0; i < iterr.length; i++) {
        if (i === 0) {
          continue;
        } else {
          iterr[i] = iterr[i - 1] + limit;
        }
      }

      for (const offset of iterr) {
        console.log(`offset: ${offset}`);
        const resp = await chCluster.querying(getReportsAppsCSVSql(startDate, endDate, limit, offset));

        resp.data.map((item) => {
          const user = publishersList[item.publisherId] ? publishersList[item.publisherId] : null; // publishers.find((pub) => pub.id === item.publisherId);
          item.publisher = `(${item.publisherId})${user ? user.name : ''}`;
        });
        resp.data.map((item) => {
          let str = [item.appidLabel, item.appName, item.appBundle, item.publisher, item.requests, item.responses, item.impressions,
            item.clicks, item.ctr, item.bidFloor, item.fillRate, item.winRate, item.eCPM, item.revenue,
            item.payout, item.profit];
          str = str.join(',')+'\n';
          res.write(str);
        });
      }
    } else {
      const resp = await chCluster.querying(getReportsAppsCSVSql(startDate, endDate, 20000, 0));

      resp.data.map((item) => {
        const user = publishers.find((pub) => pub.id === item.publisherId);
        item.publisher = `(${item.publisherId})${user ? user.name : ''}`;
      });
      resp.data.map((item) => {
        let str = [item.appidLabel, item.appName, item.appBundle, item.publisher, item.requests, item.responses, item.impressions,
          item.clicks, item.ctr, item.bidFloor, item.fillRate, item.winRate, item.eCPM, item.revenue,
          item.payout, item.profit];
        str = str.join(',')+'\n';
        res.write(str);
      });
    }

    res.end();
  } catch (e) {
    log.error(`loading csv apps reports \n ${e}`);
    res.sendStatus(500);
  }
};
