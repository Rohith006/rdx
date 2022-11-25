module.exports = (sequelize, Sequelize) => {
  const DMPSegment = sequelize.define('dmpSegment', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    segmentId: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    segmentName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    segmentDetails: {
      type: Sequelize.JSONB,
    },
    dmpPartner: {
      type: Sequelize.INTEGER,
    },
// TODO: define association witm dmpPartner
  });

  return DMPSegment;
};
