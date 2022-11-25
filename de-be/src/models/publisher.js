import {publisherTypes, roles, statuses} from '../constants/user';
import {bidTypes, protocolType} from '../constants/ssp';
import {ENGAGE, PREMIUM, PUBLIC, REACH} from '../constants/campaign';
import bcrypt from 'bcrypt';
import {FIRST_PRICE} from '../constants/common';

module.exports = (sequelize, Sequelize) => {
  const Publisher = sequelize.define('publisher', {
    name: {
      type: Sequelize.STRING,
      notEmpty: true,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
      notEmpty: true,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    payout: {
      type: Sequelize.STRING,
    },
    role: {
      type: Sequelize.ENUM(roles.PUBLISHER),
      allowNull: false,
    },
    status: {
      type: Sequelize.ENUM(statuses.PENDING, statuses.ACTIVE, statuses.REJECTED, statuses.BANNED, statuses.REMOVED, statuses.PAUSED),
    },
    companyName: {
      type: Sequelize.STRING,
    },
    skype: {
      type: Sequelize.STRING,
    },
    country: {
      type: Sequelize.STRING,
    },
    address: {
      type: Sequelize.STRING,
    },
    city: {
      type: Sequelize.STRING,
    },
    type: {
      type: Sequelize.ENUM(publisherTypes.MEDIA_BUYING_TEAM, publisherTypes.AD_NETWORK, publisherTypes.AFFILIATE_NETWORK, publisherTypes.AD_AGENCY, publisherTypes.SSP),
    },
    channel: {
      type: Sequelize.ARRAY(Sequelize.ENUM(REACH, ENGAGE, PREMIUM, PUBLIC)),
      defaultValue: [REACH],
    },
    apiKey: {
      type: Sequelize.STRING,
    },
    isAcceptedAgreement: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    postbackUrl: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    sspStatisticUrl: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    location: {
      type: Sequelize.STRING,
    },
    bidderUrl: {
      type: Sequelize.STRING,
    },
    winNotifyUrl: {
      type: Sequelize.STRING,
    },
    sspEndpoint: {
      type: Sequelize.STRING,
    },
    fallback: {
      type: Sequelize.STRING,
    },
    sspKey: {
      type: Sequelize.STRING,
    },
    managerId: {
      type: Sequelize.INTEGER,
    },
    isEnableRTB: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    isEnableDirectPublisher: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    isAutoConnectDemands: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    rtbProtocolVersion: {
      type: Sequelize.STRING,
    },
    protocolType: {
      type: Sequelize.ENUM(protocolType.oRTB),
    },
    trafficType: {
      type: Sequelize.STRING,
    },
    adType: {
      type: Sequelize.ARRAY(Sequelize.STRING),
      defaultValue: null,
    },
    auctionType: {
      type: Sequelize.STRING,
      defaultValue: FIRST_PRICE,
    },
    bidType: {
      type: Sequelize.ENUM(bidTypes.CPM, bidTypes.CPC),
      defaultValue: bidTypes.CPM,
    },
    paymentsWith: {
      type: Sequelize.STRING,
    },
    tmax: {
      type: Sequelize.INTEGER,
    },
    qps: {
      type: Sequelize.INTEGER,
    },
    isShowAdvertiserStats: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    defaultBidfloor: {
      type: Sequelize.FLOAT,
      defaultValue: null,
    },
    qpsThreshold: {
      type: Sequelize.INTEGER,
      defaultValue: null,
    },
  });

  /*
  Publisher.beforeCreate((publisher) => {
    const {password} = publisher;

    publisher.password = bcrypt.hashSync(password, 10);
  });

  Publisher.beforeBulkUpdate((publisher) => {
    const {password} = publisher.attributes;

    if (password) {
      publisher.attributes.password = bcrypt.hashSync(password, 10);
    }
  });
   */

  Publisher.associate = (models) => {
    Publisher.hasMany(models.inventory, {onDelete: 'CASCADE', foreignKey: {allowNull: true}});
  };

  return Publisher;
};
