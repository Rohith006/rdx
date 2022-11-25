'use strict';

module.exports = (sequelize, DataTypes) => {
  const PlatformSettings = sequelize.define('platformSettings', {
    configuration: {
      type: DataTypes.STRING,
    },
    setup: {
      type: DataTypes.JSONB,
    },
  });

  return PlatformSettings;
};
