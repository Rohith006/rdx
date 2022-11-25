
module.exports = (sequelize, Sequelize) => {

    const AdServingPartner = sequelize.define('adServingPartner', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      partnerName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      contractDocument:{
        type: Sequelize.STRING,
        allowNull: true,
      }
    });
  
    return AdServingPartner;
  };
  