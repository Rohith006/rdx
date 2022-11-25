import {inventory as Inventory} from '../models';
import {cacheCpmCampaign} from './caching/create';

export const saveInventories = async (inventories, refField, id) => {
  try {
    const updated = [];
    await Inventory.destroy({where: {[refField]: id}});

    for (const item of inventories) {
      // Prepare data to saving
      delete item.id;
      item[refField] = id;
      // If there is no payout - use default value

      if (!Number(item.payout)) {
        item.payout = 0;
      }
      const inventory = await Inventory.create(item, {returning: true});
      updated.push(inventory.get());
    }
    return updated;
  } catch (e) {
    console.error(`Error saving inventories: ${e.message}`);
  }
};

export const connectInventoriesToCampaign = async (campaign, inventory) => {
  const clone = {...inventory};
  try {
    const result = await Inventory.findOne({where: {campaignId: campaign.id, publisherId: clone.publisherId}});
    if (result) {
      await Inventory.update(clone, {where: {campaignId: campaign.id, publisherId: clone.publisherId}});
    } else {
      clone.campaignId = campaign.id;
      await Inventory.create(clone);
    }

    const campInventories = await Inventory.findAll({where: {campaignId: campaign.id}});

    const formattedInventories = campInventories.map((item) => item.get());
    const cachedCampaign = Object.assign({}, campaign, {inventories: formattedInventories});

    await cacheCpmCampaign(cachedCampaign);
  } catch (e) {
    console.error(`Error connect inventories to campaign (id: ${campaign.id}): ${e.message}`);
  }
};
