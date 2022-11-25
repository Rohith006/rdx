import {budget as Budget, campaign as Campaign, Sequelize} from '../../models';
import {cacheExcludeList, getCampaignImpsCounter} from '../caching/create';

const Op = Sequelize.Op;

export const  runTaskExcludeCampaign = async () => {
  const campaigns = await Campaign.findAll({
    where: {status: 'ACTIVE', ctr: {[Op.ne]: null}},
    attributes: ['id', 'ctr'],
    include: [
      {model: Budget, attributes: ['id', 'totalBudget', 'bid']},
    ],
  });

  if (campaigns.length) {
    const excludeIds = [];

    for (const campaign of campaigns) {
      const impressions = await getCampaignImpsCounter(campaign.id);
      if (!impressions) {
        return;
      }

      const totalBudget = campaign.budget && campaign.budget.totalBudget;
      const bidPrice = campaign.budget && campaign.budget.bid;
      const countClicks = totalBudget / bidPrice;
      const countImpressions = countClicks / (campaign.ctr / 100);
      if (Number(impressions) >= Number(countImpressions)) {
        // console.log('ctr', campaign.ctr);
        // console.log('clicksCap', countClicks);
        // console.log('impCap', countImpressions);
        // console.log('imp real total', impressions);
        excludeIds.push(campaign.id);
      }
    }
    await cacheExcludeList(excludeIds);
  }
};
