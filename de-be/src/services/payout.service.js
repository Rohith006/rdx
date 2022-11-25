import {getCampaignPayoutsSql} from '../sql/queries';
import chCluster from '../utils/client/chCluster';
import {logger} from "../../logger/winston";

/**
 * Calculate payout sum for provided campaigns based on time period
 *
 * @param ids - active campaign ids
 * @param period - period of time for selection (if null - get total payout)
 */
export const getCampaignPayouts = async (ids, period) => {
  if (!ids.length) {
    return [];
  }
  try {
    const query = getCampaignPayoutsSql(ids, period);
    const results = await chCluster.querying(query);
    return results.data || [];
  } catch (e) {
    logger.error(`Can't calculate payouts for campaigns: [${ids.toString()}]. Error: ${e.stack}`);
  }
};
