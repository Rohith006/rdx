import moment from 'moment';
import {publisher as Publisher} from '../../models';
import ch from '../../utils/clickhouse';
import {clickhouse, wlid} from '../../../config';

let redisClient;
const {bidReqCounterCreative, bidReqCounterMain, versionTable} = clickhouse;

const getInventorySummary = async (today, sevenDaysAgo, id) => {
  const {data} = await ch.querying(
      `select 
                  toInt32((select count() from dsp.impressions_${versionTable} where publisherId = ${id} and createdDate between '${sevenDaysAgo}' and '${today}' and wlid='${wlid}')) as impressionsDaily,
                  (select floor(avgMerge( avgBidfloor ), 6) from dsp.bidrequests_${bidReqCounterMain} where publisherId=${id} and date between '${sevenDaysAgo}' and '${today}' and wlid='${wlid}') as averageCpm
                  `,
  );
  const publisher = await Publisher.findOne({
    where: id,
    includes: ['trafficType'],
  });
  data[0].trafficType = publisher.get().trafficType;
  return data[0];
};

const getInventorySummaryDimensions = async (today, sevenDaysAgo, id) => {
  const {data} = await ch.querying(
      `select creativeWidth, creativeHeight, countMerge(amount) as counter from dsp.bidrequests_${bidReqCounterCreative} where date between '${sevenDaysAgo}' and '${today}' and publisherId=${id} and wlid='${wlid}'
                  group by creativeWidth, creativeHeight order by counter desc limit 3
                  `,
  );

  return data;
};

const getInventorySummaryCountries = async (today, sevenDaysAgo, id) => {
  const {data} = await ch.querying(
      `select geo, countMerge(amount) as counter from dsp.bidrequests_${bidReqCounterCreative} where date between '${sevenDaysAgo}' and '${today}' and publisherId=${id} and wlid='${wlid}'
                  group by geo order by counter desc limit 10
                  `,
  );

  let string = '';
  data.forEach(({geo}) => {
    string += `${geo}, `;
  });
  string = string.slice(0, -2);

  return string;
};

export const taskInventoryCaching = async () => {
  try {
    const today = moment().format('YYYY-MM-DD');
    const sevenDaysAgo = moment().subtract(6, 'day').format('YYYY-MM-DD');
    const publishers = await Publisher.findAll();

    for (const item of publishers) {
      const id = item.get().id;
      let obj = {};

      // main summary
      const mainSummary = await getInventorySummary(today, sevenDaysAgo, id);
      obj = {...obj, ...mainSummary};

      // Dimensions summary
      const InventoryResolution = await getInventorySummaryDimensions(today, sevenDaysAgo, id);
      let dimensions = '';
      for (const cat of InventoryResolution) {
        const width = cat.creativeWidth;
        const height = cat.creativeHeight;
        if (width && height) {
          dimensions += `${width}x${height}, `;
        }
      }
      dimensions = dimensions.slice(0, -2);
      if (dimensions) {
        obj = {...obj, dimensions};
      }

      // Countries summary
      const countries = await getInventorySummaryCountries(today, sevenDaysAgo, id);
      obj = {...obj, countries};
      await redisClient.hmset(`user:${id}:PUBLISHER`, obj);
    }
  } catch (e) {
    console.log(e);
  }
};

export const setRedisClient = (client) => {
  redisClient = client;
};
