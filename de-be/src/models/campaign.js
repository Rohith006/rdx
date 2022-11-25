import {
    ACTIVE,
    ALL,
    ANDROID,
    BLACK_BERRY,
    CAP_PER_DEVICE,
    CAP_PER_IP,
    CAP_PER_IP_USER_AGENT,
    CARRIER,
    CARRIER_AND_WIFI,
    CPA,
    CPC,
    CPI,
    CPM,
    CTV,
    DELIVERY_TYPE,
    DESKTOP,
    ENGAGE,
    FIXED,
    HARD,
    IOS,
    MAC,
    MAC_OS,
    MAC_OS_X,
    MOBILE,
    MOBILE_AND_TABLETS,
    NEW,
    NO_CAP_ON_IMPRESSION,
    PAUSED,
    PERCENT,
    PRIVATE,
    PUBLIC,
    REACH,
    REMOVED,
    SOFT,
    SUSPENDED,
    SYMBIAN,
    TABLETS,
    TEST,
    WIFI,
    WINDOWS,
    WINDOWS_10,
    WINDOWS_7,
    WINDOWS_8,
    WINDOWS_8_1,
    WINDOWS_8_TABLET,
    WINDOWS_PHONE,
    WINDOWS_VISTA,
    WINDOWS_XP,
} from '../constants/campaign';
import moment from 'moment';
import * as plan from "../constants/plan";

module.exports = (sequelize, Sequelize) => {
  const Campaign = sequelize.define('campaign', {
    status: {
      type: Sequelize.ENUM(TEST, PAUSED, SUSPENDED, ACTIVE, NEW, REMOVED),
      notEmpty: true,
      allowNull: false,
    },
    accessStatus: {
      type: Sequelize.ENUM(PUBLIC, PRIVATE),
      notEmpty: true,
      allowNull: false,
      defaultValue: PUBLIC,
    },
    advertisingChannel: {
      type: Sequelize.ENUM(ENGAGE, REACH, PUBLIC),
    },
    campaignName: {
      type: Sequelize.STRING,
      notEmpty: true,
      allowNull: false,
    },
    appLink: {
      type: Sequelize.STRING,
    },
    selectedCarriers: {
      type: Sequelize.ARRAY(Sequelize.STRING),
      defaultValue: [],
    },
    appImage: {
      type: Sequelize.STRING,
    },
    frequencyCapping: {
      type: Sequelize.ENUM(NO_CAP_ON_IMPRESSION, CAP_PER_IP, CAP_PER_DEVICE, CAP_PER_IP_USER_AGENT),
    },
    frequencyCapValue: {
      type: Sequelize.INTEGER,
    },
    frequencyCapInterval: {
      type: Sequelize.STRING,
    },
    fqCapClick: {
      type: Sequelize.STRING,
    },
    fqCapClickValue: {
      type: Sequelize.INTEGER,
    },
    fqCapClickInterval: {
      type: Sequelize.STRING,
    },
    appTrackName: {
      type: Sequelize.STRING,
    },
    appDescription: {
      type: Sequelize.TEXT,
    },
    selectedBrowsers: {
      type: Sequelize.ARRAY(Sequelize.STRING),
      defaultValue: [],
    },
    offerDescription: {
      type: Sequelize.TEXT,
    },
    trackingUrl: {
      type: Sequelize.STRING(1500),
    },
    domain: {
      type: Sequelize.STRING(50),
    },
    titleXml: {
      type: Sequelize.STRING(25),
    },
    descriptionXml: {
      type: Sequelize.STRING(75),
    },
    dspImpUrl: {
      type: Sequelize.STRING(1500),
    },
    postbackUrl: {
      type: Sequelize.STRING,
      defaultValue: '',
    },
    enableNotifications: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    notificationsThreshold: {
      type: Sequelize.FLOAT,
      validate: {
        max: 100,
      },
    },
    startDate: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
    selfServed: {
      type: Sequelize.BOOLEAN,
      notEmpty: true,
      allowNull: false,
    },
    endDate: {
      type: Sequelize.DATE,
      defaultValue: moment().add(1, 'year'),
    },
    confirmedCopyrightOwnership: {
      type: Sequelize.BOOLEAN,
    },
    enableAntiFraudDetection: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    enableCrThreshold: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    lowestCrThreshold: {
      type: Sequelize.FLOAT,
    },
    highestCrThreshold: {
      type: Sequelize.FLOAT,
    },
    kpiType: {
      type: Sequelize.ENUM(SOFT, HARD),
    },
    clicksLifespan: {
      type: Sequelize.STRING,
    },
    geography: {
      type: Sequelize.ARRAY(Sequelize.STRING),
    },
    language: {
      type: Sequelize.ARRAY(Sequelize.STRING),
    },
    state: {
      type: Sequelize.ARRAY(Sequelize.STRING),
    },
    city: {
      type: Sequelize.ARRAY(Sequelize.STRING),
    },
    platform: {
      type: Sequelize.ARRAY(Sequelize.ENUM(IOS, ANDROID, BLACK_BERRY, WINDOWS_8_TABLET, WINDOWS_PHONE, SYMBIAN, MAC, MAC_OS, MAC_OS_X, WINDOWS, WINDOWS_XP, WINDOWS_VISTA, WINDOWS_7, WINDOWS_8, WINDOWS_8_1, WINDOWS_10, ALL)),
      notEmpty: true,
      allowNull: false,
    },
    deviceType: {
      type: Sequelize.ENUM(MOBILE, TABLETS, DESKTOP, MOBILE_AND_TABLETS, CTV, ALL),
      defaultValue: ALL,
    },
    connections: {
      type: Sequelize.ENUM(CARRIER_AND_WIFI, CARRIER, WIFI),
    },
    minIosVersion: {
      type: Sequelize.STRING,
    },
    maxIosVersion: {
      type: Sequelize.STRING,
    },
    minAndroidVersion: {
      type: Sequelize.STRING,
    },
    maxAndroidVersion: {
      type: Sequelize.STRING,
    },
    apiCampaignId: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    disableTestLink: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    paymentType: {
      type: Sequelize.ENUM(FIXED, PERCENT),
      defaultValue: FIXED,
    },
    modelPayment: {
      type: Sequelize.ENUM(CPI, CPA, CPM, CPC),
      defaultValue: CPI,
    },
    monetizationType: {
      type: Sequelize.STRING,
      defaultValue: null,
    },
    statusReason: {
      type: Sequelize.ENUM(plan.DL_EXHAUST,plan.ML_EXHAUST,plan.DB_EXHAUST,plan.HB_EXHAUST,plan.TB_EXHAUST,plan.IS_ACTIVE, plan.PAYMENT_FAILED),
    },
    creatives: {
      type: Sequelize.JSONB,
    },
    goals: {
      type: Sequelize.JSONB,
    },
    topLevelDomain: {
      type: Sequelize.STRING,
    },
    category: {
      type: Sequelize.ARRAY(Sequelize.STRING),
    },
    audiences: {
      type: Sequelize.ARRAY(Sequelize.INTEGER),
    },
    isDayPartingEnable: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    dayParting: {
      type: Sequelize.JSONB,
    },
    cappingType: {
      type: Sequelize.ENUM(CAP_PER_IP, CAP_PER_DEVICE),
    },
    cap: {
      type: Sequelize.INTEGER,
    },
    applyChannelRule: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    isPmpSupport: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    deliveryType: {
      type: Sequelize.ENUM(DELIVERY_TYPE.EAGER_BIDDING, DELIVERY_TYPE.CONSISTENT_BIDDING),
      defaultValue: null,
    },
    deactivatedAt: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    bidRequestParam: {
      type: Sequelize.STRING,
    },
    bidParams: {
      type: Sequelize.JSONB,
    },
    targetingAdvancedOptions: {
      type: Sequelize.BOOLEAN,
    },
    gender: {
      type: Sequelize.STRING,
    },
    ageGroup: {
      type: Sequelize.STRING,
    },
    ageRange: {
      type: Sequelize.JSONB,
    },
    inExGeomode: {
      type: Sequelize.STRING,
    },
    trafficType: {
      type: Sequelize.STRING,
    },
    conversionTrackingTag: {
      type: Sequelize.STRING(1500),
    },
    listTags: {
      type: Sequelize.ARRAY(Sequelize.STRING),
    },
    sdmin: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    sdmax: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    ctr: {
      type: Sequelize.FLOAT,
      allowNull: true,
    },
    resolutionsList: {
      type: Sequelize.ARRAY(Sequelize.STRING),
      defaultValue: [],
    },
    impressionTtl: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    clickTtl: {
      type: Sequelize.INTEGER,
      defaultValue: 48,
      allowNull: true,
    },
    minWinRate: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    bidStep: {
      type: Sequelize.FLOAT,
      allowNull: true,
    },
    isBiddingOptimization: {
      type: Sequelize.BOOLEAN,
    },
    isIncludeGeo: {
      type: Sequelize.BOOLEAN,
    },
    geoExclude: {
      type: Sequelize.ARRAY(Sequelize.STRING),
      defaultValue: [],
    },
  });

  Campaign.beforeCreate((campaign) => {
    const {
      enableNotifications, notificationsThreshold,
      enableCrThreshold, lowestCrThreshold, highestCrThreshold,
      platform, minIosVersion, maxIosVersion, minAndroidVersion, maxAndroidVersion,
    } = campaign;

    if (!enableNotifications && notificationsThreshold) {
      throw new Error('To specify notifications threshold you must enable notifications');
    }

    if (!enableCrThreshold && (lowestCrThreshold || highestCrThreshold)) {
      throw new Error('To specify CR threshold you must enable CR threshold');
    }

    if ((platform.includes(IOS)) && (platform.includes(ANDROID)) && (minIosVersion || maxIosVersion || minAndroidVersion || maxAndroidVersion)) {
      throw new Error('To specify OC version you must select IOS or ANDROID platform');
    }
  });

  Campaign.associate = (models) => {
    Campaign.hasOne(models.budget, {foreignKey: {allowNull: false}, onDelete: 'CASCADE'});
    Campaign.belongsTo(models.advertiser);
    Campaign.hasMany(models.inventory, {onDelete: 'CASCADE', foreignKey: {allowNull: true}});
    Campaign.hasOne(models.creativeTag, {onDelete: 'CASCADE', foreignKey: {allowNull: true}});
    Campaign.hasMany(models.campaignAudience, {onDelete: 'CASCADE', foreignKey: {allowNull: true}})
  };

  return Campaign;
};
