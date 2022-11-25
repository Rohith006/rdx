import {MINIMUM_BALANCE} from '../../config';

import {campaign as Campaign} from '../models';
import {cacheSelectedCampaigns} from '../services/caching/bulkCreate';

import {statuses} from '../constants/user';
import {PAUSED} from '../constants/campaign';

export const checkAdvertiserBalance = async (user) => {
  const {balance, status} = user;

  user.balance = Number(balance);

  if (balance < MINIMUM_BALANCE) {
    // user.status = statuses.PAUSED;

    if (status === statuses.ACTIVE) {
      // TODO Send email notification about balance to Advertiser

      const campaigns = await Campaign.update({status: PAUSED}, {
        where: {advertiserId: user.id},
        returning: true,
      });

      await cacheSelectedCampaigns(campaigns[1]);
    }
  }

  return user;
};
