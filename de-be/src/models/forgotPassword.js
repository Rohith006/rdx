import {APPROVED, PENDING} from '../constants/forgotPassword';

module.exports = (sequelize, Sequelize) => {
  const ForgotPassword = sequelize.define('forgotPassword', {
    status: {
      type: Sequelize.ENUM(PENDING, APPROVED),
      notEmpty: true,
      allowNull: false,
    },
    restoreKey: {
      type: Sequelize.STRING,
      notEmpty: true,
      allowNull: false,
    },
    userId: {
      type: Sequelize.INTEGER,
    },
    userType: {
      type: Sequelize.STRING,
    },
  });

  return ForgotPassword;
};
