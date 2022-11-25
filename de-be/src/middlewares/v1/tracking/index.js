import uuid from 'uuid';
import emitter from '../../../utils/EventEmitter';
import {REGULAR, TEST} from '../../../constants/click';
import getUserAgentInfo from '../../../utils/getUserAgentInfo';
import checkTargetParameters from '../../../utils/checkTargetParameters';
import moment from 'moment';

import log from '../../../../logger';

let redisClient;

export const awaitClickVerification = (req, res) => {
  // req.setTimeout(35000);

  const event = `TEST:${ req.body.campaignId }`;
  req.eventName = event;

  emitter.on(event, () => {
    res.sendStatus(200);
    emitter.removeAllListeners(event);
  });
};

export const awaitInstallVerification = (req, res) => {
  // req.setTimeout(35000);

  const event = `INSTALL:${ req.body.campaignId }`;
  req.eventName = event;

  emitter.on(event, () => {
    res.sendStatus(200);
    emitter.removeAllListeners(event);
  });
};

export const trackClick = async (req, res, next) => {
  try {
    const {campaignId, publisherId, trackingUrl, subId} = req.query;

    const redirect = (id) => {
      let editedTrackingUrl = trackingUrl.replace(/AMP/g, '&').replace('{CLICKID}', id);
      if (editedTrackingUrl.indexOf('{PUBLISHERUUID}') > -1) {
        editedTrackingUrl = editedTrackingUrl.replace('{PUBLISHERUUID}', publisherId);
      }
      if (editedTrackingUrl.indexOf('{DEVICEID}') > -1) {
        editedTrackingUrl = editedTrackingUrl.replace('{DEVICEID}', req.fingerprint.hash);
      }
      res.redirect(`${editedTrackingUrl}`);
    };

    const isTestLink = publisherId === 'TEST';

    const userAgentInfo = getUserAgentInfo(req.headers['user-agent']);

    const targetParametersMatched = await checkTargetParameters(campaignId, userAgentInfo, req);

    if (isTestLink) {
      if (targetParametersMatched) {
        emitter.emit(`TEST:${ campaignId }`);
      } else {
        redirect('untracked_click');
        return;
      }
    }

    const id = uuid();
    const date = moment().format('YYYY-MM-DDTHH:mm:ss') + 'Z';

    const click = {
      userAgent: req.headers['user-agent'],
      ...userAgentInfo,
      id,
      campaignId,
      publisherId: isTestLink ? 0 : publisherId,
      type: isTestLink ? TEST : REGULAR,
      ip: req.ip,
      createdAt: date,
      updatedAt: date,
      targetParametersMatched,
      subId,
    };

    const hashedClick = [];
    for (const key in click) {
      hashedClick.push(key);
      hashedClick.push(click[key]);
    }
    redisClient.hmsetAsync(`click:${id}`, hashedClick);
    redirect(id);
  } catch (e) {
    log.error(` tracking click \n ${e}`);
    next(e);
  }
};

export const trackInstall = async (req, res, next) => {
  try {
    const {clickId, advertiserId, campaignId} = req.query;

    const install = {
      campaignId,
      clickId,
      advertiserId,
    };
    const hashedInstall = [];
    for (const key in install) {
      hashedInstall.push(key);
      hashedInstall.push(install[key]);
    }
    redisClient.hmsetAsync(`install:${ clickId }`, hashedInstall);

    res.sendStatus(200);
  } catch (e) {
    log.error(`tracking install \n ${e}`);
    next(e);
  }
};

export const verifyClick = (req, res) => {
  const {campaignId} = req.body;
  if (campaignId) {
    emitter.emit(`TEST:${ campaignId }`);
  }

  res.sendStatus(200);
};

export const verifyInstall = (req, res) => {
  const {campaignId} = req.body;
  if (campaignId) {
    emitter.emit(`INSTALL:${ campaignId }`);
  }

  res.sendStatus(200);
};

export const setRedisClient = (client) => {
  redisClient = client;
};
