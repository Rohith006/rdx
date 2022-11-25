import {budget as Budget, campaign as Campaign, Sequelize,} from '../models';
import {ALL} from '../constants/campaign';
import * as InventoryService from '../services/inventoryService';

const Op = Sequelize.Op;

export const autoConnectToAllDemand = async (pub) => {
  // Auto-connect publisher to all demand
  const inventory = {
    name: pub.name,
    payout: pub.payout,
    publisherId: pub.id,
    rtbProtocolVersion: pub.rtbProtocolVersion,
    protocolType: pub.protocolType,
    trafficType: pub.trafficType,
    adType: pub.adType,
    bidType: pub.bidType,
  };

  const options = {
    where: {
      modelPayment: pub.bidType,
      trafficType: pub.trafficType,
      monetizationType: {[Op.in]: pub.adType},
    },
    include: [{model: Budget}],
  };

  if (pub.adType.includes(ALL)) {
    delete options.where.monetizationType;
  }

  const campaigns = await Campaign.findAll(options);
  for (const campaign of campaigns) {
    await InventoryService.connectInventoriesToCampaign(campaign.get(), inventory);
  }

};
