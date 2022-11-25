import {inventory as Inventory} from '../models';

export const getCampaignInventories = async function(cid) {
  const invs = await Inventory.findAll({where: {campaignId: cid}});
  return invs.map((item) => item.get());
};
