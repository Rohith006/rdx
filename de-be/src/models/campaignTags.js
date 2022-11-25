module.exports = (sequelize, DataTypes) => {
  const CampaignTags = sequelize.define('campaignTags', {
    name: {
      type: DataTypes.STRING,
      notEmpty: true,
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING,
    },
    isChecked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });
  CampaignTags.associate = (models) => {
    CampaignTags.belongsTo(models.advertiser);
    CampaignTags.belongsTo(models.admin);
  };
  return CampaignTags;
};
