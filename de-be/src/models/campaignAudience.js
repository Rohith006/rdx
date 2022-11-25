module.exports = (sequelize, Sequelize) => {
    const CampaignAudience = sequelize.define('campaignAudience', {
        segments : {
            type: Sequelize.JSONB,
            defaultValue: {}
        },
        groupsToggle: {
            type: Sequelize.ENUM("OR", "AND"),
            defaultValue: "OR"
        }
    });
    CampaignAudience.associate = (models) => {
        CampaignAudience.belongsTo(models.campaign);
    };
    return CampaignAudience;
}