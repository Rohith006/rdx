module.exports = (sequelize,Sequelize) => {
    const AudioAdCreative = sequelize.define('audioAdCreative', {
        impressionUrl: {
            type: Sequelize.STRING(1500),
            notEmpty: false,
            allowNull: true,
        },
        audioMimeType:{
            type: Sequelize.STRING,
            notEmpty:false,
            allowNull:true,
        },
        audioDuration: {
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
        audioName: {
            type: Sequelize.STRING,
        },
        audioSize: {
            type: Sequelize.STRING,
        },
        audioBitrate: {
            type: Sequelize.STRING,
        },
        audioCreativeUrl: {
            type: Sequelize.STRING(1500),
        },
        audioCreatedAt: {
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

    AudioAdCreative.associate = (models) => {
        AudioAdCreative.belongsTo(models.campaign);
    };

    return AudioAdCreative;
}