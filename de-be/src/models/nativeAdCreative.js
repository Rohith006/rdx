module.exports = (sequelize, Sequelize) => {
  const NativeAdCreative = sequelize.define('nativeAdCreative', {
    name: {
      type: Sequelize.STRING,
      notEmpty: true,
      defaultValue: '',
    },
    cta: {
      type: Sequelize.STRING,
    },
    sponsored: {
      type: Sequelize.STRING,
    },
    rating: {
      type: Sequelize.STRING,
      notEmpty: false,
      allowNull: true,
    },
    description: {
      type: Sequelize.TEXT,
    },

    mainImageName: {
      type: Sequelize.STRING,
    },
    mainImageSize: {
      type: Sequelize.STRING,
    },
    mainImageResolution: {
      type: Sequelize.STRING,
    },
    mainImageWidth: {
      type: Sequelize.STRING,
    },
    mainImageHeight: {
      type: Sequelize.STRING,
    },
    mainImageCreativeUrl: {
      type: Sequelize.STRING(1500),
    },
    mainImageCreatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Date.now(),
    },

    iconImageName: {
      type: Sequelize.STRING,
    },
    iconImageSize: {
      type: Sequelize.STRING,
    },
    iconImageResolution: {
      type: Sequelize.STRING,
    },
    iconImageWidth: {
      type: Sequelize.STRING,
    },
    iconImageHeight: {
      type: Sequelize.STRING,
    },
    iconImageCreativeUrl: {
      type: Sequelize.STRING(1500),
    },
    iconImageCreatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Date.now(),
    },

    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
      default: Date.now(),
    },
  });

  NativeAdCreative.associate = (models) => {
    NativeAdCreative.belongsTo(models.campaign);
  };

  return NativeAdCreative;
};
