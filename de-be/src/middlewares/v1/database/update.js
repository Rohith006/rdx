import moment from 'moment';
import createError from 'http-errors';

import {
    admin as Admin,
    advertiser as Advertiser,
    billingDetails as BillingDetails,
    budget as Budget,
    campaign as Campaign,
    campaignTags as CampaignTags,
    forgotPassword as ForgotPassword,
    inventory as Inventory,
    partnerFees as PartnerFees,
    platformSettings as PlatformSettings,
    publisher as Publisher,
    resolution as Resolution,
    campaignAudience as CampaignAudience,
    Sequelize,
} from '../../../models';
import * as campaignConstants from '../../../constants/campaign';
import {ACTIVE, CPC, CPM, MESSAGE_BALANCE, PAUSED} from '../../../constants/campaign';
import {APPROVED, PENDING} from '../../../constants/forgotPassword';
import {roles, statuses} from '../../../constants/user';
import {sendTemplatedEmail} from '../../../utils/sendEmail';
import {emailTypes} from '../../../constants/emails';
import {email as emailConfig, MINIMUM_BALANCE, uiHost} from '../../../../config';
import {
    cacheAdvertiserUpdate,
    cacheCampaign,
    cacheCampaignStatus,
    cacheCheckItem,
    cachePublisherUpdate,
    cacheRemoveCheckItem,
} from '../../../services/caching/create';
import {
    prepareChangeManagerStatusLogInfo,
    prepareChangeUserStatusLogInfo,
    prepareSimpleLogInfo,
    prepareUserLogInfo,
} from '../../../services/logging/create';
import checkDate from '../../../utils/checkDate';
import {checkAdvertiserBalance} from '../../../utils/checkAdvertiserBalance';
import {eventTypes} from '../../../constants/eventType';
import CreativeService from '../../../services/creative.service';
import * as InventoryService from '../../../services/inventoryService';
import {AD_TYPE} from '../../../constants/common';
import {autoConnectToAllDemand} from '../../../utils/publisher';
import {getAvailableAdvertisers} from '../advertisers';
import _ from 'lodash';
import {sendForAdQualityCheck} from '../../../services/adQualityCheck.service';
import log from '../../../../logger';

const Op = Sequelize.Op;
const configUser = {
  advertiser: Advertiser,
  publisher: Publisher,
  admin: Admin,
  account_manager: Admin,
};

export const updateCampaign = async (req, res, next) => {
  try{
    log.info('server.rest.database.update.updateCampaign')

    const {campaign, creatives} = req.body;
    for (const key in campaign) {
      if (campaign[key] === '') {
        campaign[key] = null;
      }
    }
    checkDate(campaign);
    let updatedCampaign = {};
    let updatedBudget = {};
    let updatedCampaignAudience = {}
    if (campaign.createdResolutions) {
      const createResolutions = campaign.createdResolutions.map((el) => {
        const arr = el.split('x');
        return {width: arr[0], height: arr[1]};
      });
      if (createResolutions && createResolutions.length) {
        await Resolution.bulkCreate(createResolutions, {ignoreDuplicates: true});
      }
    };

    campaign.tagsList.forEach((el) => {
      if (el.delete) {
        CampaignTags.destroy({where: {id: el.id}});
      }
    });

    campaign.listTags = campaign.tagsList.filter((el) => el.isChecked).map((el) => el.id);
    delete campaign.id;
    delete campaign.createdAt;
    delete campaign.updatedAt;
    delete campaign.creatives;

    if (!campaign.isDayPartingEnable) {
      campaign.dayParting = null;
    }
    const advertiser = await Advertiser.findOne({where: {id: campaign.advertiserId}});
    let currentCampaign = await Campaign.findOne({
      where: {id: campaign.campaignId},
      include: [{model: Budget}, {model: CampaignAudience}],
    });

  /*
    if (campaign.status === ACTIVE && advertiser.balance < MINIMUM_BALANCE) {
      return res.json({success: false, msg: 'minimum balance to run the campaign is 10$'});
    }
  */

    if (advertiser.status === statuses.PAUSED) {
      campaign.status = PAUSED;
    }

    const result = await Campaign.update(campaign, {where: {id: campaign.campaignId}, returning: true});
    if (result[1].length !== 0) {
      updatedCampaign = result[1][0].get();
      /*
      for (const key in campaign.budget) {
          if (!campaign.budget[key]) {
            campaign.budget[key] = null;
          }
        }
      }
     */
      if (currentCampaign.budget.bid !== campaign.budget.bid) {
        campaign.budget.currentBid = campaign.budget.bid;
      }
      updatedBudget = await Budget.update(campaign.budget, {where: {campaignId: campaign.campaignId}, returning: true});
      updatedBudget = updatedBudget[1][0].get();
      
     updatedCampaignAudience = await CampaignAudience.update(campaign.campaignAudiences, {where: {campaignId: campaign.campaignId}, returning: true})

      let cachingObject

      if (campaign.modelPayment === CPM || campaign.modelPayment === CPC) {
        cachingObject = updatedCampaign;
        if (req.user.role !== roles.ACCOUNT_MANAGER) {
          const inv = campaign.inventories ? Object.values(campaign.inventories) : [];
          const inventories = await InventoryService.saveInventories(inv, 'campaignId', updatedCampaign.id);

          if (inventories.length) {
            // TODO Need to discuss - maybe we don't need payout field
            cachingObject = Object.assign(cachingObject, {payout: inventories[0].payout, inventories});
          }
        }
        // FIXME
        cachingObject.budget = {
          bid: Number(updatedBudget.bid),
          dailyBudget: updatedBudget.dailyBudget!==null ? Number(updatedBudget.dailyBudget): null,
          hourlyBudget: updatedBudget.hourlyBudget!==null ? Number(updatedBudget.hourlyBudget): null,
          totalBudget: updatedBudget.totalBudget!==null ? Number(updatedBudget.totalBudget): null,
        };
      }
      await cacheCampaign(updatedCampaign);

      if (!updatedCampaign.disableTestLink) {
        const obj = {
          campaignId: updatedCampaign.id,
          status: updatedCampaign.status,
        };
        await cacheCheckItem(obj);
      } else {
        await cacheRemoveCheckItem(updatedCampaign.id);
      }
    }

    if (creatives.length) {
      if ([campaignConstants.MONETIZATION.NATIVE].includes(updatedCampaign.monetizationType)) {
        await CreativeService.updateNativeCreatives(updatedCampaign.id, creatives);
      } else if ([campaignConstants.MONETIZATION.VIDEO].includes(updatedCampaign.monetizationType)) {
        await CreativeService.updateVideoCreatives(updatedCampaign.id, creatives);
      } else if ([campaignConstants.MONETIZATION.AUDIO].includes(updatedCampaign.monetizationType)){
        await CreativeService.updateAudioCreatives(updatedCampaign.id, creatives);
      }
      else {
        await CreativeService.upload(updatedCampaign.id, creatives);
      }
    }

  if (updatedCampaign && updatedCampaign.monetizationType === AD_TYPE.BANNER) {
    await CreativeService.updateTag(updatedCampaign.id, campaign);
  }
  currentCampaign = currentCampaign.dataValues;
  let tempBudget = currentCampaign.budget.dataValues;
  delete currentCampaign.budget;
  delete updatedCampaign.budget;
  currentCampaign = Object.assign(currentCampaign, {
    isBidRange:tempBudget.isBidRange,
    minBid: tempBudget.minBid,
    maxBid: tempBudget.maxBid,
    bid: tempBudget.bid,
    dailyBudget: tempBudget.dailyBudget,
    hourlyBudget: tempBudget.hourlyBudget,
    totalBudget: tempBudget.totalBudget,
  });
  updatedCampaign = Object.assign(updatedCampaign, updatedBudget);
  res.locals.loggedObject = prepareUserLogInfo({user: currentCampaign}, {user: updatedCampaign}, eventTypes.CAMPAIGN_EDIT);
  /* res.locals.response = {user: updatedCampaign};
    Changed response key from user to campaign and added success: true & updated budget field
  */
  res.locals.response = {campaign: updatedCampaign, success: true, budget:updatedBudget, campaignAudiences: updatedCampaignAudience};
    next()
  } catch (err) {
    log.error("update campaign status \n \n", err)
    next()
  };
};

export const updateExternalCampaign = async (req, res, next) => {
  log.info('server.rest.database.external.update.updateCampaign')

  const {campaign, creatives} = req.body;
  for (const key in campaign) {
    if (campaign[key] === '') {
      campaign[key] = null;
    }
  }
  checkDate(campaign);
  let updatedCampaign = {};
  let updatedBudget = {};
  updatedCampaign.inventoryControl = "SELECT_INVENTORY_SOURCE";
  updatedCampaign.impressionTtl = 20;
  updatedCampaign.clickTtl = 48;

  if (campaign.createdResolutions) {
    const createResolutions = campaign.createdResolutions.map((el) => {
      const arr = el.split('x');
      return {width: arr[0], height: arr[1]};
    });
    if (createResolutions && createResolutions.length) {
      await Resolution.bulkCreate(createResolutions, {ignoreDuplicates: true});
    }
  }
  campaign.tagsList.forEach((el) => {
    if (el.delete) {
      CampaignTags.destroy({where: {id: el.id}});
    }
  });

  campaign.listTags = campaign.tagsList.filter((el) => el.isChecked).map((el) => el.id);
  delete campaign.id;
  delete campaign.createdAt;
  delete campaign.updatedAt;
  delete campaign.creatives;

  if (!campaign.isDayPartingEnable) {
    campaign.dayParting = null;
  }
  const advertiser = await Advertiser.findOne({where: {id: campaign.advertiserId}});
  const currentCampaign = await Campaign.findOne({
    where: {id: campaign.campaignId},
    include: [{model: Budget}],
  });

  if (campaign.status === ACTIVE && advertiser.balance < MINIMUM_BALANCE) {
    return res.json({success: false, msg: 'minimum balance to run the campaign is 10$'});
  }

  if (advertiser.status === statuses.PAUSED) {
    campaign.status = PAUSED;
  }

  const result = await Campaign.update(campaign, {where: {id: campaign.campaignId}, returning: true});
  if (result[1].length !== 0) {
    updatedCampaign = result[1][0].get();
    for (const key in campaign.budget) {
      if (!campaign.budget[key]) {
        campaign.budget[key] = null;
      }
    }
    if (currentCampaign.budget.bid !== campaign.budget.bid) {
      campaign.budget.currentBid = campaign.budget.bid;
    }
    updatedBudget = await Budget.update(campaign.budget, {where: {campaignId: campaign.campaignId}, returning: true});
    updatedBudget = updatedBudget[1][0].get();

    if (campaign.modelPayment === CPM || campaign.modelPayment === CPC) {
      let cachingObject = updatedCampaign;
      if (req.user.role !== roles.ACCOUNT_MANAGER) {
        const inv = campaign.inventories ? Object.values(campaign.inventories) : [];
        const inventories = await InventoryService.saveInventories(inv, 'campaignId', updatedCampaign.id);

        if (inventories.length) {
          // TODO Need to discuss - maybe we don't need payout field
          cachingObject = Object.assign(cachingObject, {payout: inventories[0].payout, inventories});
        }
      }
      // FIXME

      cachingObject.budget = {
        isBidRange: Boolean(updatedBudget.isBidRange),
        minBid: Number(updatedBudget.minBid),
        maxBid:Number(updatedBudget.maxBid),
        bid: Number(updatedBudget.bid),
        dailyBudget: Number(updatedBudget.dailyBudget),
        hourlyBudget: Number(updatedBudget.hourlyBudget),
        totalBudget: Number(updatedBudget.totalBudget),
      };
    }
    await cacheCampaign(updatedCampaign);

    if (!updatedCampaign.disableTestLink) {
      const obj = {
        campaignId: updatedCampaign.id,
        status: updatedCampaign.status,
      };
      await cacheCheckItem(obj);
    } else {
      await cacheRemoveCheckItem(updatedCampaign.id);
    }
  }

  if (creatives.length) {
    if ([campaignConstants.MONETIZATION.NATIVE].includes(updatedCampaign.monetizationType)) {
      await CreativeService.updateNativeCreatives(updatedCampaign.id, creatives);
    } else if ([campaignConstants.MONETIZATION.VIDEO].includes(updatedCampaign.monetizationType)) {
      await CreativeService.updateVideoCreatives(updatedCampaign.id, creatives);
    }  else if([campaignConstants.MONETIZATION.AUDIO].includes(updatedCampaign.monetizationType)){
      await CreativeService.updateVideoCreatives(updatedCampaign.id, creatives)
    }else {
      await CreativeService.upload(updatedCampaign.id, creatives);
    }
    await sendForAdQualityCheck(updatedCampaign.id, false)
  }

  if (updatedCampaign.monetizationType === AD_TYPE.BANNER) {
    await CreativeService.updateTag(updatedCampaign.id, campaign);
  }

  delete updatedCampaign.advertisingChannel;
  delete updatedCampaign.appLink;
  delete updatedCampaign.appImage;
  delete updatedCampaign.fqCapClick;
  delete updatedCampaign.fqCapClickValue;
  delete updatedCampaign.fqCapClickInterval;
  delete updatedCampaign.appTrackName;
  delete updatedCampaign.appDescription;
  delete updatedCampaign.offerDescription;
  delete updatedCampaign.titleXml;
  delete updatedCampaign.descriptionXml;
  delete updatedCampaign.enableNotifications;
  delete updatedCampaign.notificationsThreshold;
  delete updatedCampaign.selfServed;
  delete updatedCampaign.confirmedCopyrightOwnership;
  delete updatedCampaign.enableCrThreshold;
  delete updatedCampaign.lowestCrThreshold;
  delete updatedCampaign.highestCrThreshold;
  delete updatedCampaign.kpiType;
  delete updatedCampaign.clicksLifespan;
  delete updatedCampaign.apiCampaignId;
  delete updatedCampaign.disableTestLink;
  delete updatedCampaign.paymentType;
  delete updatedCampaign.statusReason;
  delete updatedCampaign.goals;
  delete updatedCampaign.cappingType;
  delete updatedCampaign.cap;
  delete updatedCampaign.applyChannelRule;
  delete updatedCampaign.isPmpSupport;
  delete updatedCampaign.deactivatedAt;
  delete updatedCampaign.inExGeomode;
  delete updatedCampaign.conversionTrackingTag;
  delete updatedCampaign.sdmin;
  delete updatedCampaign.sdmax;
  delete updatedCampaign.impressionTtl;
  delete updatedCampaign.clickTtl;
  delete updatedCampaign.minWinRate;
  delete updatedCampaign.bidStep;
  delete updatedCampaign.isBiddingOptimization;

  res.send({
    campaign: updatedCampaign,
    budget: updatedBudget,
    success: true,
  });
};

export const updateCampaignStatus = async (req, res, next) => {
  const {ids, status, statusReason} = req.body;
  try {
    const campaigns = await Campaign.findAll({
      where: {
        id: ids,
      },
      attributes: ['advertiserId', 'id', 'campaignName','status'],
      include: [
        {
          model: Advertiser,
          attributes: ['status', 'name', 'id'],
        },
      ],
    });

    const campaignsIds = campaigns.filter((el) => (el.get().advertiser.status !== 'REMOVED' && el.get().advertiser.status !=='SUSPENDED' && el.get().advertiser.status !== 'PENDING')).map((el) => el.get().id);
    const invalidCampaigns = campaigns.filter((el) => (el.get().advertiser.status === 'REMOVED' || el.get().advertiser.status ==='PAUSED' || el.get().advertiser.status ==='SUSPENDED' || el.get().advertiser.status === 'PENDING'))
        .map((el) => ({
          id: el.get().id,
          campaignName: el.get().campaignName,
          advertiserId: el.get().advertiser.get().id,
          name: el.get().advertiser.get().name,
        }));

    await Campaign.update(
        {status, statusReason},
        {
          where: {id: campaignsIds},
          include: [
            {
              model: Advertiser,
              attributes: ['status'],
              where: {
                status: {[Op.ne]:['REMOVED','PENDING','SUSPENDED']},
              },
            },
          ],
          returning: true,
        },
    );

    const campaignsUpdated = await Campaign.findAll({where: {id: ids}});

    campaignsUpdated.map(async (campaign) => {
      const campaignData = campaign.get();
      await cacheCampaignStatus(campaignData);

      if (!campaign.disableTestLink) {
        const obj = {
          campaignId: campaign.id,
          status: campaign.status,
        };
        await cacheCheckItem(obj);
      } else {
        await cacheRemoveCheckItem(campaign.id);
      }
    });
    // TODO Send email notifications to advertisers/publishers if status is PAUSED/DELETED
    if (invalidCampaigns.length) {
      let list = '';
      let adverList = '';
      invalidCampaigns.forEach((el) => {
        list += `${el.campaignName} - ${el.id},`;
        adverList += `${el.name} - ${el.advertiserId},`;
      });
      if(req.user.role === 'ADVERTISER'){
        res.json({
          message: {
            type: 'warning',
            text: `Campaigns '${list}' can't be activated because your account is not active.`,
          },
        });
      } else {
        res.json({
          message: {
            type: 'warning',
            text: `Campaigns '${list}' can't be activated because Advertiser '${adverList}' is not active.`,
          },
        });
      }
    } else {
      res.locals.loggedObject = prepareChangeUserStatusLogInfo(campaigns, status, eventTypes[`CAMPAIGN_${status}`]);
      res.locals.response = {
        message: {
          type: 'success',
          text: 'Campaign status has been changed',
        },
      };
      next();
    }
  } catch (e) {
    log.error(`updating campaign status \n ${e}`)
    next(e);
  }
};

export const updateExternalCampaignStatus = async (req, res) => {
  const {ids, status, statusReason} = req.body;
  try {
    const campaigns = await Campaign.findAll({
      where: {
        id: ids,
      },
      attributes: ['advertiserId', 'id', 'campaignName'],
      include: [
        {
          model: Advertiser,
          attributes: ['status', 'name', 'id'],
        },
      ],
    });

    const campaignsIds = campaigns.filter((el) => (el.get().advertiser.status !== 'REMOVED' && el.get().advertiser.status !=='SUSPENDED')).map((el) => el.get().id);
    const invalidCampaigns = campaigns.filter((el) => (el.get().advertiser.status === 'REMOVED' || el.get().advertiser.status ==='SUSPENDED'))
        .map((el) => ({
          id: el.get().id,
          campaignName: el.get().campaignName,
          advertiserId: el.get().advertiser.get().id,
          name: el.get().advertiser.get().name,
        }));

    await Campaign.update(
        {status, statusReason},
        {
          where: {id: campaignsIds},
          include: [
            {
              model: Advertiser,
              attributes: ['status'],
              where: {
                status: {[Op.notIn]:['REMOVED','SUSPENDED']},
              },
            },
          ],
          returning: true,
        },
    );

    const campaignsUpdated = await Campaign.findAll({where: {id: ids}});

    campaignsUpdated.map(async (campaign) => {
      const campaignData = campaign.get();
      await cacheCampaignStatus(campaignData);

      if (!campaign.disableTestLink) {
        const obj = {
          campaignId: campaign.id,
          status: campaign.status,
        };
        await cacheCheckItem(obj);
      } else {
        await cacheRemoveCheckItem(campaign.id);
      }
    });
    // TODO Send email notifications to advertisers/publishers if status is PAUSED/DELETED
    if (invalidCampaigns.length) {
      let list = '';
      let adverList = '';
      invalidCampaigns.forEach((el) => {
        list += `${el.campaignName} - ${el.id},`;
        adverList += `${el.name} - ${el.advertiserId},`;
      });
      res.json({
        message: {
          type: 'warning',
          text: `Campaigns '${list}' can't be activated because Advertiser '${adverList}' is removed/suspended`,
        },
      });
    } else {
      res.json({
        message: {
          type: 'success',
          text: 'Campaign status has been changed',
        },
      });
    }
  } catch (e) {
    log.error(`updating campaign status \n ${e}`)
    next(e);
  }
};

export const submitCampaign = async (req, res, next) => {
  try {
    const {campaignId} = req.body;

    const updateResult = await Campaign.update({
      // status: PENDING
    }, {
      where: {
        id: campaignId,
      },
      returning: true,
    });

    const campaign = updateResult[1][0];

    if (!campaign) {
      return res.send({error: 'Campaign not found', data: null});
    }

    await cacheCampaign(campaign.get());

    const user = await Advertiser.findOne({
      where: {
        id: campaign.advertiserId,
      },
    });

    if (user.balance < MINIMUM_BALANCE) {
      const updateResult = await Campaign.update({
        status: PAUSED,
      }, {
        where: {
          id: campaignId,
        },
        returning: true,
      });
      return res.send({success: false, error: 'balance', msg: MESSAGE_BALANCE, data: updateResult[1][0]});
    }

    return res.send({error: null, success: true, data: campaign});
  } catch (e) {
    log.error(`submitting campaign \n ${e}`);
    next(e);
  }
};

export const updatePassword = async (req, res, next) => {
  try {
    const {restoreKey, password} = req.body;

    const restorePassword = await ForgotPassword.findOne({where: {restoreKey}});
    if (restorePassword) {
      if (restorePassword.status === PENDING) {
        if (moment(restorePassword.updatedAt).format('x') > moment().subtract('3', 'days').format('x')) {
          const Model = configUser[restorePassword.userType.toLowerCase()];

          const updateResult = await Model.update({password}, {
            where: {id: restorePassword.userId},
            returning: true,
          });
          const userData = updateResult[1][0].dataValues;
          const userInfo = {
            role:userData.role,
            id:userData.id,
            email:userData.email,
            name:userData.name,
          }
          // TODO add proper caching
          // if (updateResult[1][0])
          //     cacheUser(updateResult[1][0].get());
          ForgotPassword.update({status: APPROVED}, {where: {restoreKey}});
          res.locals.loggedObject = prepareSimpleLogInfo(userInfo, eventTypes.USER_PASSWORD_RECOVERY);
          res.locals.user = updateResult[1][0];

          next();
        } else {
          throw {
            message: 'Restore key elapsed, try again',
            path: 'serverError',
            status: 400,
          };
        }
      } else {
        throw {
          message: 'Password already changed',
          path: 'serverError',
          status: 400,
        };
      }
    } else {
      throw {
        message: 'Update password failed',
        path: 'serverError',
        status: 400,
      };
    }
  } catch (e) {
    log.error(`updating password \n ${e}`);
    next(e);
  }
};

export const updatePublisherStatus = async (req, res, next) => {
  try {
    const {ids, status} = req.body;
    const publishers = await Publisher.findAll({
      where: {id: ids},
      attributes: ['id', 'email', 'status'],
    });
    const userData = await Publisher.update({status}, {where: {id: ids}, returning: true});
    const users = userData[1];
    users.forEach(({dataValues}) => {
      cachePublisherUpdate(dataValues);
      if (status === statuses.APPROVED) {
        sendTemplatedEmail({
          to: dataValues.email,
          subject: 'Your Account Has Been Approved !',
        }, {
          name: dataValues.name,
          uiHost,
          adminEmail: emailConfig.authUser,
        }, emailTypes.PUBLISHER_ACCOUNT_VERIFIED_TO_PUBLISHER);
      }
    });
    res.locals.loggedObject = prepareChangeUserStatusLogInfo(publishers, status, eventTypes[`PUBLISHER_${status}`]);
    res.locals.response = 'OK';
    next();
  } catch (e) {
    log.error(`updating publisher statistics \n ${e}`);
    next(e);
  }
};

export const updateAdvertiserStatus = async (req, res, next) => {
  const {ids, status} = req.body;

  try {
    const advertisers = await Advertiser.findAll({
      where: {id: ids},
      attributes: ['id', 'email', 'status'],
    });

    const userData = await Advertiser.update(
        {status},
        {
          where: {id: ids},
          returning: true,
        },
    );

    // Paused all advertiser's campaigns
    if (status === statuses.PAUSED) {
      await Campaign.update({status: PAUSED}, {where: {advertiserId: ids}});
    }

    const users = userData[1];

    // TODO Add user notifications about changing status
    users.forEach(({dataValues}) => cacheAdvertiserUpdate(dataValues));

    res.locals.loggedObject = prepareChangeUserStatusLogInfo(advertisers, status, eventTypes[`ADVERTISER_${status}`]);
    res.message = {
      ids: ids,
      status: status,
    };

    next();
  } catch (e) {
    log.error(`updating advertiser status \n ${e}`)
    next(e);
  }
};

export const updateAdminStatus = async (req, res, next) => {
  try {
    const {ids, status} = req.body;

    const user = await Admin.findOne({where: {id: ids}});

    res.locals.loggedObject = prepareChangeManagerStatusLogInfo(user, status, eventTypes[`ADMIN_${status}`]);

    await user.update({status});

    next();
  } catch (e) {
    log.error(`updating admin status \n ${e}`)
    next(e);
  }
};

export const updateAdvertiser = async (req, res, next) => {
  const {id, email, role, managerId} = req.body;
  let bodyCopy = {...req.body};

  if (req.user.role === roles.ACCOUNT_MANAGER && req.user.id !== managerId) {
    res.status(403).send({});

    return;
  }

  try {
    const uniqueCheckResult = await Advertiser.findAll({
      where: {id: {[Op.ne]: id}, email},
    });
    if (uniqueCheckResult.length !== 0) {
      throw createError(400, {
        errors: [{
          message: `User with ${role.toLowerCase()} role and this email already exists`,
          path: 'email',
        }],
      });
    }

    bodyCopy = await checkAdvertiserBalance(bodyCopy);

    delete bodyCopy.createdAt;
    delete bodyCopy.updatedAt;
    delete bodyCopy.role;

    const user = await Advertiser.findOne({where: {id}});
    const billing = await BillingDetails.findOne({where: {userId: user.id, userType: user.role}});

    const oldAdvertiser = Object.assign({}, user.get());

    const updatedAdvertiser = await Advertiser.update(bodyCopy, {where: {id: user.id}, returning: true});

    let oldBilling = {}; let updatedBilling = {};

    if (billing) {
      oldBilling = Object.assign({}, billing.get());
      updatedBilling = await billing.update(bodyCopy.billing, {returning: true});
    } else {
      bodyCopy.billing.userId = user.id;
      bodyCopy.billing.userType = user.role;

      updatedBilling = await BillingDetails.create(bodyCopy.billing, {returning: true});
    }

    await cacheAdvertiserUpdate(updatedAdvertiser[1][0].get());

    res.locals.loggedObject = prepareUserLogInfo(
        {user: oldAdvertiser, billing: oldBilling},
        {user: updatedAdvertiser[1][0].get(), billing: updatedBilling.get()},
        eventTypes.ADVERTISER_EDIT);

    res.locals.response = {user: updatedAdvertiser[1][0].get(), billing: updatedBilling.get()};

    next();
  } catch (e) {
    log.error(`updating advertiser balance \n ${e}`)
    next(e);
  }
};

export const updatePublisher = async (req, res, next) => {
  try {
    const {id, email, role} = req.body;
    const bodyCopy = {...req.body};
    for (const key in bodyCopy) {
      if (bodyCopy[key] === '') {
        bodyCopy[key] = null;
      }
    }
    const uniqueCheckResult = await Publisher.findAll({
      where: {id: {[Op.ne]: id}, email},
    });
    if (uniqueCheckResult.length !== 0) {
      throw createError(400, {
        errors: [{
          message: `User with ${role.toLowerCase()} role and this email already exists`,
          path: 'email',
        }],
      });
    }

    delete bodyCopy.createdAt;
    delete bodyCopy.updatedAt;
    delete bodyCopy.role;

    const publisher = await Publisher.findOne({where: {id: bodyCopy.id}});
    const oldPublisher = Object.assign({}, publisher.get());

    if (req.user.role === roles.ACCOUNT_MANAGER) {
      bodyCopy.managerId = req.user.id;
    }

    let updatedPublisher = await Publisher.update(bodyCopy, {where: {id: publisher.id}, returning: true});
    updatedPublisher = updatedPublisher[1][0].get();

    const result = await Inventory.findAll({where: {publisherId: id}});
    for (const item of result) {
      await Inventory.update({payout: bodyCopy.payout}, {where: {publisherId: id, id: item.get().id}});
    }

    // Auto-connect publisher to all demand
    if (updatedPublisher.isAutoConnectDemands && !oldPublisher.isAutoConnectDemands) {
      await autoConnectToAllDemand(updatedPublisher);
    }

    // Update inventory title
    await cachePublisherUpdate(updatedPublisher);
    res.locals.loggedObject = prepareUserLogInfo({user: oldPublisher}, {user: updatedPublisher}, eventTypes.PUBLISHER_EDIT);
    res.locals.response = {user: updatedPublisher};
    next();
  } catch (e) {
    log.error(`updating publisher \n ${e}`)
    next(e);
  }
};

export const updateAdmin = async (req, res, next) => {
  try {
    const {id, email, role} = req.body;
    const bodyCopy = {...req.body};

    // try to find any user with this email
    const admin = await Admin.findOne({
      where: {id: {[Op.ne]: id}, email},
    });
    if (admin) {
      return next(createError(400, {
        errors: [{
          message: `User with ${role.toLowerCase()} role and this email already exists`,
          path: 'email',
        }],
      }));
    }

    delete bodyCopy.createdAt;
    delete bodyCopy.updatedAt;
    // get the oldAdmin
    const oldAdmin = await Admin.findOne({where: {id}});
    const user = await Admin.update(bodyCopy, {where: {id: bodyCopy.id}, returning: true, plain: true});
    /*
      Admin Structure
      {
        dataValues:{
          feild1:value,
          .
          .
          feildN:valueN
        }
      }
    */
      res.locals.loggedObject = prepareUserLogInfo({user: oldAdmin.dataValues}, {user: user[1].dataValues}, eventTypes[`${role.toUpperCase()}_EDIT`]);
    // res.send({user: user[1].get()});
    res.locals.response = {user: user[1].dataValues};
    next()
  } catch (e) {
    log.error(`updating admin \n ${e}`)
    next(e);
  }
};

export const updateUserActivationSettings = async (req, res, next) => {
  try {
    const {newSetup} = req.body;
    if (!newSetup) {
      return res.send({
        success: false,
        msg: 'newSetup is required',
      });
    }
    const newUserActivationData = await PlatformSettings.update({setup: newSetup}, {
      where: {configuration: 'userActivation'},
      returning: true,
    });
    res.send({
      newUserActivationData: newUserActivationData[1][0].dataValues,
    });
  } catch (e) {
    log.error(`user activation settings \n ${e}`)
    next(e);
  }
};

export const updatePartnerFees = async (req, res, next) => {
  /*
    updateble fields:
    feesType, fees, advertisers, status, monthlyMIn
  */
  const {feesType, fees, advertisers, status} = req.body;
  let {monthlyMin} = req.body;
  const {feesId} = req.params;
  if(!feesId) {
    return res.status(400).send({
        updatedPartnerFees:[],
        msg: 'feesId required',
    });
  }
  if(!feesType || !fees || Number(monthlyMin) < 0 || isNaN(Number(fees)) || Number(fees) <= 0) {
      return res.status(400).send({
          updatedPartnerFees:[],
          msg: 'invalid data',
      });
  }
  if(monthlyMin==='null' || monthlyMin===null){
    monthlyMin = null;
  }
  let newAdvertisers = [];
  try{
    newAdvertisers = JSON.parse(advertisers).map(item=>parseInt(item)); //convert string to int
  }catch(err){
    return res.status(400).json({updatedPartnerFees:{}, msg: 'Error parsing advertisers'});
  }
  try{
    const oldPartnerFees = (await PartnerFees.findOne({where: {feesId: feesId}})).dataValues;
    if(oldPartnerFees.status==='REMOVED'){
      return res.status(400).json({updatedPartnerFees:{}, msg: 'no data updated! this partner fees is removed'});
    }
    const oldAdvertisers = JSON.parse(JSON.parse(oldPartnerFees.advertisers).advertisers);
    // find advertisers in newAdvertisers which are not in oldAdvertisers
    const advertisersToAdd = newAdvertisers.filter(item=>!oldAdvertisers.includes(item));
    const { availableAdvertisers, error, msg} = await getAvailableAdvertisers(oldPartnerFees.partnerTypeName, oldPartnerFees.partnerName);
    if(error){
      log.error(`creating partner fee failed \n ${msg}`)
      return res.status(400).send({updatedPartnerFee:{}, msg: msg});
    }
    const availableAdvertisersId = availableAdvertisers.map(item => item.id);
    // conditon for repeated advertisers or when advertisers are selected which are not in availableAdvertisers
    if(!_.isEqual(_.sortBy(_.intersection(availableAdvertisersId, advertisersToAdd)), _.sortBy(advertisersToAdd))){
      log.error(`creating partner fee failed \n ${'Invalid advertisers'}`)
      return res.status(400).send({updatedPartnerFee:{}, msg: 'Invalid advertisers selected'});
    }
    const obj = {
      monthlyMin:parseFloat(monthlyMin),
      feesType,
      fees:parseFloat(fees),
      advertisers: JSON.stringify({advertisers: JSON.stringify(newAdvertisers)}),
      status: status,
    }
    const updatedPartnerFees = await PartnerFees.update(obj, {
      where:{
          feesId: feesId
      },
      returning: true,
    })
    // console.log(updatedPartnerFees)
    if(updatedPartnerFees[1].length === 0) {
      return res.status(400).send({
          updatedPartnerFees:[],
          msg: 'no data updated',
      });
    }
    updatedPartnerFees[1][0].dataValues.advertisers = JSON.parse(JSON.parse(updatedPartnerFees[1][0].dataValues.advertisers).advertisers)
    res.status(200).send({
      updatedPartnerFees: updatedPartnerFees[1][0].dataValues,
    })
  }catch(err){
      log.error(`update partner fees \n ${err}`)
      next(err);
  }
}