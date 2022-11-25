import {budget as Budget} from '../models';

export const getCampaignBudget = async function(cid) {
  const budget = await Budget.findOne({where: {campaignId: cid}});
  return budget.get();
};
