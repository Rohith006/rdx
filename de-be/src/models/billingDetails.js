import {roles} from '../constants/user';

module.exports = (sequelize, Sequelize) => {
  const BillingDetails = sequelize.define('billingDetails', {
    firstName: {
      type: Sequelize.STRING,
    },
    lastName: {
      type: Sequelize.STRING,
    },
    email: {
      type: Sequelize.STRING,
      validate: {
        isEmail: true,
      },
    },
    address: {
      type: Sequelize.STRING,
    },
    city: {
      type: Sequelize.STRING,
    },
    country: {
      type: Sequelize.STRING,
    },
    zipCode: {
      type: Sequelize.STRING(20),
    },
    isCorporation: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    companyName: {
      type: Sequelize.STRING,
    },
    companyAddress: {
      type: Sequelize.STRING,
    },
    companyCity: {
      type: Sequelize.STRING,
    },
    companyCountry: {
      type: Sequelize.STRING,
    },
    companyZipCode: {
      type: Sequelize.STRING(20),
    },
    taxId: {
      type: Sequelize.STRING,
    },
    userId: {
      type: Sequelize.INTEGER,
      notEmpty: true,
      allowNull: false,
    },
    userType: {
      type: Sequelize.ENUM(roles.ADVERTISER, roles.PUBLISHER),
      notEmpty: true,
      allowNull: false,
    },
  });

  BillingDetails.beforeCreate((billingDetails) => {
    const {isCorporation, companyName} = billingDetails;

    if (isCorporation && !companyName) {
      throw new Error('Field companyName is required');
    }
  });

  BillingDetails.associate = (models) => {
    BillingDetails.belongsTo(models.advertiser);
  };

  return BillingDetails;
};
