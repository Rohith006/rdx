import moment from 'moment';

import {ACTIVE, SUSPENDED} from '../../constants/campaign';
import {campaign as Campaign} from '../../models';

import {logger} from '../../../logger/winston'

export const runActivationBy = async (type) => {
  const params = {
    status: ACTIVE,
    statusReason: null,
    deactivatedAt: null,
  };

  logger.info(`Scheduler: activate suspended campaign started at ${new Date()}`);

  const startDate = moment().subtract(1, type).startOf(type).format(DATE_FORMAT);
  const endDate = moment().subtract(1, type).endOf(type).format(DATE_FORMAT);

  try {
    const campaigns = await Campaign.update(params, {
      where: {
        status: SUSPENDED,
        deactivatedAt: {$between: [startDate, endDate]},
      },
      returning: true,
    });

    logger.info(`Count of activated campaigns (${type}): ${campaigns[1].length}`);

    for (const campaign of campaigns[1]) {
      logger.info('Campaign set to status ACTIVE : ' + JSON.stringify(campaign.id));
      /*
      if (campaign.modelPayment === CPM) {
        await cacheCpmCampaignStatus(campaign);
      } else if (campaign.modelPayment === CPA || campaign.modelPayment === CPI) {
        await cacheCpiCpaCampaignStatus(campaign);
      }*/
    }
  } catch (e) {
    logger.error(`activating suspended campaigns failed \n ${e.stack}`);
  }
};


const DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';
