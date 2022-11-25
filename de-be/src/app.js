import createError from 'http-errors';
import express from 'express';
import helmet from "helmet";
import bodyParser from 'body-parser';
import logger from 'morgan';
import cors from 'cors';
import redis from 'redis';
import schedule from 'node-schedule';
import fileUpload from 'express-fileupload';
import bluebird from 'bluebird';
import indexRouter from './routes/index';
import {initRedisClient} from './services/redisInitService';
import './auth/passportJWT';
import './auth/passportLocal';
import config from '../config';
import path from 'path';
import favicon from 'serve-favicon';
import {runTaskUpdatePubQps} from './services/cron/qpsPublisher';
import {runTaskCachingPubData} from './services/cron/cachingPublisherData';
import {runTaskCheckCampaignBudget} from './services/cron/checkCampaignBudget';
import runTaskUploadSspStatsToday from './services/cron/syncSspStats';
import {runTaskAutorunCampaignBudgetDaily, runTaskAutorunCampaignBudgetHourly} from './services/cron/autorunCampaign';
import {runTaskCachingAdminTrafficStatistics} from './services/cron/dashboard/cacheTrafficStats';
import {runTaskCachingAdvertiserData} from './services/cron/cachingAdvertiserData';
import {runTaskCachingCampaignData} from './services/cron/cachingCampaingData';
import {runTaskExcludeCampaign} from './services/cron/excludeCampaignRuleCTR';
import {runTaskRecacheCampaign} from './services/cron/recacheCampaign';
import {execTaskFromBidder} from './services/cron/execTaskFromBidder';
import {runTaskPopulateAudience} from './services/cron/populateAudience';
import syncAdvertiserBalance from './services/cron/advertiserBalance';
import {syncAdvertiserUsage} from './services/cron/syncAdvertiserUsage'
import initRedisForBidder from './utils/client/redisCache';
import {cacheAllCampaigns, cacheAllUsers} from './services/caching/bulkCreate';
import runTaskUploadSspStatsYesterday from './services/cron/syncSspStatsYesterday';
import initRedisTraff from './utils/client/redisTraff';
import session from "express-session";
import log from '../logger';
import {memoryStore} from "../config/keycloak-config";
import { updateDailySpendLimit } from './services/cron/updateDailySpendLimit';
import { syncTransactionRequestWithDIY } from './services/cron/syncTransactionRequestWithDIY';
import checkAdvertiserUsage from "./services/cron/checkAdvertiserUsage";
import { whitelistedURLs } from './constants/whitelistedURLs';

const app = express();

app.use(helmet());

const keycloak = require('../config/keycloak-config').getKeycloak();

const corsOptions = {
  origin: config.isProduction?whitelistedURLs.prod:whitelistedURLs.dev,
  optionsSuccessStatus: 200 // For legacy browser support
}
app.use(cors(corsOptions));

app.use(session({
  secret:config.secret_key,
  resave:false,
  saveUninitialized:true,
  store:memoryStore
}))

app.use(keycloak.middleware({
  logout:'/logout',
  admin:'/'
}))

app.use(favicon(path.join(__dirname, '../assets', 'images/favicon.ico')));
app.use(express.static('public'));
app.use(bodyParser.json({type: 'application/*+json'}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.set('trust proxy', true);

app.use(logger('combined', {
  stream: log.stream,
  skip:(req) => req.url === '/'
}));


//app.use(passport.initialize());

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(fileUpload());

app.use('/', indexRouter);
app.use('/v1', indexRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => next(createError(404)));

// error handler
app.use((err, req, res) => {
  if (err.status === 400) {
    res.status(400).send(err);
  } else {
    log.error(err);
    // rollbar.error(err);
    res.status(500).send(err.message);
  }
});

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const {redisCreds: {host, port, password}} = config;
initRedisClient(redis.createClient({port, host, password}));
initRedisForBidder();
initRedisTraff();

/**
 * create redis publisher
 */
export const publisher = redis.createClient({port, host, password});

if (config.isProduction) {
  schedule.scheduleJob('00 01 * * * *', runTaskUploadSspStatsToday);
  schedule.scheduleJob('00 00 12 * * *', runTaskUploadSspStatsYesterday);
  schedule.scheduleJob('00 00 06 * * *', runTaskUploadSspStatsYesterday);
  schedule.scheduleJob('00 00 23 * * *', runTaskUploadSspStatsYesterday);
}

/**
 * Synchronize redis business data with local cache
 * and start cron jobs
 */
(async () => {
  schedule.scheduleJob('*/15 * * * * *', cacheAllCampaigns);
  schedule.scheduleJob('*/25 * * * * *', cacheAllUsers);
  schedule.scheduleJob('*/30 * * * * *', runTaskCheckCampaignBudget);
  schedule.scheduleJob('*/1 * * * *', runTaskExcludeCampaign);
  schedule.scheduleJob('00 01 * * * *', runTaskAutorunCampaignBudgetHourly);
  schedule.scheduleJob('00 00 00 * * *', runTaskAutorunCampaignBudgetDaily)
  schedule.scheduleJob('*/3 * * * *', runTaskCachingAdminTrafficStatistics);
  schedule.scheduleJob('*/3 * * * *', runTaskCachingAdvertiserData);
  schedule.scheduleJob('*/9 * * * *', runTaskCachingPubData);
  schedule.scheduleJob('*/12 * * * *', runTaskCachingCampaignData);
  schedule.scheduleJob('*/1 * * * *', runTaskRecacheCampaign);
  schedule.scheduleJob('*/5 * * * *', execTaskFromBidder);
  schedule.scheduleJob('*/10 * * * *', runTaskPopulateAudience);
  schedule.scheduleJob('*/1 * * * *', runTaskUpdatePubQps);
  //schedule.scheduleJob('*/15 * * * * *', syncAdvertiserBalance);
  schedule.scheduleJob('*/10 * * * * *', syncAdvertiserUsage); // run every 10seconds
  schedule.scheduleJob('58 23 * * *', updateDailySpendLimit); // run at every midnight 23:58
  schedule.scheduleJob('0 23 * * *', syncTransactionRequestWithDIY); // run at every night 23:00
  schedule.scheduleJob('*/10 * * * * *', checkAdvertiserUsage);
})();

export default app;

