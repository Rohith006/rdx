import format from 'string-format';

import ch from '../../utils/clickhouse';
import {roles} from '../../constants/user';
import * as queries from '../../sql/clickhouse/common.sql';

export const fetchGroupStats = async (params) => {
  const {userId, role, groupId, startDate, endDate} = params;

  // Sub-query to use advertisers' condition
  const template = role === roles.ADVERTISER ?
      queries.GROUPS_BIDDING_STATISTICS_FOR_ADVERTISER :
      queries.GROUPS_BIDDING_STATISTICS_FOR_ADMIN;

  const sqlQuery = format(template, {
    'groupId': groupId,
    'startDate': startDate,
    'endDate': endDate,
    'advertiserId': userId,
  });

  try {
    const {data} = await ch.querying(sqlQuery);
    return data[0];
  } catch (err) {
    console.error(`Get campaigns' stats error (in fetchCampaignStats): ${err}`);
  }
};

export const fetchPublisherSubIdsAndDomains = async (publisherId) => {
  const sqlQuery = format(queries.PUBLISHER_SUB_IDS_AND_DOMAINS, {
    'publisherId': publisherId,
  });

  try {
    const {data} = await ch.querying(sqlQuery);
    return data;
  } catch (err) {
    console.error(`Error fetch subIds and domains for publisher - ${publisherId}: ${err}`);
  }
};
