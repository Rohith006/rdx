module.exports = (sequelize, Sequelize) => {
  const Creative = sequelize.define('creative', {
    name: {
      type: Sequelize.STRING,
      notEmpty: true,
      allowNull: false,
    },
    size: {
      type: Sequelize.STRING,
    },
    resolution: {
      type: Sequelize.STRING,
    },
    width: {
      type: Sequelize.STRING,
    },
    height: {
      type: Sequelize.STRING,
    },
    creativeUrl: {
      type: Sequelize.STRING(1500),
    },
    preview: {
      type: Sequelize.STRING(1500),
    },
  });

  Creative.associate = (models) => {
    Creative.belongsTo(models.campaign);
  };

  return Creative;
};
