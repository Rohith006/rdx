import {audience as Audience, Sequelize} from '../../models';
import AudienceService from '../audience.service';
import {wlid, clickhouse} from '../../../config';
import dateUtils from '../../utils/date';
import chCluster from '../../utils/client/chCluster';

import log from '../../../logger';

const Op = Sequelize.Op;

export const runTaskPopulateAudience = async () => {
  try {
    console.log(`=== Start updating audiences ===`);
  const audiences = await Audience.findAll({
    where: {
      [Op.and]:[
        {status:'ACTIVE'},
        {type:['IFA', 'IP']}
      ]
    }
  });

  if (audiences && audiences.length) {
    // FIXME
    // const start = dateUtils.startOf('hour', -1);
    // const end = dateUtils.endOf('hour');
    const start = dateUtils.startOf('minute', -10);
    const end = dateUtils.now();
    console.log('start time', start);
    console.log('end time', end)
    const audienceByImp = [];
    const audienceByClick = [];
    const audienceIPByImp = [];
    const audienceIPByClick = [];
    const collectIFAFromImpressions = [];
    const collectIFAFromClicks = [];
    const collectIPFromImpressions = [];
    const collectIPFromClicks = [];

    audiences.map((item) => {
      if(item.type === "IFA")
      {
        if(item.peopleWith && item.peopleWith.includes('IMPRESSIONS')) {
          collectIFAFromImpressions.push(...item.collectFromIds);
          audienceByImp.push(item);
        }
        if(item.peopleWith && item.peopleWith.includes('CLICKS')) {
          collectIFAFromClicks.push(...item.collectFromIds);
          audienceByClick.push(item);
        }
      }
      else{
        if(item.peopleWith && item.peopleWith.includes('IMPRESSIONS')) {
          collectIPFromImpressions.push(...item.collectFromIds);
          audienceIPByImp.push(item);
        }
        if(item.peopleWith && item.peopleWith.includes('CLICKS')) {
          collectIPFromClicks.push(...item.collectFromIds);
          audienceIPByClick.push(item);
        }
      }
    });

    if (audienceByImp.length) {
      const impressions = await getIfaFromImpressions(collectIFAFromImpressions, start, end);
      const data = new Map();
      impressions && impressions.map((imp) => {
        audienceByImp.map((audience) => {
          if (audience.collectFromIds.includes(imp.campaignId)) {
            let ifas = data.get(audience.id);
            if (!ifas) {
              ifas = new Set();
              ifas.add(imp.ifa);
              data.set(audience.id, ifas);
            } else {
              ifas.add(imp.ifa);
            }
          }
        });
      });

      data.forEach((value, key) => {
        const audience = {
          audienceId: key,
          ifas: Array.from(value),
        };
        AudienceService.addUsersToAudience(audience);
      });
    }

    if (audienceByClick.length) {
      const clicks = await getIfaFromClicks(collectIFAFromClicks, start, end);
      const data = new Map();
      clicks && clicks.map((click) => {
        audienceByClick.map((audience) => {
          if (audience.collectFromIds.includes(click.campaignId)) {
            let ifas = data.get(audience.id);
            if (!ifas) {
              ifas = new Set();
              ifas.add(click.ifa);
              data.set(audience.id, ifas);
            } else {
              ifas.add(click.ifa);
            }
          }
        });
      });

      data.forEach((value, key) => {
        const audience = {
          audienceId: key,
          ifas: Array.from(value),
        };
        AudienceService.addUsersToAudience(audience);
      });
    }

    //For GETTING IPs

    if (audienceIPByImp.length) {
      const impressions = await getIPFromImpressions(collectIPFromImpressions, start, end);
      const data = new Map();
      impressions && impressions.map((imp) => {
        audienceIPByImp.map((audience) => {
          if (audience.collectFromIds.includes(imp.campaignId)) {
            let ips = data.get(audience.id);
            if (!ips) {
              ips = new Set();
              ips.add(imp.ip);
              data.set(audience.id, ips);
            } else {
              ips.add(imp.ip);
            }
          }
        });
      });

      data.forEach((value, key) => {
        const audience = {
          audienceId: key,
          ips: Array.from(value),
        };
        AudienceService.addIPtoAudience(audience);
      });
    }

    if (audienceIPByClick.length) {
      const clicks = await getIPFromClicks(collectIPFromClicks, start, end);
      const data = new Map();
      clicks && clicks.map((click) => {
        audienceIPByClick.map((audience) => {
          if (audience.collectFromIds.includes(click.campaignId)) {
            let ips = data.get(audience.id);
            if (!ips) {
              ips = new Set();
              ips.add(click.ip);
              data.set(audience.id, ips);
            } else {
              ips.add(click.ip);
            }
          }
        });
      });

      data.forEach((value, key) => {
        const audience = {
          audienceId: key,
          ips: Array.from(value),
        };
        AudienceService.addIPtoAudience(audience);
      });
    }
  }
  } catch (error) {
    console.error(`run task populate error ${error}`)
  }
};

export const getIfaFromImpressions = async (campaignIds, startDate, endDate, limit = 20000) => {
  const query = `
      SELECT 
        id, 
        campaignId, 
        ifa 
      FROM dsp.${clickhouse.distributed_impressions} 
      WHERE wlid='${wlid}' and campaignId in (${campaignIds.join(',')}) and createdAt BETWEEN '${startDate}' and '${endDate}'
        and notEmpty(ifa) and status = 'APPROVED' 
      LIMIT ${limit}`;

  try {
    const result = await chCluster.querying(query);
    return result.data;
  } catch (e) {
    log.error(`Error getting ifa from impressions \n ${e}`);
  }
};

export const getIfaFromClicks = async (campaignIds, startDate, endDate, limit = 20000) => {
  const query = `
      SELECT 
        id, 
        campaignId, 
        ifa 
      FROM dsp.${clickhouse.distributed_clicks} 
      WHERE wlid='${wlid}' and campaignId in (${campaignIds.join(',')}) and createdAt BETWEEN '${startDate}' and '${endDate}'
        and notEmpty(ifa) and status = 'APPROVED' 
      LIMIT ${limit}`;

  try {
    const result = await chCluster.querying(query);
    return result.data;
  } catch (e) {
    log.error(`Error getting ifa from clicks \n ${e}`);
  }
};

export const getIPFromImpressions = async (campaignIds, startDate, endDate, limit = 20000) => {
  const query = `
      SELECT 
        id, 
        campaignId, 
        ip 
      FROM dsp.${clickhouse.distributed_impressions} 
      WHERE wlid='${wlid}' and campaignId in (${campaignIds.join(',')}) and createdAt BETWEEN '${startDate}' and '${endDate}'
        and notEmpty(ip) and status = 'APPROVED' 
      LIMIT ${limit}`;

  try {
    const result = await chCluster.querying(query);
    return result.data;
  } catch (e) {
    log.error(`Error getting ip from impressions \n ${e}`);
  }
};

export const getIPFromClicks = async (campaignIds, startDate, endDate, limit = 20000) => {
  const query = `
      SELECT 
        id, 
        campaignId, 
        ip 
      FROM dsp.${clickhouse.distributed_clicks}
      WHERE wlid='${wlid}' and campaignId in (${campaignIds.join(',')}) and createdAt BETWEEN '${startDate}' and '${endDate}'
        and notEmpty(ip) and status = 'APPROVED' 
      LIMIT ${limit}`;

  try {
    const result = await chCluster.querying(query);
    return result.data;
  } catch (e) {
    log.error(`Error getting ip from clicks \n ${e}`);
  }
};
