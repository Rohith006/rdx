module.exports = (sequelize, Sequelize) => {
  const VideoAdCreative = sequelize.define('videoAdCreative', {
    impressionUrl: {
      type: Sequelize.STRING(1500),
      notEmpty: false,
      allowNull: true,
    },
    videoDuration: {
      type: Sequelize.INTEGER,
      notEmpty: true,
      allowNull: false,
    },
    startDelay: {
      type: Sequelize.STRING,
      notEmpty: false,
      allowNull: true,
    },
    endCard: {
      type: Sequelize.BOOLEAN,
      notEmpty: false,
      allowNull: true,
    },
    videoName: {
      type: Sequelize.STRING,
    },
    videoSize: {
      type: Sequelize.STRING,
    },
    videoResolution: {
      type: Sequelize.STRING,
    },
    videoWidth: {
      type: Sequelize.STRING,
    },
    videoHeight: {
      type: Sequelize.STRING,
    },
    videoCreativeUrl: {
      type: Sequelize.STRING(1500),
    },
    videoCreatedAt: {
      notEmpty: false,
      allowNull: true,
      type: Sequelize.DATE,
    },

    imageName: {
      type: Sequelize.STRING,
      notEmpty: false,
      allowNull: true,
    },
    imageSize: {
      type: Sequelize.STRING,
      notEmpty: false,
      allowNull: true,
    },
    imageResolution: {
      type: Sequelize.STRING,
      notEmpty: false,
      allowNull: true,
    },
    imageWidth: {
      type: Sequelize.STRING,
      notEmpty: false,
      allowNull: true,
    },
    imageHeight: {
      type: Sequelize.STRING,
      notEmpty: false,
      allowNull: true,
    },
    imageCreativeUrl: {
      type: Sequelize.STRING(1500),
      notEmpty: false,
      allowNull: true,
    },
    imageCreatedAt: {
      notEmpty: false,
      allowNull: true,
      type: Sequelize.DATE,
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
      default: Date.now(),
    },
    adTitle: {
      type: Sequelize.STRING,
      notEmpty: false,
      allowNull: true,
    },
  });

  VideoAdCreative.associate = (models) => {
    VideoAdCreative.belongsTo(models.campaign);
  };

  return VideoAdCreative;
};
