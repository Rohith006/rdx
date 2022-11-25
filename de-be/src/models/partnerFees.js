module.exports = (sequelize, Sequelize) => {
    const PartnerFees = sequelize.define('partnerFees', {
        feesId:{
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        partnerName:{
            type:Sequelize.STRING,
            notEmpty:true,
            allowNull:false,
        },
        partnerTypeName:{
            type:Sequelize.STRING,
            notEmpty:true,
            allowNull:false,
        },
        feesType:{
            type: Sequelize.ENUM('CPM','FIXED','REV SHARE'),
            notEmpty:true,
            allowNull:false,
        },
        fees:{
            type:Sequelize.FLOAT,
            notEmpty:true,
            allowNull:false,
        },
        monthlyMin:{
            type:Sequelize.FLOAT,
            allowNull:true,
        },
        status:{
            type:Sequelize.ENUM('ACTIVE','INACTIVE','REMOVED'), // from constants file status
            notEmpty:true,
            allowNull:false,
        },
        advertisers:{
            type:Sequelize.JSONB, // todo: change to array of objects
            notEmpty:true,
            allowNull:false,
            defaultValue:'{"advertisers":"[]"}',
        }
    });

  
    return PartnerFees;
  };