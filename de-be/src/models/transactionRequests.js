module.exports = (sequelize, Sequelize) => {

    const TransactionRequests = sequelize.define('transactionRequests', {
        amount:{
            type: Sequelize.FLOAT,
            allowNull: false,
            defaultValue:0.00
        },
        requestTime:{
            type: Sequelize.DATE,
            allowNull: false
        },
        success:{
            type: Sequelize.BOOLEAN,
            allowNull: false
        },
        retries:{
            type: Sequelize.INTEGER,
            allowNull: false
        },
        response:{
            type:Sequelize.JSONB,
            allowNull:false,
            defaultValue:'{}',
        }

    });
    TransactionRequests.associate = (models) => {
        TransactionRequests.belongsTo(models.advertiser);
    }
    return TransactionRequests;
  };