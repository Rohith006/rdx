import uuid from 'uuid';
import fs from 'fs';
import keygenerator from 'keygenerator';

import {
  admin as Admin,
  adServingPartner as AdServingPartner,
  advertiser as Advertiser,
  billingDetails as BillingDetails,
  budget as Budget,
  campaign as Campaign,
  creative as Creative,
  dmpPartner as DMPPartner,
  forgotPassword as ForgotPassword,
  partnerFees as PartnerFees,
  partnerTypes as PartnerTypes, plans as Plans,
  publisher as Publisher,
  Sequelize,
  users as User
} from '../../../models';
import _ from 'lodash';
import * as forgotPasswordConstants from '../../../constants/forgotPassword';
import {emailTypes} from '../../../constants/emails';
import {sendTemplatedEmail} from '../../../utils/sendEmail';
import {console, creatives, email as emailConfig, SSP_PAYOUT, uiHost} from '../../../../config';
import createError from 'http-errors';
import {
  cacheAdvertiser,
  cacheBudget,
  cacheCampaign,
  cacheCheckItem,
  cachePublisher,
} from '../../../services/caching/create';
import {prepareUserLogInfo} from '../../../services/logging/create';
import {roles, statuses} from '../../../constants/user';
import {eventTypes} from '../../../constants/eventType';
import {autoConnectToAllDemand} from '../../../utils/publisher';
import {tableMap} from '../../../constants/tableMap';
import log from '../../../../logger'
import {getAvailableAdvertisers} from '../advertisers';

const configUser = {
  advertiser: Advertiser,
  publisher: Publisher,
  admin: Admin,
  account_manager: Admin,
};

const Op = Sequelize.Op;

const getDBInstance = {
  'dmpPartners': DMPPartner,
  'adServingPartners': AdServingPartner,
  'partnerFees': PartnerFees,
}

export const createBillingDetails = async (req, res, next) => {
  log.info('server.rest.database.create.billing-details.creatBillingDetails')
  let billingDetails = await BillingDetails.findOne({
    where: {
      userId: req.user.id,
      userType: req.user.role,
    },
  });

  const data = {
    ...req.body,
    userId: req.user.id,
    userType: req.user.role,
  };

  try {
    if (billingDetails) {
      await billingDetails.update(data, {
        where: {
          userId: req.user.id,
          userType: req.user.role,
        },
      });
    } else {
      billingDetails = await BillingDetails.create(data);
    }

    res.send(billingDetails);
  } catch (err) {
    log.error(` creating billing details \n ${err}`)
    next(err);
  }
};

export const createIntegrationCampaign = async (req, res, next) => {
  log.info('server.rest.database.create.createIntegrationCampaign')
  const bodyCopy = {...req.body};
  let campaign;

  if (req.user.role === roles.ADVERTISER) {
    bodyCopy.selfServed = true;
  }
  if (req.user.role === roles.ADMIN) {
    bodyCopy.selfServed = false;
  }

  const isDuplicate = await Campaign.findOne({
    where: {
      advertiserId: bodyCopy.advertiserId,
      apiCampaignId: String(bodyCopy.apiCampaignId),
    },
  });
  if (isDuplicate) {
    return res.json({msg: 'duplicate'});
  }

  Campaign.create({
    ...bodyCopy,
    advertiserId: bodyCopy.advertiserId || req.user.id,
  })
      .then((res) => {
        campaign = res.get();
        campaign.payout = bodyCopy.percentageBid || SSP_PAYOUT;
        return Campaign.update({
          postbackUrl: campaign.postbackUrl.replace(/{CAMPAIGN_ID}/g, campaign.id),
        }, {
          where: {
            id: campaign.id,
          },
          returning: true,
        });
      })
      .then(async (res) => {
        campaign = res[1][0];
        await cacheCampaign(campaign.get());
        if (!campaign.disableTestLink) {
          const obj = {
            campaignId: campaign.id,
            status: campaign.status,
          };
          await cacheCheckItem(obj);
        }
        delete bodyCopy.id;
        return Budget.create({
          ...bodyCopy,
          campaignId: campaign.id,
        });
      })
      .then(async (budget) => {
        await cacheBudget(budget.get());
        res.send({status: 'OK', campaign: campaign});
        // next();
      })
      .catch(next);
};

export const restorePassword = async (req, res, next) => {
  try {
    log.info('server.rest.database.create.restorePassword')
    const {email, role} = req.body;

    const Model = configUser[role.toLowerCase()];

    const user = await Model.findOne({where: {email}});

    if (user) {
      const restoreKey = uuid();

      const forgotPassword = await ForgotPassword.findOne({
        where: {
          userId: user.id,
          userType: user.role,
        },
      });

      if (forgotPassword) {
        await ForgotPassword.update({
          status: forgotPasswordConstants.PENDING,
          restoreKey,
        }, {
          where: {
            userId: user.id,
            userType: user.role,
          },
        });
      } else {
        await ForgotPassword.create({
          status: forgotPasswordConstants.PENDING,
          restoreKey,
          userId: user.id,
          userType: user.role,
        });
      }

      sendTemplatedEmail({
        to: email,
        subject: 'DSP - Restore your password',
      }, {
        name: user.name,
        uiHost,
        url: `${uiHost}/update-password/${ restoreKey }`,
        adminEmail: emailConfig.authUser,
      }, emailTypes.RESTORE_PASSWORD);

      res.sendStatus(200);
    } else {
      res.status(400).send({message: 'There is no user with such email'});
    }
  } catch (e) {
    log.error(`restore password \n ${e}`)
    next(e);
  }
};

export const createAdvertiser = async (req, res, next) => {
  try {
    log.info('server.rest.database.create.createAdvertiser');
    const {email, role, billing, isDuplicate} = req.body;
    const advertiserBody = req.body;
    let emailCopy;
    if (isDuplicate) {
      const password = await Advertiser.findOne({
        where: {email},
        attributes: ['password'],
      });
      advertiserBody.status = 'PENDING';
      advertiserBody.name = `Copy ${advertiserBody.name}`;
      delete advertiserBody.apiKey;
      emailCopy = advertiserBody.email;
      advertiserBody.email = 'duplicate@kek.com';
      advertiserBody.password = password.get().password;
    } else {
      const uniqueCheckResult = await Advertiser.findAll({
        where: {email},
      });
      if (uniqueCheckResult.length !== 0) {
        res.status(409).send({error: 'Advertiser with such email is already exist'});
        return;
      }
    }

    delete advertiserBody.id;
    advertiserBody.balance = 20;

    if (req.user.role === roles.ACCOUNT_MANAGER) {
      advertiserBody.managerId = req.user.id;
    }
    advertiserBody.subscriptionPlan = 'PAYG'

    const user = await Advertiser.create(advertiserBody);

    if (isDuplicate) {
      let newEmail = emailCopy.split('@');
      newEmail = `${newEmail[0]}+${user.get().id}@${newEmail[1]}`;
      await Advertiser.update(
          {email: newEmail,
            // bidderUrl: `${bidderDomain}${user.get().id}`
          },
          {where: {id: user.get().id}});
    }
    await cacheAdvertiser(user.get());

    billing.userId = user.id;
    billing.userType = roles.ADVERTISER;
    BillingDetails.create({
      ...billing,
    });
    res.locals.loggedObject = prepareUserLogInfo({}, {user: user.get(), billing}, eventTypes.ADVERTISER_NEW);
    res.locals.response = {user};
    next();
  } catch (e) {
    log.error(`creating advertiser \n ${e}`)
    next(e);
  }
};


export const registerAdvertiser = async (req, res, next) => {
  try{
    log.info('server.rest.database.create.registerAdvertiser');
    const { email, keycloakID, billing } = req.body;
    const advertiserBody = Object.assign({},req.body);

    //check if the advertiser exists
    const uniqueCheckResult = await Advertiser.findAll({
      where: {email},
    });
    if(uniqueCheckResult.length !==0){
      res.status(409).send({error:'Advertiser with such email already exists'});
      return;
    }

     delete advertiserBody.id;
     delete advertiserBody.keycloakID;
     advertiserBody.status = statuses.PENDING;
     advertiserBody.role = roles.ADVERTISER
    const user = await Advertiser.create(advertiserBody);
    if(!_.isEmpty(user)){
      log.info('Advertiser created');
    }
    await cacheAdvertiser(user.get());

    billing.email = email;
    billing.userId = user.id; //advertiser id of desk PG
    billing.userType = roles.ADVERTISER
    await BillingDetails.create({
      ...billing,
    });
    const userBody ={};
    userBody.email = email;
    userBody.keycloakId = keycloakID;
    userBody.userId = user.id;
    userBody.role = roles.ADVERTISER;
    userBody.status = statuses.ACTIVE;
    const entity = await User.create(userBody)
    if(!_.isEmpty(entity)){
      log.info(`Advertiser mapped for ID:${user.id}`);
    }else{
      log.error(`Error mapping Advertiser for ID:${user.id}`);
    }
    res.locals.loggedObject = prepareUserLogInfo({}, {user: user.get(), billing}, eventTypes.ADVERTISER_NEW);
    res.locals.response = {user};
    next();
  }catch (e) {
    log.error(`Registering advertiser \n ${e.stack}`);
    next(e);
  }

}

export const createPublisher = async (req, res, next) => {
  try {
    log.info('server.rest.database.create.createPublisher')
    const {email, role, isDuplicate} = req.body;
    const publisherBody = req.body;
    let emailCopy;
    if (isDuplicate) {
      const password = await Publisher.findOne({where: {email}, attributes: ['password']});
      publisherBody.status = 'PENDING';
      publisherBody.name = `Copy ${publisherBody.name}`;
      delete publisherBody.apiKey;
      emailCopy = publisherBody.email;
      publisherBody.email = 'duplicate@kek.com';
      publisherBody.password = password.get().password;
    } else {
      const uniqueCheckResult = await Publisher.findAll({where: {email}});
      if (uniqueCheckResult.length !== 0) {
        res.status(409).send({error: 'Publisher email already exist'});
        throw createError(400, {
          errors: [{
            message: `User with ${role.toLowerCase()} role and this email already exists`,
            path: 'email',
          }],
        });
      }
    }

    const apiKey = keygenerator._({
      chars: true,
      sticks: true,
      numbers: true,
      specials: false,
      length: 48,
    });
    delete publisherBody.id;

    if (req.user.role === roles.ACCOUNT_MANAGER) {
      publisherBody.managerId = req.user.id;
    }

    const user = await Publisher.create({...publisherBody, apiKey});
    if (isDuplicate) {
      let newEmail = emailCopy.split('@');
      newEmail = `${newEmail[0]}+${user.get().id}@${newEmail[1]}`;
      await Publisher.update(
          {email: newEmail},
          {where: {id: user.get().id},
          });
      // Auto-connect publisher to all demand
      if (user.isAutoConnectDemands) {
        await autoConnectToAllDemand(user);
      }
    }
    await cachePublisher(user.get());
    // console.log(user.get())
    res.locals.loggedObject = prepareUserLogInfo({}, {user: user.get()}, eventTypes.PUBLISHER_NEW);
    res.locals.response = {user};
    next();
  } catch (e) {
    log.error(`creating publisher \n ${e.stack}`)
    next(e);
  }
};

export const createAdmin = async (req, res, next) => {
  try {
    log.info('server.rest.database.create.createAdmin')
    const {email, keycloakID} = req.body;
    const uniqueCheckResult = await Admin.findAll({
      where: {
        email,
      },
    });

    if (uniqueCheckResult.length !== 0) {
      res.status(409).send({error: 'User with such email is already exists'});
      return;
    }
    const user = await Admin.create(req.body);
    const userBody ={};
    userBody.email = email;
    userBody.keycloakId = keycloakID;
    userBody.userId = user.id;
    userBody.role = roles.ADMIN;
    userBody.status = statuses.ACTIVE;
    const entity = await User.create(userBody)
    if(!_.isEmpty(entity)){
      log.info(`Admin created`);
    }
    res.send({user});
  } catch (e) {
    log.error(`creating admin failed \n ${e}`)
    next(e);
  }
};



export const createCreatives = async (req, res, next) => {
  try {
    log.info('server.rest.database.create.createCreative');
    const {files} = req;
    const {campaignId, clientLink, widthImg, heightImg} = req.body;
    let data = {};
    const resObj = {};

    const createCreative = async (data) => {
      return Creative.create(data, {
        returning: true,
      });
    };

    if ((!files || (Object.keys(files).length === 0)) && !clientLink) {
      log.warn('invalid file or link')
      return res.status(400).json({msg: 'Invalid file or link.'});
    }


    if (clientLink) {
      data = {
        creativeUrl: clientLink,
        name: 'client-link',
        campaignId,
      };
      const creative = await createCreative(data);
      if (creative) {
        resObj.clientUrl = creative.creativeUrl;
        await addCampaignCreativesItem(campaignId, creative);
      }
    }

    if (files && Object.keys(files).length) {
      const dir = `public/creatives/${campaignId}`;

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      let creative = files.creative;
      await creative.mv(`public/creatives/${campaignId}/${creative.name}`, async (err) => {
        if (err) {
          return res.status(500).send(err);
        }
        data = {
          creativeUrl: `${creatives.host}/creatives/${campaignId}/${creative.name}`,
          name: creative.name,
          campaignId,
          size: (creative.size / 1000).toFixed(2),
          resolution: '-',
          width: widthImg,
          height: heightImg,
        };
        creative = await createCreative(data);
        if (creative) {
          resObj.fileUrl = creative.creativeUrl;
          await addCampaignCreativesItem(campaignId, creative);
        }
        return res.json(resObj);
      });
    } else {
      return res.json(resObj);
    }
  } catch (e) {
    log.error(`creating creatives failed \n ${e}`)
    next(e);
  }
};

const addCampaignCreativesItem = async (campaignId, creative) => {
  let campaign = await Campaign.findOne({where: {id: campaignId}});
  campaign = campaign.get();
  console.log(campaign);
  if (!campaign.creatives) {
    campaign.creatives = {};
  }
  campaign.creatives[creative.id] = {id: creative.id, url: creative.creativeUrl, width: creative.width, height: creative.height};
  campaign = await Campaign.update({creatives: campaign.creatives}, {where: {id: campaignId}, returning: true});
  await cacheCampaign(campaign[1][0].get());
};

export const createPartnerFees = async (req, res, next) => {

    try{
      const {partnerType, partnerName,feesType, fees, advertisers, status} = req.body;
      let {monthlyMin} = req.body;
      if(!partnerType || !partnerName || !monthlyMin || !feesType || !fees || !advertisers || !status || Number(monthlyMin) < 0 ){
        return res.status(400).json({newPartnerFee:[], msg: 'Invalid data'});
      }
      if(monthlyMin==='null' || monthlyMin===null){
        monthlyMin = null;
      }
      let advertisersIntId = [];
      try{
        advertisersIntId = JSON.parse(advertisers).map(item=>parseInt(item)); //convert string to int
      }catch(err){
        return res.status(400).json({newPartnerFee:[], msg: 'Error parsing advertisers'});
      }
      const { availableAdvertisers, error, msg} = await getAvailableAdvertisers(partnerType, partnerName);
      if(error){
        log.error(`creating partner fee failed \n ${msg}`)
        return res.status(400).send({newPartnerFee:[], msg: msg});
      }
      if(availableAdvertisers.length === 0){
        log.error(`creating partner fee failed \n ${'No available advertisers'}`)
        return res.status(400).send({newPartnerFee:[], msg: 'No available advertisers'});
      }
      const availableAdvertisersId = availableAdvertisers.map(item => item.id);
      // conditon for repeated advertisers
      if(!_.isEqual(_.sortBy(_.intersection(availableAdvertisersId, advertisersIntId)), _.sortBy(advertisersIntId))){
        log.error(`creating partner fee failed \n ${'Invalid advertisers'}`)
        return res.status(400).send({newPartnerFee:[], msg: 'Invalid advertisers'});
      }
      const newPartnerFee = await PartnerFees.create({
        'partnerTypeName': partnerType,
        'partnerName': partnerName,
        'monthlyMin': parseFloat(monthlyMin),
        'feesType': feesType,
        'fees': parseFloat(fees),
        'advertisers': JSON.stringify({advertisers: advertisers}),
        'status': status,
      })
      newPartnerFee.advertisers = JSON.parse(JSON.parse(newPartnerFee.advertisers).advertisers)
      res.status(200).send({newPartnerFee});
    }catch(err){
      log.error(`creating partner fees failed \n ${err}`)
      next(err);
    }

}

export const addDataToPartner = async (req, res, next) => {
  try{
    const obj = req.body;
    const {type} = req.body;
    const table = getDBInstance[tableMap[type.toUpperCase()]];
    delete obj.type;
    console.log(obj, table);
    const data = await table.create(obj);
    res.status(200).send({data});
  }catch(err){
    log.error(`adding data failed \n ${err}`)
    next(err);
  }
}

export const createPartnerTypes = async (req, res, next) => {
  try{
    const {partnerType, table} = req.body;
    if(!partnerType || !table){
      return res.status(400).json({msg: 'Invalid data'});
    }
    const newPartnerType = await PartnerTypes.create({
      'partnerTypeName': partnerType,
      'partnersListTable': table,
    })
    res.status(200).send({newPartnerType});
  }catch(err){
    log.error(`creating partner types failed \n ${err}`)
    next(err);
  }
}