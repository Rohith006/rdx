import {campaign as Campaign, Sequelize} from '../../models';
import {cacheCampaign, removeAllCampaignFromCache} from '../caching/create';

const Op = Sequelize.Op;

export const runTaskRecacheCampaign = async () => {
  const campaigns = await Campaign.findAll({
    where: {status: {[Op.ne]: 'REMOVED'}},
  });

  if (campaigns.length) {
    await removeAllCampaignFromCache();
    for (const campaign of campaigns) {
      await cacheCampaign(campaign.get());
    }
  }
};
