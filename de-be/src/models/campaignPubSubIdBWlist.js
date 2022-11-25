'use strict';

module.exports = (sequelize, Sequelize) => {
  const CampaignPubSubIdBWlist = sequelize.define('campaignPubSubIdBWlist', {
    campaignId: {
      type: Sequelize.STRING,
    },
    publisherId: {
      type: Sequelize.STRING,
      defaultValue: null, // If null - all publisher's subIds are blacklisted for campaign
    },
    list: {
      type: Sequelize.STRING, // WHITELIST or BLACKLIST
      allowNull: false,
    },
    type: {
      type: Sequelize.STRING,
    },
  }, {});

  CampaignPubSubIdBWlist.associate = function(models) {
    CampaignPubSubIdBWlist.hasMany(models.campaignToWBListItems);
  };

  return CampaignPubSubIdBWlist;
};
