import moment from 'moment';
import {budget as Budget, campaign as Campaign} from '../../models';
import {getCampaignPayouts} from '../payout.service';
import {cacheCampaign} from '../caching/create';
import {logger} from "../../../logger/winston";
import * as plan from "../../constants/plan";

export const runTaskCheckCampaignBudget = async () => {
  const campaigns = await Campaign.findAll({
    where: {status: 'ACTIVE'},
    attributes: ['id', 'campaignName'],
    include: [
      {model: Budget, attributes: ['id', 'totalBudget', 'dailyBudget', 'hourlyBudget', 'bid']},
    ],
  });

  if (campaigns.length) {
    const ids = campaigns.map((item) => item.id);
    const payouts = await getCachedPayouts(ids);

    for (const campaign of campaigns) {
      const payout = payouts.campaigns.get(campaign.id);
      if (!payout) {
        return;
      }

      const totalBudget = campaign.budget && campaign.budget.totalBudget;
      const dailyBudget = campaign.budget && campaign.budget.dailyBudget;
      const hourlyBudget = campaign.budget && campaign.budget.hourlyBudget;

      const totalPayoutSum = payout.total;
      const dailyPayoutSum = payout.daily;
      const hourlyPayoutSum = payout.hourly;

      if (totalBudget && (totalPayoutSum >= totalBudget)) {
        await suspendCampaign(campaign.id, plan.TB_EXHAUST);
        logger.info(`SUSPENDED campaign:${campaign.id} -- Exceeded total budget`)
      } else if (dailyBudget && (dailyPayoutSum >= dailyBudget)) {
        await suspendCampaign(campaign.id, plan.DB_EXHAUST);
        logger.info(`SUSPENDED campaign:${campaign.id} -- Exceeded daily budget`)
      } else if (hourlyBudget > 0 && (hourlyPayoutSum >= hourlyBudget)) {
        await suspendCampaign(campaign.id, plan.HB_EXHAUST);
        logger.info(`SUSPENDED campaign:${campaign.id} -- Exceeded hourly budget`)
      }
    }
  }
};

/**
 * Save total/daily/hourly payouts for every campaign in cache
 */
const getCachedPayouts = async (ids) => {
  let payouts = {
    campaigns: new Map(),
  };

  const total = await getCampaignPayouts(ids, null);
  payouts = buildTree(total, payouts, 'total');

  const now = moment.utc().format('YYYY-MM-DD HH:mm:ss');
  const startOfDay = moment.utc().startOf('day').format('YYYY-MM-DD HH:mm:ss');
  const daily = await getCampaignPayouts(ids, {start: startOfDay, end: now});
  payouts = buildTree(daily, payouts, 'daily');

  const startOfHour = moment.utc().startOf('hour').format('YYYY-MM-DD HH:mm:ss');
  const hourly = await getCampaignPayouts(ids, {start: startOfHour, end: now});
  payouts = buildTree(hourly, payouts, 'hourly');

  return payouts;
};

const buildTree = (campaigns, payouts, key) => {
  if (campaigns) {
    for (const item of campaigns) {
      const node = payouts.campaigns.get(item.campaign);
      if (!node) {
        payouts.campaigns.set(item.campaign, {[key]: item.payout});
      } else {
        node[key] = item.payout;
      }
    }
  }
  return payouts;
};

const suspendCampaign = async (campaignId, statusReason) => {
  // Update campaign from active to suspended
  const updated = await Campaign.update(
      {status: 'SUSPENDED', statusReason},
      {
        where: {id: campaignId},
        deactivatedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
        returning: true,
      },
  );

  const c = updated[1][0].get();
  await cacheCampaign(c);
};
