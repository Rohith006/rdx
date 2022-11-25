import {platformSettings as PlatformSettings, sequelize} from '../models';

export const updateUserSettings = async (user, data) => {
  if (!user || !user.id || !data || !Object.keys(data).length) {
    return null;
  }

  try {
    const settings = await PlatformSettings.update({setup: data}, {
      where: {configuration: 'general', userId: user.id, userType: user.role},
      returning: true,
    });

    return settings ? settings[1][0].get() : null;
  } catch (e) {
    console.error(e);
  }
};

export const getQps = async () => {
  try {
    const qps = {};
    const settings = await PlatformSettings.findOne();
    const sumQpsPub = await sequelize.query('SELECT sum(qps) from publishers where qps>0');
    qps.incomingQps = Number(sumQpsPub[0][0].sum);
    qps.qpsPlatformLimit = settings.get().setup.qpsPlatformLimit;

    return qps;
  } catch (e) {
    console.error(e);
  }
};

