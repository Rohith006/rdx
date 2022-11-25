
module.exports = (sequelize, Sequelize) => {

    const Plans = sequelize.define('plans', {
        consolePlanId:{
            type: Sequelize.INTEGER,
            allowNull: false
        },
        planName:{
            type: Sequelize.STRING,
            allowNull: false
        },
        active:{
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },
        validityPeriod:{
            type: Sequelize.INTEGER,
            allowNull: false
        },
        monthlyLimit:{
            type: Sequelize.INTEGER,
            allowNull: false
        }
    });
    Plans.associate = (models) => {
        Plans.hasMany(models.subscriptions,{onDelete:'CASCADE'});
    }
    return Plans;
  };