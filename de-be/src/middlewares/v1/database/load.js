import createError from 'http-errors';
import {
    admin as Admin,
    adServingPartner as AdServingPartner,
    advertiser as Advertiser,
    audioAdCreative as AudioAdCreative,
    billingDetails as BillingDetails,
    budget as Budget,
    campaign as Campaign,
    campaignTags as CampaignTags,
    creative as Creative,
    creativeTag as CreativeTag,
    dmpPartner as DMPPartner,
    inventory as Inventory,
    nativeAdCreative as NativeAdCreative,
    partnerFees as PartnerFees,
    partnerTypes as PartnerTypes,
    platformSettings as PlatformSettings,
    publisher as Publisher,
    Sequelize,
    sequelize,
    videoAdCreative as VideoAdCreative,
    advertiserUsages as AdvertiserUsages,
    subscriptions as Subscriptions, 
    campaignAudience as CampaignAudience
} from '../../../models';
import moment from 'moment';
import {getAvailableAdvertisers} from '../advertisers';
import {searchUserActivityLogs} from '../../../services/mongoService';
import {publisherTypes, roles, statuses} from '../../../constants/user';
import * as campaignConstants from '../../../constants/campaign';
import {adTypes} from '../../../constants/ssp';
import log from '../../../../logger';

const Op = Sequelize.Op;
let redisClient;

const getDBInstance = {
  'dmpPartners': DMPPartner,
  'adServingPartners': AdServingPartner,
  'partnerFees': PartnerFees,
}
export const loadCampaigns = async (req, res, next) => {
  log.info('server.rest.database.load.loadCampaigns')
  const conditions = {};
  if (req.user.role === roles.ADVERTISER) {
    conditions.advertiserId = req.user.id;
  }

  if (req.user.role === roles.ACCOUNT_MANAGER) {
    const managerAdvertisers = await Advertiser.findAll({
      where: {managerId: req.user.id},
      attributes: ['id'],
    });

    conditions.advertiserId = managerAdvertisers.map((item) => item.get().id);
  }

  if (req.user.role === roles.PUBLISHER && req.user.type === publisherTypes.SSP) {
    conditions.modelPayment = campaignConstants.CPM;
  }

  Campaign.findAll({
    where: conditions,
    include: [{model: Inventory}],
  })
      .then((campaigns) => res.send({campaigns}))
      .catch(next);
};

export const loadInventories = async (req, res, next) => {
  log.info('server.rest.database.load.loadInventories')
  const {adType, bidType, protocolType, trafficType, rtbProtocolVersion, paymentsWith} = req.query;

  const options = {
    where: {status: statuses.ACTIVE, isEnableRTB: true, bidType},
    attributes: [
      'id', 'name', 'isEnableRTB', 'isEnableDirectPublisher', 'rtbProtocolVersion',
      'bidType', 'protocolType', 'adType', 'payout', 'trafficType', 'paymentsWith',
    ],
  };

  options.where[Op.or] = [
    {adType: {[Op.overlap]: adType === adTypes.VIDEO ? [adTypes.VIDEO]: Array.isArray(adType) ? adType : [adType]}},
    {adType: {[Op.contains]: [adTypes.ALL]}},
  ];

  if (adType === adTypes.ALL) {
    delete options.where[Op.or];
  }

  if (trafficType && trafficType !== 'ALL') {
    const allowedTrafficTypes = [trafficType, 'ALL'];
    options.where.trafficType = {[Op.in]: allowedTrafficTypes};
  }

  bidType && (options.where.bidType = bidType);
  protocolType && (options.where.protocolType = protocolType);
  if (protocolType === 'oRTB') {
    rtbProtocolVersion && (options.where.rtbProtocolVersion = rtbProtocolVersion);
  }
  paymentsWith && (options.where.paymentsWith = paymentsWith.toLowerCase());

  try {
    const publishers = await Publisher.findAll(options);
    const inventories = [];
    for (const item of publishers) {
      const pub = await redisClient.hgetallAsync(`user:${item.get().id}:PUBLISHER`);
      inventories.push({
        ...item.get(),
        countries: pub && pub.countries,
        category: pub && pub.category,
        averageCpm: pub ? (pub.averageCpm === 'null' ? 0 : pub.averageCpm) : 0,
        impressionsDaily: pub && pub.impressionsDaily,
        trafficType: pub && pub.trafficType,
        dimensions: pub && pub.dimensions,
      });
    }
    res.send({inventories});
  } catch (e) {
    log.error(` loading inventories failed \n ${e}`)
    next(e);
  }
};

export const loadCountCampaigns = async (req, res, next) => {
  log.info('server.rest.database.load.loadCountCampaigns')
  const {advertiserId, campaignType, os, status, countries} = req.body;

  const options = {};
  advertiserId && (options.advertiserId = advertiserId);
  status && (options.status = status);
  status === 'DRAFT' && (options.status = campaignConstants.NEW);
  os && (options.platform = os);
  campaignType && (options.modelPayment = campaignType);
  // countries && (options.geography = {[Op.contains]: countries});

  const resDb = await Campaign.findAndCountAll({
    where: options,
  });

  res.json({count: resDb.count});
};

export const loadCampaignsByService = (req, res, next) => {
  log.info('server.rest.database.load.loadCampaignsByService')
  const {conditions} = req.body;
  conditions.where.apiCampaignId = {[Op.ne]: null};
  Campaign.findAll(conditions)
      .then((campaigns) => res.send({campaigns}))
      .catch(next);
};


export const loadBudgets = (req, res, next) => {
  log.info('server.rest.database.load.loadBudgets')
  if (req.user.role === roles.ADVERTISER) {
    Campaign.findAll({
      where: {
        advertiserId: req.user.id,
      },
    }).then((campaigns) => {
      Budget.findAll({
        where: {
          campaignId: campaigns.map((campaign) => campaign.id),
        },
      })
          .then((budgets) => res.send({budgets}))
          .catch(next);
    });
  } else {
    Budget.findAll()
        .then((budgets) => res.send({budgets}))
        .catch(next);
  }
};

export const loadAdvertiserDetails = async (req, res, next) => {
  log.info('server.rest.database.load.loadAdvertiserDetails')
  const {id} = req.query;
  try {
    const managerId = req.user.role === roles.ACCOUNT_MANAGER ? req.user.id : undefined;

    const options = {
      where: {id, ...(managerId && {managerId: managerId})},
      attributes: {exclude: ['createdAt', 'updatedAt', 'password']},
    };

    const user = await Advertiser.findOne(options);

    if (!user) throw createError(400, {error: 'Advertiser not found'});

    const advertiser = user && user.get();

    const billing = await BillingDetails.findOne({
      where: {userId: advertiser.id},
      attributes: {exclude: ['createdAt', 'updatedAt', 'id']},
    });

    advertiser.billing = billing && billing.get();

    res.send({...advertiser});
  } catch (e) {
    log.error(`loading advertiser details \n ${e}`)
    next(e);
  }
};

export const loadPublisherDetails = async (req, res, next) => {
  log.info('server.rest.database.load.loadingPublisherDetails')

  const {id} = req.query;
  try {
    const user = await Publisher.findOne({
      where: {id},
      attributes: {exclude: ['createdAt', 'updatedAt', 'password']},
      include: [
        {
          model: Inventory,
          attributes: ['name', 'campaignId', 'payout'],
        },
      ],
    });

    if (!user) {
      throw createError(400, {error: 'Publisher not found'});
    }
    user.get().inventories.map((i) => {
      const data = i.get();
      data.id = data.campaignId;
      data.isFeed = false;

      delete data.campaignId;
    });
    res.send({...user.get()});
  } catch (e) {
    log.error(`loading publisher details \n ${e}`)
    next(e);
  }
};

export const loadCampaignDetails = async (req, res, next) => {
  log.info('server.rest.database.load.loadCampaignDetails')
  const {id} = req.query;
  const {role} = req.user;

  try {
    let campaign;
    if (role === roles.PUBLISHER) {
      campaign = await Campaign.findOne({
        where: {id},
        attributes: ['appDescription', 'offerDescription', 'advertiserId', 'accessStatus', 'appImage', 'appLink',
          'appTrackName', 'campaignName', 'geography', 'modelPayment', 'deviceType', 'platform'],
      });
    } else {
      const options = {where: {id}, include: [{model: Budget}, {model: CampaignAudience}]};

      if (role === roles.ACCOUNT_MANAGER) {
        let managerAdvertisers = await Advertiser.findAll({
          where: {managerId: req.user.id},
          attributes: ['id'],
        });

        managerAdvertisers = managerAdvertisers.map((item) => item.get().id);

        options.where.advertiserId = managerAdvertisers;
      } else {
        const inventories = {
          model: Inventory,
          attributes: ['id', 'publisherId', 'campaignId', 'name', 'payout', 'protocolType', 'rtbProtocolVersion', 'adType'],
        };
        options.include.push(inventories);
      }

      campaign = await Campaign.findOne(options);

      if (!campaign) {
        res.send({});
        return;
      }

      let tags;
      if (role === 'ADMIN') {
        tags = await CampaignTags.findAll();
      } else {
        tags = await CampaignTags.findAll({where: {advertiserId: req.user.id}});
      }

      if (campaign) {
        campaign.get().tagsList = tags.map((el) => ({
          id: el.id,
          name: el.name,
          color: el.color,
          isChecked: el.isChecked,
        }));

        if (campaign.inventories) {
          const formattedInventories = {};
          campaign.get().inventories.forEach((item) => {
            formattedInventories[item.publisherId] = {...item.get()};
          });
          campaign.get().inventories = formattedInventories;
        }
      }
    }

    res.send({campaign});
  } catch (e) {
    log.info(`loading campaign details \n ${e}`)
    next(e);
  }
};

export const externalLoadCampaignDetails = async (req, res, next) => {
  log.info('server.rest.database.external.load.loadCampaignDetails')
  const {id} = req.query;
  const {role} = req.user;
  const advertiserId = req.user.id;

  try {
    let campaign;
    if (role === roles.PUBLISHER) {
      campaign = await Campaign.findOne({
        where: {id},
        attributes: ['appDescription', 'offerDescription', 'advertiserId', 'accessStatus', 'appImage', 'appLink',
          'appTrackName', 'campaignName', 'geography', 'modelPayment', 'deviceType', 'platform'],
      });
    } else {
      const options = {where: {id,advertiserId}, include: [{model: Budget}]};

      if (role === roles.ACCOUNT_MANAGER) {
        let managerAdvertisers = await Advertiser.findAll({
          where: {managerId: req.user.id},
          attributes: ['id'],
        });

        managerAdvertisers = managerAdvertisers.map((item) => item.get().id);

        options.where.advertiserId = managerAdvertisers;
      } else {
        const inventories = {
          model: Inventory,
          attributes: ['id', 'publisherId', 'campaignId', 'name', 'payout', 'protocolType', 'rtbProtocolVersion', 'adType'],
        };
        options.include.push(inventories);
      }

      campaign = await Campaign.findOne(options);

      if (!campaign) {
        res.send({});
        return;
      }

      let tags;
      if (role === 'ADMIN') {
        tags = await CampaignTags.findAll();
      } else {
        tags = await CampaignTags.findAll({where: {advertiserId: req.user.id}});
      }

      if (campaign) {
        campaign.get().tagsList = tags.map((el) => ({
          id: el.id,
          name: el.name,
          color: el.color,
          isChecked: el.isChecked,
        }));

        if (campaign.inventories) {
          const formattedInventories = {};
          campaign.get().inventories.forEach((item) => {
            formattedInventories[item.publisherId] = {...item.get()};
          });
          campaign.get().inventories = formattedInventories;
        }
      }
    }
    
    delete campaign.advertisingChannel;
    delete campaign.appLink;
    delete campaign.appImage;
    delete campaign.fqCapClick;
    delete campaign.fqCapClickValue;
    delete campaign.fqCapClickInterval;
    delete campaign.appTrackName;
    delete campaign.appDescription;
    delete campaign.offerDescription;
    delete campaign.titleXml;
    delete campaign.descriptionXml;
    delete campaign.enableNotifications;
    delete campaign.notificationsThreshold;
    delete campaign.selfServed;
    delete campaign.confirmedCopyrightOwnership;
    delete campaign.enableCrThreshold;
    delete campaign.lowestCrThreshold;
    delete campaign.highestCrThreshold;
    delete campaign.kpiType;
    delete campaign.clicksLifespan;
    delete campaign.apiCampaignId;
    delete campaign.disableTestLink;
    delete campaign.paymentType;
    delete campaign.statusReason;
    delete campaign.goals;
    delete campaign.cappingType;
    delete campaign.cap;
    delete campaign.applyChannelRule;
    delete campaign.isPmpSupport;
    delete campaign.deactivatedAt;
    delete campaign.inExGeomode;
    delete campaign.conversionTrackingTag;
    delete campaign.sdmin;
    delete campaign.sdmax;
    delete campaign.impressionTtl;
    delete campaign.clickTtl;
    delete campaign.minWinRate;
    delete campaign.bidStep;
    delete campaign.isBiddingOptimization;

    res.send({campaign});
  } catch (e) {
    log.info(`loading campaign details \n ${e}`)
    next(e);
  }
};

export const loadAdmins = async (req, res, next) => {
  log.info('server.rest.database.load.loadAdmins')
  const {role} = req.user;
  const {ADVERTISER, ACCOUNT_MANAGER, ADMIN, OWNER} = roles;
  let conditions = {};
  [ADVERTISER, ACCOUNT_MANAGER].includes(role) && (conditions = {role: ACCOUNT_MANAGER});
  role === ADMIN && (conditions = {role: [ACCOUNT_MANAGER, ADMIN]});
  role === OWNER && (conditions = {});
  conditions.email = {[Op.ne]: 'admin.dsp@mail.com'};

  try {
    const users = await Admin.findAll({
      where: conditions,
      attributes: {
        exclude: ['password'],
      },
    });

    res.send(users);
  } catch (e) {
    log.error(`loading admins failed \n ${e}`)
    next(e);
  }
};

export const loadBilling = async (req, res, next) => {
  log.info('server.rest.database.load.loadBilling')
  if (req.user.role === roles.ADMIN || req.user.role === roles.ACCOUNT_MANAGER) {
    try {
      const billingDetails = await BillingDetails.findAll();
      res.send(billingDetails);
    } catch (e) {
      log.error(`loading billing failed \n ${e}`)
      next(e);
    }
  } else {
    res.send([]);
  }
};

export const loadCurrentBilling = async (req, res, next) => {
  try {
    const billingDetails = await BillingDetails.findOne({
      where: {userId: req.query.id},
      attributes: {
        exclude: ['createdAt', 'updatedAt', 'id'],
      },
    });
    res.send(billingDetails);
  } catch (e) {
    log.error(`loading current billing \n ${e}`)
    next(e);
  }
};

export const loadCommonStatistics = async (req, res, next) => {
  log.info('server.rest.database.load.loadCommonStatistics')
  const statistics = {
    pendingPublisher: 0,
    activePublishers: 0,
    activeCampaigns: 0,
  };

  try {
    const userStatistics = await sequelize.query(`select status, count(*) from publishers group by status`, {type: sequelize.QueryTypes.SELECT});

    await userStatistics.forEach((item) => {
      if (item.status === statuses.PENDING) {
        statistics.pendingPublisher = item.count;
      }
      if (item.status === statuses.ACTIVE) {
        statistics.activePublishers = item.count;
      }
    });

    statistics.activeCampaigns = await Campaign.count({where: {status: campaignConstants.ACTIVE}});

    res.send({statistics});
  } catch (err) {
    next(err);
  }
};

export const loadAllUsers = async (req, res, next) => {
  try {
    log.info('server.rest.database.load.loadAllUsers')
    const admins = await Admin.findAll({attributes: ['id', 'email', 'role']});
    const advertisers = await Advertiser.findAll({attributes: ['id', 'email', 'role']});
    const publishers = await Publisher.findAll({attributes: ['id', 'email', 'role']});

    const usersList = [...admins, ...advertisers, ...publishers];

    res.send({usersList});
  } catch (err) {
    next(err);
  }
};

export const loadUserActivityLogs = async (req, res, next) => {
  try {
    log.info('server.rest.database.load.loadUserActivityLogs')
    const filters = req.body;
    const user = req.user;
    const userActivityLogs = await searchUserActivityLogs(filters, user);
    res.send({ userActivityLogs });
  } catch (err) {
    next(err);
  }
};

export const loadCreativesInfo = async (req, res, next) => {
  try {
    log.info('server.rest.database.load.loadCreativesInfo')
    const {campaignId} = req.params;
    const type = req.query.type;
    let responseDb = {};
    let tagResponse = {};
    if (['NATIVE'].includes(type)) {
      responseDb = await NativeAdCreative.findOne({
        where: {campaignId},
        attributes: ['name', 'cta', 'sponsored', 'rating', 'description',
          'mainImageName', 'mainImageSize', 'mainImageResolution', 'mainImageWidth', 'mainImageHeight', 'mainImageCreativeUrl', 'mainImageCreatedAt',
          'iconImageName', 'iconImageSize', 'iconImageResolution', 'iconImageWidth', 'iconImageHeight', 'iconImageCreativeUrl', 'iconImageCreatedAt',
        ],
      });
    } else if (['VIDEO'].includes(type)) {
      responseDb = await VideoAdCreative.findOne({
        where: {campaignId},
        attributes: ['impressionUrl', 'videoDuration', 'startDelay', 'endCard', 'adTitle',
          'videoName', 'videoSize', 'videoResolution', 'videoWidth', 'videoHeight', 'videoCreativeUrl', 'videoCreatedAt',
          'imageName', 'imageSize', 'imageResolution', 'imageWidth', 'imageHeight', 'imageCreativeUrl', 'imageCreatedAt'],
      });
    } else if(['AUDIO'].includes(type)){
      responseDb = await AudioAdCreative.findOne({
        where:{campaignId},
        attributes: ['impressionUrl','audioDuration','startDelay','endCard','adTitle',
        'audioName','audioSize','audioCreativeUrl','audioCreatedAt','audioMimeType',
          'imageName', 'imageSize', 'imageResolution', 'imageWidth', 'imageHeight', 'imageCreativeUrl', 'imageCreatedAt']
      })
    }
    else {
      responseDb = await Creative.findAll({
        where: {campaignId},
        attributes: ['createdAt', 'preview', 'name', 'size', 'creativeUrl', 'id', 'width', 'height'],
      });
      tagResponse = await CreativeTag.findOne({
        where: {campaignId},
        attributes: ['tagEnable', 'tagUrl', 'impressionUrl'],
      });

      responseDb = {creatives: responseDb, tag: tagResponse};
    }

    res.json(responseDb);
  } catch (err) {
    log.error(`loading creatives info \n ${err}`)
    next(err);
  }
};

export const loadUserActivationSettings = async (req, res, next) => {
  try {
    log.info('server.rest.database.load.loadUserActivationSettings')
    const responseDb = await PlatformSettings.findOne({
      where: {configuration: 'userActivation'},
    });
    res.json(responseDb);
  } catch (err) {
    log.error(`loading user activation settings \n ${err}`)
    next(err);
  }
};

export const setRedisClient = (client) => {
  redisClient = client;
};

export const loadPartnerTypes = async (req, res, next) => {
  try{
    const partnerTypesList = await PartnerTypes.findAll({
      attributes: ['id', 'partnerTypeName']
    })
    // console.log(partnerTypesList)
    const partnerTypes = partnerTypesList.map(item => {
      return {
        id: item.id,
        partnerTypeName: item.partnerTypeName
      }
    })
    res.send({partnerTypes})
  }catch(err){
    log.error(`loading partner types \n ${err}`)
    next(err);
  }
}

export const loadPartnerlist = async (req, res, next) => {
  try{
    let partnerTypesList;
    if(req.query.partnerType){
        partnerTypesList = await PartnerTypes.findAll({
          where: {partnerTypeName: req.query.partnerType},
          attributes: ['id', 'partnerTypeName', 'partnersListTable']
        })
    }else{
      partnerTypesList = await PartnerTypes.findAll({
        attributes: ['id', 'partnerTypeName', 'partnersListTable']
      })
    }
    const partnerTypes = partnerTypesList.map(item => {
      return {
        id: item.id,
        partnerTypeName: item.partnerTypeName,
        partnersListTable: item.partnersListTable
      }
    })
    // console.log(partnerTypes)
    // now fetch all the rows from each partnerslist table for each partner type
    let partnerList = []; 
    /*
      [
        {
          partnerTypeId: "ID",
          partnerTypeName: 'something',
          partnerNames : [
            {
              id: TIDPID,
              partnerName: 'something'
            },
            {
              id:TIDPID,
              partnerName: 'something else'
            },...,
          ],
        }
      ]
    */
    for(let i=0;i<partnerTypes.length;i++){
      const currentPartnerType = partnerTypes[i].partnerTypeName;
      const currentPartnerTypeId = partnerTypes[i].id;
      const currentPartnersListTable = partnerTypes[i].partnersListTable;
      const dbInstance = getDBInstance[currentPartnersListTable];
      if(!dbInstance){
        console.log(`dbInstance for ${currentPartnersListTable} is not defined`)
        continue;
      }
      const currentPartnersList = await dbInstance.findAll({
        attributes: ['id', 'partnerName', 'contractDocument','updatedAt']
      })
      const currentPartners = currentPartnersList.map(item => {
        return {
          id: `T${currentPartnerTypeId}P${item.id}`,
          partnerName: item.partnerName,
          updatedAt: item.updatedAt,
          contractDocument: item.contractDocument
        }
      })
      partnerList.push({
        partnerTypeId: currentPartnerTypeId,
        partnerTypeName: currentPartnerType,
        partnerNames: currentPartners
      })
    }
    res.send({partnerList})
  }catch(err){
    log.error(`loading partner list \n ${err}`)
    next(err);
  }
}

export const loadAvailableAdvertisers = async (req, res, next) => {
    const {partnerType, partnerName} = req.query;
  
    if(!partnerType || !partnerName){
      return res.status(400).send({availableAdvertisers:[], msg:"Please provide partnerType and partnerName"})
    }
    try{
      const {availableAdvertisers,error,msg} = await getAvailableAdvertisers(partnerType, partnerName);
      if(error){
        log.error(`loading available advertisers \n ${error}`)
        return res.status(400).send({availableAdvertisers:[], msg:msg})
      }
      res.send({availableAdvertisers, msg:msg})
    }catch(err){
      log.error(`loading available advertisers \n ${err}`)
      next(err);
    }
}

export const loadAllPartnerFees = async (req, res, next) => {
  try{
    const {feesId} = req.params;
    let partnerFeesList = []
    let partnerFees = []
    if(!feesId){
      // if feesId is not provided, then load all the partner fees
      partnerFeesList = await PartnerFees.findAll({
        attributes: ['feesId', 'partnerTypeName', 'partnerName', 'feesType', 'fees', 'monthlyMin','advertisers','status','updatedAt'],
      })
      partnerFees = partnerFeesList.map(item => {
        return {
          feesId: item.feesId,
          partnerTypeName: item.partnerTypeName,
          partnerName: item.partnerName,
          feesType: item.feesType,
          fees: item.fees,
          monthlyMin: item.monthlyMin,
          advertisers: JSON.parse(JSON.parse(item.advertisers).advertisers), // [1,2,3]
          status: item.status,
          updatedAt: item.updatedAt
        }
      })
      res.status(200).send({partnerFees})
    }else{
      // feesId is provided, load partner-fees for that feesId along with details of the advertiser
      partnerFeesList = await PartnerFees.findAll({
        attributes: ['feesId', 'partnerTypeName', 'partnerName', 'feesType', 'fees', 'monthlyMin','advertisers','status','updatedAt'],
        where:{
          feesId: feesId
        }
      })
      const advertisersId = JSON.parse(JSON.parse(partnerFeesList[0].advertisers).advertisers)
      const advertisers = await Advertiser.findAll({
        attributes:['id','name'],
        where: {id: advertisersId},
      })
      const advertisersObj = advertisers.map(item => {
        return {
          id: item.id,
          name: item.name
        }
      })
      partnerFees = partnerFeesList.map(item => {
        return {
          feesId: item.feesId,
          partnerTypeName: item.partnerTypeName,
          partnerName: item.partnerName,
          feesType: item.feesType,
          fees: item.fees,
          monthlyMin: item.monthlyMin,
          advertisers: advertisersObj, // [{id:1,name:"ad1"}]
          status: item.status,
          updatedAt: item.updatedAt
        }
      })
      res.status(200).send({partnerFees})
    }
  }catch(err){
    log.error(`loading all partner fees \n ${err}`)
    next(err);
  }
}

export const loadAdvertiserUsage = async (req, res, next) => {
  try{
    const {id} = req.params;
    const date = moment().format('YYYY-MM-DD');

    let subscription;
    let advertiserUsage;
    let advertiserId;

      if(req.user.role === roles.ADMIN){
        advertiserId = id;
      } else if(req.user.role === roles.ADVERTISER) {
        advertiserId = req.user.id;
      }

      if(!advertiserId){
        res.json({success:false,message:'Invalid route'})
      }
      advertiserUsage = await AdvertiserUsages.findOne({
        attributes:['advertiserId','dailySpendLimit','actualSpend'],
        where:{
          [Op.and]: [
            {advertiserId},
            {date}
          ]
        }
      });

      subscription = await Subscriptions.findOne({
        where:{
          advertiserId
        }
      });
      res.status(200).send({advertiserUsage, subscription});
  }catch(err){
    log.error(`loading advertiser usage \n ${err}`)
    next(err);
  }
};

export const loadAvailableDataPartners = async (req, res, next) => {
  try {
    let dmpPartners = await DMPPartner.findAll({
      attributes: ['id', 'partnerName']
    })
    const dmpPartnerList = await dmpPartners.map((el) => {
      return {
        id: el.id,
        partnerName: el.partnerName
      }
    })
    res.send({dmpPartnerList})
  } catch (error) {
    log.error(`loading available partners ${error}`);
    next(error)
  }
}