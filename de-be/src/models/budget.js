import {FIXED, PERCENT} from '../constants/campaign';

module.exports = (sequelize, Sequelize) => {
  const Budget = sequelize.define('budget', {
    bid: {
      type: Sequelize.FLOAT,
    },
    currentBid: {
      type: Sequelize.FLOAT,
    },
    isBidRange: {
      type: Sequelize.BOOLEAN
    },
    minBid: {
      type: Sequelize.FLOAT
    },
    maxBid:{
      type: Sequelize.FLOAT
    },
    dailyBudget: {
      type: Sequelize.FLOAT,
    },
    globalPayout: {
      type: Sequelize.FLOAT,
    },
    hourlyBudget: {
      type: Sequelize.FLOAT,
    },
    totalBudget: {
      type: Sequelize.FLOAT,
    },
    paymentType: {
      type: Sequelize.ENUM(FIXED, PERCENT),
      defaultValue: FIXED,
    },
    currencyBid: {
      type: Sequelize.STRING,
    },
  });

  Budget.associate = (models) => {
    Budget.belongsTo(models.campaign);
  };

  return Budget;
};
