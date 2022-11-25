import * as TrafficOptimizationService from '../services/trafficOptimization.service';

class TrafficOptimizationController {
  /**
   * @api {Get} /v1/traffic-optimization/campaigns/sub-ids
   * @apiVersion 1.0
   * @apiGroup TrafficFilters
   * @returns {Array<*>}
   */
  static async getCampaignListOfSubIds(req, res) {
    const {campaignId, publisherId, type, list} = req.query;

    const options = {type, list, campaignId, publisherId};

    try {
      const subIdList = await TrafficOptimizationService.fetchCampaignWBlistedItems(options, req.user);

      res.send({subIdList});
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * @api {Post} /v1/traffic-optimization/campaigns/add/sub-ids
   * @apiVersion 1.0
   * @apiGroup TrafficFilters
   * @returns {Array<*>}
   */
  static async addCampaignSubIdsToList(req, res) {
    const data = req.body;
    try {
      // Update filter rules
      await TrafficOptimizationService.addSubIdsToFilterList(data);

      const defaultParams = {type: data.type};
      const list = await TrafficOptimizationService.fetchCampaignWBlistedItems(defaultParams, req.user);
      res.send({subIdListItem: list});
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * @api {Delete} /v1/traffic-optimization/campaigns/delete/sub-ids
   * @apiVersion 1.0
   * @apiGroup TrafficFilters
   * @returns {Promise<void>}
   */
  static async deleteCampaignSubIds(req, res) {
    try {
      await TrafficOptimizationService.removeCampaignSubIds(req.body);
      res.sendStatus(200);
    } catch (e) {
      console.error(e);
    }
  }

}

module.exports = TrafficOptimizationController;
