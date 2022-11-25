
module.exports = (sequelize, Sequelize) => {

  const DMPPartner = sequelize.define('dmpPartner', {
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

  return DMPPartner;
};
