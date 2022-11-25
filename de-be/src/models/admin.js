'use strict';

import {permissions, roles, statuses} from '../constants/user';

module.exports = (sequelize, DataTypes) => {
  const Admin = sequelize.define('admin', {
    name: {
      type: DataTypes.STRING,
      notEmpty: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      notEmpty: true,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    role: {
      type: DataTypes.ENUM(roles.OWNER, roles.ADMIN, roles.ACCOUNT_MANAGER),
      notEmpty: true,
      allowNull: false,
    },
    skype: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.ENUM(statuses.ACTIVE, statuses.BANNED, statuses.REMOVED),
      defaultValue: statuses.ACTIVE,
    },
    permissions: {
      type: DataTypes.ARRAY(DataTypes.ENUM(
          permissions.ADD_ADMINS,
          permissions.SEE_PROFIT,
          permissions.DELETE_USERS,
          permissions.ADVERTISERS,
          permissions.CAMPAIGN,
          permissions.DASHBOARD,
          permissions.LOGS,
          permissions.PUBLISHERS,
      )),
      notEmpty: false,
      allowNull: true,
    },
  });
  Admin.associate = (models) => {
    Admin.hasOne(models.campaignTags, {onDelete: 'CASCADE'});
  };

  /*
  Admin.beforeCreate((admin) => {
    const {password} = admin;
    admin.password = bcrypt.hashSync(password, 10);
  });

  Admin.beforeBulkUpdate((admin) => {
    const {password} = admin.attributes;
    if (password) {
      admin.attributes.password = bcrypt.hashSync(password, 10);
    }
  });
   */

  return Admin;
};
