import {roles} from '../constants/user';
import * as campaignConstants from '../constants/campaign';
import {budget as Budget, campaign as Campaign, campaignTags as CampaignTags,  campaignAudience as CampaignAudience} from '../models';
import {cacheBudget, cacheCampaign, cacheCheckItem, cacheCpmCampaign} from '../services/caching/create';
import CreativeService from '../services/creative.service';
import * as InventoryService from '../services/inventoryService';
import {prepareEntityLogInfo} from '../services/logging/create';
import {eventTypes} from '../constants/eventType';
import {sendForAdQualityCheck} from '../services/adQualityCheck.service';
import log from '../../logger';

// TODO continue refactoring
class CampaignController {
  static async createCampaign(req, res, next) {
    log.info('server.rest.database.create.createCampaign')
    //const token = req.headers.authorization.split(' ')[1];
    const {campaign, creatives} = req.body;
    const advertiserId = campaign.advertiserId || req.user.id;
    campaign.selfServed = req.user.role === roles.ADVERTISER;
    campaign.tagsList.forEach((el) => {
      if (el.delete) {
        CampaignTags.destroy({where: {id: el.id}});
      }
    });
    campaign.listTags = campaign.tagsList.filter((el) => el.isChecked).map((el) => el.id);
    if (!campaign.isDayPartingEnable) {
      campaign.dayParting = null;
    }
    /*
    campaign.monetizationType = [campaignConstants.MONETIZATION.NATIVE].includes(campaign.monetizationType) ?
        campaignConstants.MONETIZATION.NATIVE:
        campaign.monetizationType;
     */

    try {
      if (campaign.modelPayment !== campaignConstants.CPM) {
        campaign.status = campaignConstants.NEW;
      }
      let created = await Campaign.create({...campaign, advertiserId});
      if (campaign.isDuplicate) {
        if (campaign.creatives && campaign.creatives.ads) {
          const arr = campaign.creatives.ads.map((c) => {
            c.id = Number(c.id) + created.id;
            return c;
          });
          created = await Campaign.update({creatives: {ads: arr}}, {where: {id: created.id}, returning: true});
          created = created[1][0];
        }
      }

      delete campaign.id;
      delete campaign.budget.id;


      for (const key in campaign.budget) {
        if (!campaign.budget[key] && typeof campaign.budget[key] !== 'boolean' && typeof campaign.budget[key] !== 'number') {
          campaign.budget[key] = null;
        }
      }

      campaign.budget.currentBid = campaign.budget.bid;
      const budget = await Budget.create({...campaign.budget, campaignId: created.id});
      await cacheBudget(budget.get());
      created.get().budget = budget.get();

      const campaignAudiences =  await CampaignAudience.create({
        ...campaign.campaignAudiences,
        campaignId: created.id
      });

      if (campaign.monetizationType === campaignConstants.MONETIZATION.BANNER) {
        /**
         * Banner JS/HTML TAG
         */
        await CreativeService.addCreativeTag(created.id, campaign);
      }

      if (creatives.length) {
        if ([campaignConstants.MONETIZATION.NATIVE].includes(campaign.monetizationType)) {
          await CreativeService.uploadNativeCreatives(created.id, creatives);
        } else if ([campaignConstants.MONETIZATION.VIDEO].includes(campaign.monetizationType)) {
          await CreativeService.uploadVideoCreatives(created.id, creatives);
        } else if([campaignConstants.MONETIZATION.AUDIO].includes(campaign.monetizationType)){
          console.log('START UPLOAD AUDIO CREATIVE');
          await CreativeService.uploadAudioCreatives(created.id, creatives);
        } else {
          await CreativeService.upload(created.id, creatives, campaign.monetizationType);
        }
      }else{
        console.log('CREATIVES LENGTH IS 0')
      }

      if ((campaign.modelPayment === campaignConstants.CPM || campaign.modelPayment === campaignConstants.CPC || campaign.modelPayment === campaignConstants.CPA) &&
          campaign.inventories) {
        const myInventories = campaign.inventories ? Object.values(campaign.inventories) : [];
        const inventories = await InventoryService.saveInventories(myInventories, 'campaignId', created.id, created.isPmpSupport);

        let cachingObject = created.get();

        if (inventories && inventories.length) {
          // TODO Need to discuss - maybe we don't need payout field
          cachingObject = Object.assign(cachingObject, {payout: inventories[0].payout, inventories});
        }

        await cacheCpmCampaign(cachingObject);
      } else {
        await cacheCampaign(created.get());
      }

      if (!created.disableTestLink && campaign.modelPayment !== campaignConstants.CPM) {
        const obj = {
          campaignId: created.id,
          status: created.status,
        };
        await cacheCheckItem(obj);
      }

      await sendForAdQualityCheck(created.id, true)

      res.locals.loggedObject = prepareEntityLogInfo({}, {user: created.get()}, eventTypes.CAMPAIGN_NEW, 'campaign');
      res.locals.response = {campaign: created.get(), budget: budget.get(), campaignAudiences: campaignAudiences};
      next();
    } catch (e) {
      log.error(`creating campaign \n ${e}`);
      next(e);
    }
  }

  static async createExternalCampaign(req, res, next) {
    log.info('server.rest.database.create.external.createCampaign')
    const {campaign, creatives} = req.body;
    const advertiserId = req.user.id;
    campaign.selfServed = true;
    campaign.inventoryControl = "SELECT_INVENTORY_SOURCE";
    campaign.budgetAdvancedOptions = true;
    campaign.accessStatus = "PRIVATE";
    campaign.clicksLifespan = "1h";
    campaign.tagsList.forEach((el) => {
      if (el.delete) {
        CampaignTags.destroy({where: {id: el.id}});
      }
    });
    campaign.listTags = campaign.tagsList.filter((el) => el.isChecked).map((el) => el.id);
    if (!campaign.isDayPartingEnable) {
      campaign.dayParting = null;
    }
    campaign.monetizationType = [campaignConstants.MONETIZATION.NATIVE].includes(campaign.monetizationType) ?
      campaignConstants.MONETIZATION.NATIVE:
      campaign.monetizationType;

    try {
      if (campaign.modelPayment !== campaignConstants.CPM) {
        campaign.status = campaignConstants.NEW;
      }
      let created = await Campaign.create({...campaign, advertiserId});
      if (campaign.isDuplicate) {
        if (campaign.creatives && campaign.creatives.ads) {
          const arr = campaign.creatives.ads.map((c) => {
            c.id = Number(c.id) + created.id;
            return c;
          });
          created = await Campaign.update({creatives: {ads: arr}}, {where: {id: created.id}, returning: true});
          created = created[1][0];
        }
      }

      delete campaign.id;
      delete campaign.budget.id;
      for (const key in campaign.budget) {
        if (!campaign.budget[key]) {
          campaign.budget[key] = null;
        }
      }
      campaign.budget.currentBid = campaign.budget.bid;
      const budget = await Budget.create({...campaign.budget, campaignId: created.id});
      await cacheBudget(budget.get());
      created.get().budget = budget.get();

      if (campaign.monetizationType === campaignConstants.MONETIZATION.BANNER) {
        /**
         * Banner JS/HTML TAG
         */
        await CreativeService.addCreativeTag(created.id, campaign);
      }

      if (creatives.length) {
        if ([campaignConstants.MONETIZATION.NATIVE].includes(campaign.monetizationType)) {
          await CreativeService.uploadNativeCreatives(created.id, creatives);
        } else if ([campaignConstants.MONETIZATION.VIDEO].includes(campaign.monetizationType)) {
          await CreativeService.uploadVideoCreatives(created.id, creatives);
        } else {
          await CreativeService.upload(created.id, creatives, campaign.monetizationType);
        }
      }

      if ((campaign.modelPayment === campaignConstants.CPM || campaign.modelPayment === campaignConstants.CPC) &&
          campaign.inventories) {
        const myInventories = campaign.inventories ? Object.values(campaign.inventories) : [];
        const inventories = await InventoryService.saveInventories(myInventories, 'campaignId', created.id, created.isPmpSupport);

        let cachingObject = created.get();

        if (inventories && inventories.length) {
          // TODO Need to discuss - maybe we don't need payout field
          cachingObject = Object.assign(cachingObject, {payout: inventories[0].payout, inventories});
        }

        await cacheCpmCampaign(cachingObject);
      } else {
        await cacheCampaign(created.get());
      }

      if (!created.disableTestLink && campaign.modelPayment !== campaignConstants.CPM) {
        const obj = {
          campaignId: created.id,
          status: created.status,
        };
        await cacheCheckItem(obj);
      }

      res.locals.loggedObject = prepareEntityLogInfo({}, {user: created.get()}, eventTypes.CAMPAIGN_NEW, 'campaign');
      res.locals.response = {campaign: created.get(), budget: budget.get()};
      next();
    } catch (e) {
      log.error(`creating campaign \n ${e}`);
      next(e);
    }
  }
}

module.exports = CampaignController;
