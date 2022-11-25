'use strict';

module.exports = (sequelize, Sequelize) => {
  const WhiteBlackListItems = sequelize.define('whiteBlackListItems', {
    value: {
      type: Sequelize.STRING,
    },
    type: {
      type: Sequelize.STRING,
    },
    list: {
      type: Sequelize.STRING, // WHITELIST or BLACKLIST
    },
    demandType: {
      type: Sequelize.STRING, // CAMPAIGN
    },
  }, {});

  WhiteBlackListItems.associate = function(models) {
    WhiteBlackListItems.hasMany(models.campaignToWBListItems);
  };

  return WhiteBlackListItems;
};
