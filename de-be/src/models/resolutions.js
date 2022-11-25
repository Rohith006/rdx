module.exports = (sequelize, Sequelize) => {
  const Resolution = sequelize.define('resolution', {
    width: {
      type: Sequelize.STRING,
      primaryKey: true,
    },
    height: {
      type: Sequelize.STRING,
      primaryKey: true,
    },
  });
  return Resolution;
};
