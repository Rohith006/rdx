
module.exports = (sequelize, Sequelize) => {

    const Subscriptions = sequelize.define('subscriptions', {
        startDate:{
            type: Sequelize.DATE,
            allowNull: false
        },
        endDate:{
            type: Sequelize.DATE,
            allowNull: false
        },
        dailyLimit:{
            type: Sequelize.INTEGER,
            allowNull: true
        },
        status:{
            type: Sequelize.ENUM('ACTIVE','INACTIVE'),
            allowNull: false
        }
    });
    Subscriptions.associate = (models) => {
        Subscriptions.belongsTo(models.plans);
        Subscriptions.belongsTo(models.advertiser);
    }
    return Subscriptions;
  };