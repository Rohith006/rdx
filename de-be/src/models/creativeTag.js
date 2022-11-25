module.exports = (sequelize, Sequelize) => {
  const CreativeTag = sequelize.define('creativeTag', {
    tagEnable: {
      type: Sequelize.BOOLEAN,
      notEmpty: true,
      allowNull: false,
      defaultValue: false,
    },
    tagUrl: {
      type: Sequelize.TEXT,
      notEmpty: false,
      allowNull: true,
    },
    impressionUrl: {
      type: Sequelize.STRING(1500),
      notEmpty: false,
      allowNull: true,
    },
  });

  CreativeTag.associate = (models) => {
    CreativeTag.belongsTo(models.campaign);
  };

  return CreativeTag;
};
