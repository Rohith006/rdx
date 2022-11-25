import {CLICKS, IMPRESSIONS} from '../constants/reports';
import {ACTIVE, NEW, PAUSED, REMOVED, SUSPENDED, TEST} from '../constants/campaign';
import {IFA, IP} from "../constants/audience";

module.exports = (sequelize, Sequelize) => {
  const Audience = sequelize.define('audience', {
    collectFromIds: {
      type: Sequelize.ARRAY(Sequelize.INTEGER),
    },
    peopleWith: {
      type: Sequelize.ARRAY(Sequelize.ENUM(IMPRESSIONS, CLICKS)),
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    status: {
      type: Sequelize.ENUM(TEST, PAUSED, SUSPENDED, ACTIVE, NEW, REMOVED),
    },
    type: {
      type: Sequelize.ENUM(IFA, IP)
    }
  });

  Audience.associate = (models) => {
    Audience.belongsTo(models.advertiser);
  };

  return Audience;
};
