module.exports = (sequelize, Sequelize) => {

    const AdvertiserUsages = sequelize.define('advertiserUsages', {
        date:{
            type: Sequelize.DATEONLY,
            allowNull: false
        },
        dailySpendLimit:{
            type: Sequelize.FLOAT,
            allowNull: false,
            defaultValue:0.00
        },
        actualSpend:{
            type: Sequelize.FLOAT,
            allowNull: false,
            defaultValue:0.00
        }
    });
    AdvertiserUsages.associate = (models) => {
        AdvertiserUsages.belongsTo(models.advertiser)
    }
    return AdvertiserUsages;
  };