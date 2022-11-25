'use strict';

module.exports = (sequelize, Sequelize) => {
  const CampaignToWBListItems = sequelize.define('campaignToWBListItems', {

  }, {});

  CampaignToWBListItems.associate = function(models) {
    CampaignToWBListItems.belongsTo(models.campaignPubSubIdBWlist);
    CampaignToWBListItems.belongsTo(models.whiteBlackListItems);
  };

  return CampaignToWBListItems;
};
