import {cacheCampaign} from '../caching/create';
import {campaign as Campaign} from '../../models';
import {logger} from "../../../logger/winston";
import * as plan from "../../constants/plan";

export const runTaskAutorunCampaignBudgetHourly = async () => {
  let count=0;
  const campaigns = await Campaign.findAll({
    where: {status: 'SUSPENDED'},
    attributes: ['id', 'statusReason'],
  });

  if (campaigns.length) {
    for (const campaign of campaigns) {
      if (campaign.statusReason === plan.HB_EXHAUST) {
        count++;
        await activateCampaign(campaign.id);
      }
    }
    logger.info(`Hourly suspended campaigns activation count:${count}`)
  }
};


export const runTaskAutorunCampaignBudgetDaily = async () => {
 let count = 0;
 const campaigns = await Campaign.findAll({
   where: {status:'SUSPENDED'},
   attributes: ['id','statusReason']
 });

 if(campaigns.length){
   for(const campaign of campaigns){
     if(campaign.statusReason === plan.DB_EXHAUST){
       count++;
       await activateCampaign(campaign.id);
     }
   }
   logger.info(`Daily suspended campaigns activation count:${count}`)
 }
}
const activateCampaign = async (campaignId) => {
  // Update campaign from suspended to  active
  const updated = await Campaign.update(
      {status: 'ACTIVE', statusReason: null},
      {
        where: {id: campaignId},
        returning: true,
      },
  );

  const c = updated[1][0].get();
  await cacheCampaign(c);
};
