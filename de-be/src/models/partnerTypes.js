
module.exports = (sequelize, Sequelize) => {

    const PartnerTypes = sequelize.define('partnerTypes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      partnerTypeName: {
        type: Sequelize.STRING,
        notEmpty: false,
        allowNull: false
      },
      partnersListTable:{
        type:Sequelize.STRING,
        notEmpty:false,
        allowNull:false,
      }
    });
  
    return PartnerTypes;
  };
  