import {
  getAdvertiserTop5Creatives,
  getAdvertiserTopCampaign,
  getPublisherTopCampaign,
  statsDaySql,
  topCampaignsAdvertiserSql,
} from '../../../utils/clickhouseQq';
import {
  getSummaryTodayAccountManagerSql,
  getSummaryTodayAdvertiserSql,
  getSummaryTodayPublisherSql,
  getSummaryYesterdayAccountManagerSql,
  getSummaryYesterdayAdvertiserSql,
  getSummaryYesterdayPublisherSql,
  trafficStatisticsAdvertiserSql,
  trafficStatisticsPublisherSql,
  trafficStatisticsSqlAccountManager,
} from '../../../utils/clickhouseQq2';
import {roles} from '../../../constants/user';
import {
  advertiser as Advertiser,
  budget as Budget,
  campaign as Campaign,
  inventory as Inventory,
  publisher as Publisher,
  Sequelize,
} from '../../../models';
import * as topEarningsConstants from '../../../constants/topEarnings';
import * as capsConstants from '../../../constants/caps';
import {clients} from '../../../services/clients';
import config from '../../../../config';
import chCluster from '../../../utils/client/chCluster';
import {getQps} from '../../../services/settings.service';
import log from '../../../../logger';

const Op = Sequelize.Op;
let redisClient;


const Moment = require('moment');
const MomentRange = require('moment-range');

const moment = MomentRange.extendMoment(Moment);

export const dashboardTrafficStatistics = async (req, res, next) => {
  try {
    const {role, id, permissions} = req.user;
    let data = [];

    const dateRange = req.query.dateRange || 30;
    const startDate = moment().utc().subtract(dateRange - 1, 'days').startOf('day');
    const endDate = Number(dateRange) === 1 ? moment().utc().add(1, 'day').startOf('day') : moment();

    const interval = Array.from(moment().range(startDate, endDate).by('day')).map((day) => day.format('YYYY-MM-DD'));

    if (role === 'ADMIN') {
      const cacheData = await redisClient.getAsync('cache-dashboard-graf');
      data = JSON.parse(cacheData);
    } else if (role === 'ACCOUNT_MANAGER') {
      let advertisers = []; let publishers = [];
      let showRevenue; let showPayout;

      const showProfit = req.user.permissions.includes('SEE_PROFIT');

      if (permissions && permissions.includes('ADVERTISERS')) {
        const managerAdvertisers = await Advertiser.findAll({
          where: {managerId: req.user.id},
          attributes: ['id'],
        });

        advertisers = managerAdvertisers.map((item) => item.get().id);

        showRevenue = true;
      } else if (permissions && permissions.includes('PUBLISHERS')) {
        const managerPublishers = await Publisher.findAll({
          where: {managerId: req.user.id},
          attributes: ['id'],
        });

        publishers = managerPublishers.map((item) => item.get().id);

        showPayout = true;
      }

      if (advertisers.length || publishers.length) {
        const response = await chCluster.querying(trafficStatisticsSqlAccountManager(interval, advertisers, publishers));
        data = response.data;
        data = data.map((item) => {
          if (!showProfit) {
            delete item.profit;
          }
          if (!showRevenue) {
            delete item.revenue;
          }
          if (!showPayout) {
            delete item.payout;
          }
          return item;
        });
      }
    } else if (role === 'ADVERTISER') {
      const response = await chCluster.querying(trafficStatisticsAdvertiserSql(id, interval));
      data = response.data;
    } else if (role === 'PUBLISHER') {
      const response = await chCluster.querying(trafficStatisticsPublisherSql(id, interval));
      data = response.data;
    }
    res.send({
      trafficStatistics: data || [],
    });
  } catch (err) {
    log.error(`dashboard traffic statistics \n ${err}`)
    next(err);
  }
};

export const loadTopEarnings = async (req, res, next) => {
  try {
    let cachedData;
    let data;

    const pubConditions = {
      where: {status: {[Op.ne]: 'REMOVED'}},
    };

    if (req.user.role === roles.ACCOUNT_MANAGER && req.user.permissions.includes('PUBLISHERS')) {
      pubConditions.where.managerId = req.user.id;
    }

    const publishers = await Publisher.findAll(pubConditions);
    cachedData = await clients.redisClient.getAsync('cache-top-five-ssp');
    data = JSON.parse(cachedData) || [];

    let filteredPublishers = data
        .filter((publisher) => publishers.find((el) => publisher.publisherId === el.id))
        .filter((publisher) => publisher.revenue > 0)
        .map((topEarnings) => ({
          profit: parseFloat(topEarnings.revenue.toFixed(4)),
          publisherId: topEarnings.publisherId,
          name: publishers.find((user) => user.id === topEarnings.publisherId).name,
          type: topEarningsConstants.PUBLISHER,
        }));

    const campaignConditions = {
      where: {status: {[Op.ne]: 'REMOVED'}},
    };

    if (req.user.role === roles.ACCOUNT_MANAGER && req.user.permissions.includes('ADVERTISERS')) {
      const managerAdvertisers = await Advertiser.findAll({
        where: {managerId: req.user.id},
        attributes: ['id'],
      });

      campaignConditions.where.advertiserId = managerAdvertisers.map((item) => item.get().id);
    }

    const campaigns = await Campaign.findAll(campaignConditions);
    cachedData = await clients.redisClient.getAsync('cache-top-five-campaign');
    data = JSON.parse(cachedData) || [];
    let filteredCampaigns = data
        .filter((campaign) => campaigns.find((el) => campaign.campaignId === el.id))
        .filter((campaign) => campaign.revenue > 0)
        .map((topEarnings) => ({
          profit: parseFloat(topEarnings.revenue.toFixed(4)),
          id: topEarnings.campaignId,
          name: campaigns.find((campaign) => campaign.id === topEarnings.campaignId).campaignName,
          type: topEarningsConstants.CAMPAIGN,
        }));

    if (req.user.role === roles.ACCOUNT_MANAGER) {
      if (!req.user.permissions.includes('ADVERTISERS')) {
        filteredCampaigns = [];
      }
      if (!req.user.permissions.includes('PUBLISHERS')) {
        filteredPublishers = [];
      }
    }

    const topEarningsStatistic = {
      campaignTopEarnings: filteredCampaigns || [],
      publisherTopEarnings: filteredPublishers || [],
    };

    res.send({topEarningsStatistic});
  } catch (e) {
    log.error(`loading top earnings \n ${e}`)
    next(e);
  }
};

export const loadSummary = async (req, res, next) => {
  const {id, role} = req.user;
  let todayStats;
  let yesterdayStats;
  let summary;

  switch (role) {
    case roles.OWNER:
    case roles.ADMIN:
      const cacheData = await redisClient.getAsync('cache-dashboard-summary');
      const data = JSON.parse(cacheData);
      summary = data || {};
      const qps = await getQps();
      summary.qpsPlatformLimit = qps.qpsPlatformLimit;
      summary.totalQps = qps.incomingQps + qps.outgoingQps;
      summary.incomingQps = qps.incomingQps;
      summary.outgoingQps = qps.outgoingQps;
      break;
    case roles.ACCOUNT_MANAGER:
      let advertisers = []; let publishers = [];
      let showRevenue; let showPayout;

      const showProfit = req.user.permissions.includes('SEE_PROFIT');

      if (req.user.permissions.includes('ADVERTISERS')) {
        const managerAdvertisers = await Advertiser.findAll({
          where: {managerId: req.user.id},
          attributes: ['id'],
        });

        advertisers = managerAdvertisers.map((item) => item.get().id);

        showRevenue = true;
      } else if (req.user.permissions.includes('PUBLISHERS')) {
        const managerPublishers = await Publisher.findAll({
          where: {managerId: req.user.id},
          attributes: ['id'],
        });

        publishers = managerPublishers.map((item) => item.get().id);

        showPayout = true;
      }

      const summaryTodaySql = getSummaryTodayAccountManagerSql(advertisers, publishers, showRevenue, showPayout, showProfit);
      todayStats = await chCluster.querying(summaryTodaySql);

      const summaryYesterdaySql = getSummaryYesterdayAccountManagerSql(advertisers, publishers, showRevenue, showPayout, showProfit);
      yesterdayStats = await chCluster.querying(summaryYesterdaySql);

      summary = {...todayStats.data[0], ...yesterdayStats.data[0]};
      break;
    case roles.ADVERTISER:
      todayStats = await chCluster.querying(getSummaryTodayAdvertiserSql(id));
      yesterdayStats = await chCluster.querying(getSummaryYesterdayAdvertiserSql(id));
      summary = {...todayStats.data[0], ...yesterdayStats.data[0]};
      break;
    case roles.PUBLISHER:
      todayStats = await chCluster.querying(getSummaryTodayPublisherSql(id));
      yesterdayStats = await chCluster.querying(getSummaryYesterdayPublisherSql(id));
      summary = {...todayStats.data[0], ...yesterdayStats.data[0]};
      break;
  }

  res.json({summary});
};

export const loadTopCountries = async (req, res, next) => {
  try {
    let conditions = '';

    let topCountriesList = [];

    const timeStart = moment().startOf('month').format('YYYY-MM-DD');
    const timeEnd = moment().format('YYYY-MM-DD');

    if (req.user.role === roles.PUBLISHER) {
      conditions += ` and publisherId = ${req.user.id}`;
    }

    if (req.user.role === roles.ADVERTISER) {
      conditions += ` and advertiserId = ${req.user.id}`;
    }

    if (req.user.role === roles.ACCOUNT_MANAGER) {
      if (req.user.permissions.includes('ADVERTISERS')) {
        const managerAdvertisers = await Advertiser.findAll({
          where: {managerId: req.user.id},
          attributes: ['id'],
        });

        const advIds = managerAdvertisers.map((item) => item.get().id);

        conditions += ` and advertiserId in (${advIds})`;
      } else if (req.user.permissions.includes('PUBLISHERS')) {
        const managerPublishers = await Publisher.findAll({
          where: {managerId: req.user.id},
          attributes: ['id'],
        });

        const pubIds = managerPublishers.map((item) => item.get().id);

        conditions += ` and publisherId in (${pubIds})`;
      }
    }

    let query = `
        SELECT 
          t1.geo as geo,
          t1.price + t2.price as revenue,
          t1.payout + t2.payout as payout
        FROM
          (
            SELECT 
              geo as geo, 
              floor(sumMergeIf(sumPrice, paymentModel='CPM' and status='APPROVED'), 6) as price,
              floor(sumMergeIf(sumPayout, paymentModel='CPM' and status='APPROVED'), 6) as payout
            FROM dsp.${config.clickhouseCluster.IMP_COUNTER_GEO}
            WHERE createdDate >= '${timeStart}' and createdDate <= '${timeEnd}' and wlid='${config.wlid}' ${conditions}
            GROUP BY geo
          ) as t1
          LEFT JOIN (
            SELECT 
              geo as geo, 
              floor(sumMergeIf(sumPrice, paymentModel='CPC' and status = 'APPROVED'), 6) as price,
              floor(sumMergeIf(sumPayout, paymentModel='CPC' and status = 'APPROVED'), 6) as payout
            FROM dsp.${config.clickhouseCluster.CLICK_COUNTER_GEO}
            WHERE createdDate >= '${timeStart}' and createdDate <= '${timeEnd}' and wlid='${config.wlid}' ${conditions}
            GROUP BY geo
          ) as t2
          ON t1.geo = t2.geo
          ORDER BY revenue DESC LIMIT 10`
    const response = await chCluster.querying(query);

    topCountriesList = response.data;

    topCountriesList = topCountriesList.map((item) => {
      if (req.user.role === roles.ADVERTISER) {
        delete item.payout;
      }
      if (req.user.role === roles.PUBLISHER) {
        delete item.revenue;
      }
      if (req.user === roles.ACCOUNT_MANAGER) {
        !req.user.permissions.includes('ADVERTISERS') && delete item.revenue;
        !req.user.permissions.includes('PUBLISHERS') && delete item.payout;
      }
      return item;
    });

    res.send(topCountriesList);
  } catch (e) {
    log.error(`loading top countries`);
    next(e);
  }
};

export const loadTopSpent = async (req, res, next) => {
  try {
    if (req.user.role !== roles.ADVERTISER) {
      return;
    }
    const advertiserId = req.user.id;
    const campaigns = await Campaign.findAll({where: {advertiserId}});

    const preparedResults = await Promise.all(campaigns.map((campaign) => new Promise(async (resolve) => {
      const {data} = await chCluster.querying(topCampaignsAdvertiserSql(advertiserId, campaign.id));

      resolve({
        spent: data[0].spent,
        campaignId: campaign.id,
        campaignName: campaign.campaignName,
        type: topEarningsConstants.CAMPAIGN,
      });
    })));

    const campaignTopSpent = preparedResults.filter((item) => item.spent > 0)
        .sort((prev, next) => next.spent - prev.next)
        .slice(0, 5);

    res.send({topSpentStatistic: {campaignTopSpent}});
  } catch (e) {
    log.error(`loading top spent \n ${e}`);
    next(e);
  }
};

export const loadCaps = async (req, res, next) => {
  try {
    const role = req.user.role;
    const {id} = req.user;
    const startOfToday = moment().utc().startOf('day').format('YYYY-MM-DD HH:mm:ss');
    const startOfHour = moment().utc().startOf('hour').format('YYYY-MM-DD HH:mm:ss');
    const now = moment().utc().format('YYYY-MM-DD HH:mm:ss');

    let campaigns = [];
    switch (role) {
      case roles.PUBLISHER:
        campaigns = await Inventory.findAll({
          where: {
            publisherId: id,
          },
          include: [{
            include: [
              {
                model: Budget,
                required: true,
                where: {
                  dailyBudget: {
                    [Op.gte]: 0,
                  },
                },
              },
            ],
            model: Campaign,
            required: true,
            attributes: ['campaignName', 'id'],
          }],
        });
        break;
      case roles.ADVERTISER:
        campaigns = await Campaign.findAll({
          where: {advertiserId: id},
          include: [{
            model: Budget,
            required: true,
            where: {
              dailyBudget: {
                [Op.gte]: 0,
              },
            },
          }],
        });
        break;
      case roles.ADMIN:
        campaigns = await Campaign.findAll({
          include: [{
            model: Budget,
            required: true,
            where: {
              dailyBudget: {
                [Op.gte]: 0,
              },
            },
          }],
        });
      case roles.ACCOUNT_MANAGER:
        const managerAdvertisers = await Advertiser.findAll({
          where: {managerId: id},
          attributes: ['id'],
        });

        const where = {
          advertiserId: managerAdvertisers.map((item) => item.get().id),
        };

        campaigns = await Campaign.findAll({
          where,
          include: [{
            model: Budget,
            required: true,
            where: {
              dailyBudget: {
                [Op.gte]: 0,
              },
            },
          }],
        });
    }

    const capsList = await Promise.all(campaigns.map((campaign) => new Promise(async (resolve) => {
      const statsDay = await chCluster.querying(statsDaySql(campaign.get().id, startOfToday, now));
      const statsHour = await chCluster.querying(statsDaySql(campaign.get().id, startOfHour, now));
      const dailyBudget = role === roles.PUBLISHER ? campaign.dataValues.campaign.budget.dataValues.hourlyBudget : campaign.budget.dailyBudget;
      const hourlyBudget = role === roles.PUBLISHER ? campaign.dataValues.campaign.budget.dataValues.hourlyBudget : campaign.budget.hourlyBudget;
      const obj = {
        day: {
          currentCap: statsDay.data[0].revenue.toFixed(6),
          cap: dailyBudget,
          type: capsConstants.BUDGET,
          period: capsConstants.DAY,
          campaignId: role === roles.PUBLISHER ? campaign.get().campaign.id : campaign.get().id,
          campaignName: role === roles.PUBLISHER ? campaign.get().campaign.campaignName: campaign.get().campaignName,
          os: role === roles.PUBLISHER ? campaign.get().campaign.platform : campaign.get().platform,
        },
        hour: {
          currentCap: statsHour.data[0].revenue.toFixed(6),
          cap: hourlyBudget,
          type: capsConstants.BUDGET,
          period: capsConstants.HOUR,
          campaignId: role === roles.PUBLISHER ? campaign.get().campaign.id : campaign.get().id,
          campaignName: role === roles.PUBLISHER ? campaign.get().campaign.campaignName: campaign.get().campaignName,
          os: role === roles.PUBLISHER ? campaign.get().campaign.platform : campaign.get().platform,
        },
      };

      resolve(obj);
    })));

    res.send({capsList});
  } catch (e) {
    log.error(`loading caps \n ${e}`);
    next(e);
  }
};

export const loadTopEarningCampaignsForPublisher = async (req, res, next) => {
  const {id} = req.user;
  try {
    const campaigns = await Inventory.findAll({
      where: {
        publisherId: id,
      },
      include: [{
        model: Campaign,
        required: true,
        attributes: ['campaignName', 'id'],
      }],
    });

    const campaignTopEarnings = await Promise.all(campaigns.map(({campaign}) => new Promise(async (resolve) => {
      const {data} = await chCluster.querying(getPublisherTopCampaign(id, campaign.id));
      resolve({
        profit: parseFloat(data[0].payout.toFixed(4)),
        id: campaign.id,
        name: campaign.campaignName,
        type: topEarningsConstants.CAMPAIGN,
      });
    })));

    const publisherTopEarnings = campaignTopEarnings.splice(0, 5);

    res.send({topEarningsStatistic: {publisherTopEarnings}});
  } catch (err) {
    log.error(` top earning campaigns for publisher \n ${err}`);
    next(err);
  }
};

export const loadTopEarningCampaignsForAdvertiser = async (req, res, next) => {
  const {id} = req.user;
  const startDate = moment().startOf('month').format('YYYY-MM-DD');
  const endDate = moment().subtract(1,'day').format('YYYY-MM-DD');
  try {
    const campaigns = await Campaign.findAll({where: {advertiserId: id}});

    let campaignTopEarnings = await Promise.all(campaigns.map((campaign) => new Promise(async (resolve) => {
      const {data} = await chCluster.querying(getAdvertiserTopCampaign(id, campaign.id, startDate, endDate));
      resolve({
        profit: parseFloat(data[0].payout.toFixed(4)),
        id: campaign.id,
        name: campaign.campaignName,
        type: topEarningsConstants.CAMPAIGN,
      });
    })));
    const response = await chCluster.querying(getAdvertiserTop5Creatives(id,startDate,endDate));
    let top5creatives = response.data || [];
    const advertiserTopEarnings = campaignTopEarnings.splice(0, 5);
    res.send({topEarningsStatistic: { advertiserTopEarnings, top5creatives}});
  } catch (e) {
    log.error(`top earning campaigns for advertiser \n ${e}`);
    next(e);
  }
};

export const setRedisClient = (client) => {
  redisClient = client;
};
