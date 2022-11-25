import ch from '../utils/clickhouse';
import {getCampaignImpressionsSql} from '../sql/queries';

/**
 * Get total impressionsfor provided campaigns
 *
 * @param ids - active campaign ids
 */
export const getCampaignImpressions = async (ids) => {
  if (!ids.length) return [];

  try {
    const query = getCampaignImpressionsSql(ids);
    const results = await ch.querying(query);

    return results.data || [];
  } catch (e) {
    console.error(`Can't calculate total impressions for campaigns: [${ids.toString()}]. Error: ${e.message}`);
  }
};
