import {bidTypes, protocolType} from '../constants/ssp';

module.exports = (sequelize, Sequelize) => {
  const Inventory = sequelize.define('inventory', {

    name: {
      type: Sequelize.STRING,
      notEmpty: true,
      allowNull: false,
    },
    payout: {
      type: Sequelize.INTEGER,
      notEmpty: true,
      allowNull: false,
      defaultValue: 65,
    },
    publisherId: {
      type: Sequelize.INTEGER,
      notEmpty: true,
      allowNull: false,
    },
    rtbProtocolVersion: {
      type: Sequelize.STRING,
    },
    protocolType: {
      type: Sequelize.ENUM(protocolType.oRTB),
    },
    adType: {
      type: Sequelize.ARRAY(Sequelize.STRING),
      defaultValue: null,
    },
    bidType: {
      type: Sequelize.ENUM(bidTypes.CPM, bidTypes.CPC),
      defaultValue: bidTypes.CPM,
    },
    trafficType: {
      type: Sequelize.STRING,
    },

  });

  Inventory.associate = (models) => {
    Inventory.belongsTo(models.campaign);
    Inventory.belongsTo(models.publisher);
  };

  return Inventory;
};
