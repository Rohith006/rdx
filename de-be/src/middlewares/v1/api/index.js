import {campaign as Campaign,} from '../../../models';
import {prepareSimpleLogInfo} from '../../../services/logging/create';
import {eventTypes} from '../../../constants/eventType';
import log from '../../../../logger'

export const loadCampaigns = async (req, res, next) => {
  const query = {};

  try {
    const campaigns = await Campaign.findAll(query);

    res.json({
      publisherId: res.locals.user.id,
      offers: campaigns,
    });
  } catch (e) {
    log.error('loading campaigns failed')
    next(e);
  }
};

export const prepareLogs = async (req, res, next) => {
  const {type} = req.body;

  res.locals.loggedObject = prepareSimpleLogInfo(req.user, eventTypes[type]);

  next();
};
