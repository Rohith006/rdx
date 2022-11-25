import {admin as Admin, platformSettings as PlatformSettings,} from '../models';
import {permissions, roles, statuses} from '../constants/user';
import {defaultManager} from '../../config';
import fs from 'fs';

import log from '../../logger';

export const setPlatformSettings = async () => {
  try {
    // const owner = await Admin.findOne({where: {email: defaultAdmin.email}});
    //
    // if (owner) {
    //   log.info('Admin exists');
    //   return;
    // }
    //
    // const options = {
    //   status: statuses.ACTIVE,
    //   permissions: [...Object.values(permissions)],
    //   role: roles.ADMIN,
    //   email: defaultAdmin.email,
    //   name: defaultAdmin.name,
    //   password: defaultAdmin.pass,
    // };
    //
    // await Admin.create(options);

    await PlatformSettings.create({
      configuration: 'userActivation',
      setup: {
        advertiserActivation: true,
        publisherActivation: true,
        textAcceptAgreement: '',
      },
    });

    log.info('platform settings set');
  } catch (e) {
    log.error(`platform settings \n ${e.message}`);
  }
};

export const createCreativeDir = async () => {
  try {
    const dir = `public/creatives/`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    const dir2 = `public/ads/`;
    if (!fs.existsSync(dir2)) {
      fs.mkdirSync(dir2);
    }
    const dir3 = `private`;
    if (!fs.existsSync(dir3)) {
      fs.mkdirSync(dir3);
    }
    const dir4 = `private/reports/`;
    if (!fs.existsSync(dir4)) {
      fs.mkdirSync(dir4);
    }
  } catch (e) {
    log.error(`creating dir creatives \n ${e.stack}`);
  }
};

export const createDefaultAccountManager = async () => {
  try {
    const accManager = await Admin.findOne({where: {email: 'manager.dsp@mail.com'}});

    if (accManager) {
      log.info('account manager exists');
      return;
    }

    const options = {
      role: roles.ACCOUNT_MANAGER,
      email: defaultManager.email,
      name: defaultManager.name,
      password: defaultManager.password,
      permissions: [permissions.ADVERTISERS, permissions.PUBLISHERS],
      status: statuses.ACTIVE,
    };

    await Admin.create(options);
    log.info('account manager created');
  } catch (e) {
    log.error(`creating manager \n ${e.stack}`);
  }
};

