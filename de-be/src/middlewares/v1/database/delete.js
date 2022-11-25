import {
    Admin,
    advertiser as Advertiser,
    campaign as Campaign,
    creative as Creative,
    partnerFees as PartnerFees,
    publisher as Publisher,
    Sequelize,
    users as User,
} from '../../../models';
import {roles} from '../../../constants/user';
import {REMOVED} from "../../../constants/campaign";
import {cacheRemoveBudget, cacheRemoveCampaignAudience, cacheRemoveCampaign, cacheRemoveUser,} from '../../../services/caching/delete';
import {cacheCampaign, cachePublisherUpdate, cacheRemoveCheckItem,} from '../../../services/caching/create';
import {prepareChangeUserStatusLogInfo, prepareDeleteCampaignLogInfo} from '../../../services/logging/create';
import {eventTypes} from '../../../constants/eventType';
import {PUBLISHER} from '../../../constants/topEarnings';
import log from '../../../../logger';

const Op = Sequelize.Op;

const configUser = {
  advertiser: Advertiser,
  publisher: Publisher,
  admin: Admin,
};

export const deleteCampaign = async (req, res, next) => {
  let ids = req.body.ids;
  ids = ids.filter((item) => item !== undefined || true);
  if (!ids.length) {
    return res.json({msg: 'invalid ids!'});
  }
  try {
    const campaigns = await Campaign.findAll({
      where: {id: ids},
      attributes: ['id', 'campaignName','status'],
    });
    await Campaign.update(
        {status: REMOVED},
        {where: {id: ids}},
    );

    for (const id of ids) {
      await cacheRemoveCampaign(id);
      await cacheRemoveBudget(id);
      await cacheRemoveCheckItem(id);
      await cacheRemoveCampaignAudience(id)
    }


    res.locals.loggedObject = prepareDeleteCampaignLogInfo(campaigns, eventTypes.CAMPAIGN_DELETE);

    next();
  } catch (e) {
    log.error(`deleting campaign failed`)
    next(e);
  }
};

export const deleteExternalCampaign = async (req, res) => {
  let ids = req.body.ids;
  ids = ids.filter((item) => item !== undefined || true);
  if (!ids.length) {
    return res.json({msg: 'invalid ids!'});
  }
  try {
    const campaigns = await Campaign.findAll({
      where: {id: ids},
      attributes: ['id', 'campaignName'],
    });
    await Campaign.update(
        {status: REMOVED},
        {where: {id: ids}},
    );

    for (const id of ids) {
      await cacheRemoveCampaign(id);
      await cacheRemoveBudget(id);
      await cacheRemoveCheckItem(id);
    }

    res.sendStatus(200);
  } catch (e) {
    log.error(`deleting campaign failed`)
    next(e);
  }
};

export const deleteAllApiCampaign = async (req, res, next) => {
  try {
    const ids = await Campaign.findAll({
      where: {apiCampaignId: {[Op.ne]: null}},
      attributes: ['id'],
    });
    await Campaign.destroy({where: {apiCampaignId: {[Op.ne]: null}}});
    ids.forEach((item) => {
      cacheRemoveCheckItem(item.id);
    });
    res.send(ids);
  } catch (e) {
    log.error(`deleting all API campaigns \n ${e}`)
    next(e);
  }
};

// FIXME: refactoring dimanic route /delete:user

export const deleteUser = async (req, res, next) => {
  try {
    const role = req.params.user.toUpperCase();

    if (![roles.OWNER, roles.ADMIN, roles.ACCOUNT_MANAGER].includes(req.user.role)) {
      throw 'Not allowed';
    }

    const ids = req.body.ids;

    const Model = configUser[req.params.user];

    const users = await Model.findAll({
      where: {id: ids},
      attributes: ['id', 'email', 'status'],
    });

    if (role === roles.ADVERTISER) {
      await Campaign.update({status:REMOVED}, {where: {advertiserId: ids}});
      await User.destroy({
        where: {
          userId:ids
        }});
    }

    let deletingUser = await Model.update(
        {status:REMOVED},
        {
          where: {id: ids},
          returning: true,
        },
    );

    deletingUser = deletingUser[1];
    deletingUser.map(async (user) => (user.role === PUBLISHER) && await cachePublisherUpdate(user));
    if (Array.isArray(ids)) {
      for (const id of ids) {
        await cacheRemoveUser(id);
        if (role === roles.ADVERTISER) {
          const campaigns = await Campaign.findAll({
            where: {
              advertiserId: id,
            },
          });
          campaigns.forEach(({id}) => {
            cacheRemoveCampaign(id);
          });
        }
      }
    } else {
      await cacheRemoveUser(ids);
    }

    const type = `${role}_DELETED`;
    res.locals.loggedObject = prepareChangeUserStatusLogInfo(users, REMOVED, eventTypes[type]);
    next();
  } catch (e) {
    log.error(`deleting user \n ${e}`)
    next(e);
  }
};

export const deleteAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== roles.ADMIN) {
      throw 'Not allowed';
    }

    const ids = req.body.ids;
    await Admin.destroy({
      where: {
        id: ids,
      },
    });
    await User.destroy({
      where:{
        userId:ids
      }
    })
    res.sendStatus(200);
  } catch (e) {
    log.error(`deleting admin \n ${e}`)
    next(e);
  }
};

export const deleteCreatives = async (req, res, next) => {
  try {
    const {id, campaignId} = req.body;
    if (!campaignId) {
      return res.status(400).json({msg: 'Invalid campaign id!'});
    }
    // TODO: if need delete file, fixed paramert name
    // rimraf.sync(`/creatives/${campaignId}/${name}`);

    const responseDb = await Creative.destroy({
      where: {id, campaignId},
    });
    await deleteCampaignCreativesItem(campaignId, id);

    res.json({msg: 'Successful'});
  } catch (e) {
    log.error(`deleting creatives \n ${e}`);
    next(e);
  }
};

const deleteCampaignCreativesItem = async (campaignId, creativeId) => {
  let campaign = await Campaign.findOne({where: {id: campaignId}});
  if (campaign.creatives) {
    delete campaign.creatives[creativeId];
  }
  campaign = await Campaign.update({creatives: campaign.creatives}, {where: {id: campaignId}, returning: true});
  await cacheCampaign(campaign[1][0].get());
};
export const deletePartnerFees = async(req, res, next) => {
   const {feesId} = req.params;
   if(!feesId){
      return res.status(400).send({msg: 'feesId is required'});
   }
   try{
     // update partner fee status to removed
      const updatedFee = await PartnerFees.update({status: REMOVED}, {where: {feesId: feesId}, returning: true});
      if(updatedFee[0] === 0){
        return res.status(400).send({msg: 'feesId is not found'});
      }
      updatedFee[1][0].dataValues.advertisers = JSON.parse(JSON.parse(updatedFee[1][0].dataValues.advertisers).advertisers)
      delete updatedFee[1][0].createdAt;
      res.status(200).send({data:updatedFee[1][0],msg: 'Successful'});
   }catch(e){
      log.error(`deleting partner fees \n ${e}`);
      next(e);
   }
}