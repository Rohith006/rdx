import {roles} from '../constants/user';
import * as plan from "../constants/plan";

module.exports = (sequelize, Sequelize) => {
  const Advertiser = sequelize.define('advertiser', {
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
    role: {
      type: Sequelize.ENUM(roles.ADVERTISER),
      allowNull: false,
    },
    status: {
      type: Sequelize.STRING,
    },
    companyName: {
      type: Sequelize.STRING,
    },
    managerId: {
      type: Sequelize.INTEGER,
    },
    isInventoriesAllowed: {
      type: Sequelize.BOOLEAN,
    },
    isCampaignsAllowed: {
      type: Sequelize.BOOLEAN,
    },
    skype: {
      type: Sequelize.STRING,
    },
    isAcceptedAgreement: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    apiKey: {
      type: Sequelize.STRING,
    },
    reportUrl: {
      type: Sequelize.STRING,
    },
    statusReason: {
      type: Sequelize.ENUM(plan.DL_EXHAUST, plan.ML_EXHAUST, plan.IS_ACTIVE, plan.PAYMENT_FAILED)
    }
  });

  Advertiser.associate = (models) => {
    Advertiser.hasOne(models.campaignTags, {onDelete: 'CASCADE'});
    Advertiser.hasMany(models.campaign, {foreignKey: {allowNull: true}});
    // Advertiser.belongsTo(models.admin);
    Advertiser.hasOne(models.billingDetails);
    Advertiser.hasMany(models.audience);
    Advertiser.hasOne(models.subscriptions,{onDelete:'CASCADE'});
    Advertiser.hasOne(models.advertiserUsages,{onDelete:'CASCADE'});
    Advertiser.hasMany(models.transactionRequests,{onDelete:'CASCADE'});
  };
  return Advertiser;
};
