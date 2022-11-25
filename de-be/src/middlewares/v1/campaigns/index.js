import {publisherTypes, roles} from '../../../constants/user';
import {
    advertiser as Advertiser,
    campaign as Campaign,
    campaignTags as CampaignTags,
    inventory as Inventory,
} from '../../../models';
import * as campaignConstants from '../../../constants/campaign';
import {getCampaignsStatistics} from '../../../services/campaign.service';
import Promise from 'bluebird';
import AudienceService from '../../../services/audience.service';
import carriers from '../../../../assets/files/carriers/carriers';
import {clients} from '../../../services/clients';
import {parseQueryParams} from '../../../utils/common';
import log from '../../../../logger';

const {ADMIN, ADVERTISER} = roles;

export const createCampaignTag = async (req, res, next) => {
  try {
    const {id, role} = req.user;
    if (role === ADMIN) {
      req.body.adminId = id;
      await CampaignTags.create(req.body);
    }

    if (role === ADVERTISER) {
      req.body.advertiserId = id;
      await CampaignTags.create(req.body);
    }

    res.send(200,
    );
  } catch (e) {
    log.error(`creating campaing tag \n ${e}`)
    next(e);
  }
};

export const loadCampaignAudience = async (req, res, next) => {
  const {id} = req.params;
  try {
    const audiences = await AudienceService.getAudiences();
    res.send(audiences);
  } catch (e) {
    log.error(`loading campaign audience \n ${e}`);
    next(e);
  }
};

export const updateCampaignTag = async (req, res, next) => {
  try {
    const {role} = req.user;
    const {id} = req.body;
    const where = {
      where: {id},
    };

    if (role === ADMIN) {
      await CampaignTags.update({isChecked: req.body.isChecked}, where);
    }

    if (role === ADVERTISER) {
      await CampaignTags.update({isChecked: req.body.isChecked}, where);
    }

    res.sendStatus(200);
  } catch (e) {
    log.error(`update campaign tag \n ${e}`);
    next(e);
  }
};

export const deleteCampaignTag = async (req, res, next) => {
  try {
    const {role} = req.user;
    if (role === ADMIN) {
      await CampaignTags.destroy({where: {id: req.query.id}});
    }

    if (role === ADVERTISER) {
      await CampaignTags.destroy({where: {id: req.query.id}});
    }

    res.sendStatus(200);
  } catch (e) {
    log.error(`deleting campaign tag`);
    next(e);
  }
};

export const loadCampaignTagsList = async (req, res, next) => {
  try {
    const {id, role} = req.user;
    let tags = [];

    if (role === ADMIN) {
      tags = await CampaignTags.findAll();
    }

    if (role === ADVERTISER) {
      tags = await CampaignTags.findAll({where: {advertiserId: id}});
    }
    if (tags && tags.length) {
      tags = tags.map((el) => ({id: el.get().id, name: el.get().name, color: el.get().color}));
    }
    res.send(tags);
  } catch (e) {
    log.error(`loading campaign tags list \n ${e}`)
    next(e);
  }
};

export const loadCampaignTag = async (req, res, next) => {
  try {
    const {id, role} = req.user;
    let tags;
    const where = {
      attributes: ['id', 'name', 'color', 'isChecked'],
    };

    if (role === ADMIN) {
      tags = await CampaignTags.findAll(where);
    }

    if (role === ADVERTISER) {
      where.where.advertiserId = id;
      tags = await CampaignTags.findAll(where);
    }

    res.send(tags);
  } catch (e) {
    log.error(`load campaign tag \n ${e}`);
    next(e);
  }
};

export const loadCampaignListDropdown = async (req, res, next) => {
  try {
    const {role, id} = req.user;
    let data;
    const where = {attributes: ['id', 'campaignName'], where: {}};
    if (role === ADMIN) {
      data = await Campaign.findAll(where);
      data = data.map((el) => ({value: el.get().id, label: el.get().campaignName}));
    }
    if (role === ADVERTISER) {
      where.where.advertiserId = id;
      data = await Campaign.findAll(where);
      data = data.map((el) => ({value: el.get().id, label: el.get().campaignName}));
    }
    res.send({data});
  } catch (e) {
    log.error(`loading campaign list dropdown \n ${e}`);
    next(e);
  }
};


export const loadCampaignsStatistics = async (req, res, next) => {
  let managerAdvertisers;
  parseQueryParams(req);
  const options = {...req.query};
  if (options.selectedTag && !Array.isArray(options.selectedTag)) {
    options.selectedTag = [options.selectedTag];
  }
  try {
    if (req.user && req.user.role === roles.ADVERTISER) {
      options.advertiserId = [req.user.id];
    }

    if (req.user && req.user.role === roles.ACCOUNT_MANAGER) {
      if (!options.advertiserId) {
        managerAdvertisers = await Advertiser.findAll({
          where: {managerId: req.user.id},
          attributes: ['id'],
        });
        managerAdvertisers = managerAdvertisers.map((item) => item.get().id);
        options.advertiserId = managerAdvertisers;
        if (!managerAdvertisers.length) {
          return res.send({campaignsStatisticsList: []});
        }
      }
    }

    if (req.user && req.user.role === roles.PUBLISHER && req.user.type === publisherTypes.SSP) {
      options.modelPayment = campaignConstants.CPM;
    }

    const campaigns = await getCampaignsStatistics(options);
    // let campaignsStatisticsList = campaigns.map((c) => ({campaign: c}));

    let campaignsStatisticsList = await Promise.all(campaigns.map((campaign) => new Promise(async (resolve) => {
      const {count} = await Inventory.findAndCountAll({where: {campaignId: campaign.id}});
      const tagWhere = {
        where: {id: campaign.listTags},
        attributes: ['name', 'color'],
      };
      if (req.user.role === ADMIN) {
        campaign.tags = await CampaignTags.findAll(tagWhere);
      }
      if (req.user.role === ADVERTISER) {
        tagWhere.where.advertiserId = req.user.id;
        campaign.tags = await CampaignTags.findAll(tagWhere);
      }
      if (options.selectedTag && campaign.tags) {
        const tags = campaign.tags.map((el) => el.get().name);
        let counter = 0;
        options.selectedTag.forEach((el) => {
          if (tags.includes(el)) {
            counter++;
          }
        });
        if (!counter) {
          resolve();
        }
      }
      resolve({
        campaign: campaign,
        relatedPublishersCount: count,
      });
    })));

    const cacheData = await clients.redisClient.getAsync('cache-campaign-data');
    let data = [];
    if (cacheData) {
      data = JSON.parse(cacheData);
      campaignsStatisticsList = campaignsStatisticsList.map((c) => {
        const stat = data.find((i) => i.campaignId === c.campaign.id);
        if (stat) {
          if (roles.ACCOUNT_MANAGER === req.user.role) {
            !req.user.permissions.includes('ADVERTISERS') && delete stat.revenue;
            !req.user.permissions.includes('PUBLISHERS') && delete stat.payout;
            !req.user.permissions.includes('SEE_PROFIT') && delete stat.profit;
          }
          return {
            ...c,
            ...stat,
          };
        } else {
          return c;
        }
      });
    }
    campaignsStatisticsList = campaignsStatisticsList.filter((el) => el);
    res.send({campaignsStatisticsList});
  } catch (e) {
    log.error(`loading campaign statistics \n ${e.stack}`);
    next(e);
  }
};

export const loadCampaignsCarriers = async (req, res, next) => res.send(carriers);
