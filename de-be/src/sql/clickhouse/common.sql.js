import {clickhouse, wlid} from '../../../config';

const {PUBLISHER_SUB_ID_STATS_COUNTER_TABLE} = clickhouse;

export const PUBLISHER_SUB_IDS_AND_DOMAINS = `
    select 
        DISTINCT subId,
        siteDomain 
    from dsp.${PUBLISHER_SUB_ID_STATS_COUNTER_TABLE} 
    where wlid = '${wlid}' and publisherId = {publisherId} and siteDomain!='' and subId!=''`;
